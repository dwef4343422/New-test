import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_login import login_required
from extensions import db
from models import User, FAQ, DrugAlert, EducationalContent, SystemLog

from auth import login_manager, auth_bp
from routes_hybrid import api_bp, user_bp, pharma_bp
from config import config
from google_sheets_service import init_sheets_service

def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get("FLASK_ENV", "production")
    
    app = Flask(__name__, static_folder="static")
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    # Initialize extensions
    CORS(app, supports_credentials=True)
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"
    login_manager.login_message = "يجب تسجيل الدخول للوصول إلى هذه الصفحة"
    login_manager.login_message_category = "info"
    
    # Initialize Google Sheets service (deferred initialization)
    def initialize_services():
        if not hasattr(app, '_services_initialized'):
            try:
                sheets_service = init_sheets_service()
                if sheets_service.is_available():
                    app.logger.info("Google Sheets service initialized successfully")
                else:
                    app.logger.warning("Google Sheets service not available - reports will not be saved")
                app._services_initialized = True
            except Exception as e:
                app.logger.error(f"Failed to initialize Google Sheets service: {e}")
                app._services_initialized = True
    
    # Call initialization on first request
    @app.before_request
    def before_first_request():
        initialize_services()
        initialize_database()
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(user_bp, url_prefix="/user")
    app.register_blueprint(pharma_bp, url_prefix="/pharma")
    
    # Health check endpoint
    @app.route("/health")
    def health_check():
        # Check both PostgreSQL and Google Sheets status
        db_status = "connected"
        try:
            db.session.execute("SELECT 1")
        except Exception:
            db_status = "disconnected"
        
        sheets_status = "connected"
        try:
            from google_sheets_service import get_sheets_service
            sheets_service = get_sheets_service()
            if not sheets_service.is_available():
                sheets_status = "disconnected"
        except Exception:
            sheets_status = "error"
        
        return jsonify({
            "status": "healthy",
            "service": "pharmacovigilance-iraq-hybrid",
            "database": {
                "postgresql": db_status,
                "google_sheets": sheets_status
            }
        }), 200
    
    # Serve static files and handle routing
    @app.route("/")
    def serve_index():
        return send_from_directory(app.static_folder, "index.html")
    
    @app.route("/login")
    def serve_login():
        return send_from_directory(app.static_folder, "login.html")
    
    @app.route("/dashboard")
    @login_required
    def serve_dashboard():
        return send_from_directory(app.static_folder, "dashboard.html")
    
    @app.route("/<path:path>")
    def serve_static(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, "index.html")
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Not found", "message": "الصفحة غير موجودة"}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({"error": "Internal server error", "message": "حدث خطأ في الخادم"}), 500
    
    # Initialize database and create admin user (deferred initialization)
    def initialize_database():
        if not hasattr(app, '_database_initialized'):
            db.create_all()
            
            # Create default admin user if it doesn't exist
            admin_user = User.query.filter_by(username='admin').first()
            if not admin_user:
                admin_user = User(
                    username='admin',
                    email='admin@pharmacovigilance.iq',
                    role='admin',
                    full_name='مدير النظام',
                    department='إدارة النظام'
                )
                admin_user.set_password(os.environ.get('ADMIN_PASSWORD', 'admin123'))
                db.session.add(admin_user)
                db.session.commit()
                app.logger.info("Default admin user created")
            
            # Seed FAQ data if tables are empty (only PostgreSQL data)
            if FAQ.query.count() == 0:
                try:
                    from seed_data_hybrid import seed_database
                    seed_database()
                    app.logger.info("Database seeded successfully")
                except ImportError:
                    app.logger.warning("seed_data_hybrid module not found, skipping seeding")
                except Exception as e:
                    app.logger.error(f"Error seeding database: {e}")
            
            app._database_initialized = True
    
    
    return app

# Create application instance for WSGI
app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)

