from functools import wraps
from flask import Blueprint, request, jsonify, session, current_app
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from datetime import datetime
from models import User, SystemLog
from extensions import db

# Initialize Flask-Login
login_manager = LoginManager()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({'error': 'Authentication required', 'message': 'يجب تسجيل الدخول للوصول إلى هذه الصفحة'}), 401

# Create auth blueprint
auth_bp = Blueprint('auth', __name__)

def log_activity(action, resource_type=None, resource_id=None, details=None):
    """Log user activity"""
    try:
        log = SystemLog(
            user_id=current_user.id if current_user.is_authenticated else None,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        current_app.logger.error(f"Failed to log activity: {e}")

def require_role(role):
    """Decorator to require specific role"""
    def decorator(f):
        @wraps(f)
        @login_required
        def decorated_function(*args, **kwargs):
            if not current_user.has_role(role):
                return jsonify({
                    'error': 'Insufficient permissions',
                    'message': 'ليس لديك صلاحية للوصول إلى هذه الصفحة'
                }), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        remember = data.get('remember', False)
        
        if not username or not password:
            return jsonify({
                'error': 'Missing credentials',
                'message': 'يرجى إدخال اسم المستخدم وكلمة المرور'
            }), 400
        
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password) and user.is_active:
            login_user(user, remember=remember)
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            log_activity('login', 'user', user.id, f'User {username} logged in')
            
            return jsonify({
                'message': 'تم تسجيل الدخول بنجاح',
                'user': user.to_dict()
            }), 200
        else:
            log_activity('login_failed', 'user', None, f'Failed login attempt for {username}')
            return jsonify({
                'error': 'Invalid credentials',
                'message': 'اسم المستخدم أو كلمة المرور غير صحيحة'
            }), 401
            
    except Exception as e:
        current_app.logger.error(f"Login error: {e}")
        return jsonify({
            'error': 'Login failed',
            'message': 'حدث خطأ أثناء تسجيل الدخول'
        }), 500

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """User logout endpoint"""
    try:
        username = current_user.username
        log_activity('logout', 'user', current_user.id, f'User {username} logged out')
        logout_user()
        
        return jsonify({
            'message': 'تم تسجيل الخروج بنجاح'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Logout error: {e}")
        return jsonify({
            'error': 'Logout failed',
            'message': 'حدث خطأ أثناء تسجيل الخروج'
        }), 500

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    """Get current user information"""
    return jsonify({
        'user': current_user.to_dict()
    }), 200

@auth_bp.route('/change-password', methods=['POST'])
@login_required
def change_password():
    """Change user password"""
    try:
        data = request.get_json()
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({
                'error': 'Missing passwords',
                'message': 'يرجى إدخال كلمة المرور الحالية والجديدة'
            }), 400
        
        if not current_user.check_password(current_password):
            return jsonify({
                'error': 'Invalid current password',
                'message': 'كلمة المرور الحالية غير صحيحة'
            }), 400
        
        if len(new_password) < 8:
            return jsonify({
                'error': 'Password too short',
                'message': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
            }), 400
        
        current_user.set_password(new_password)
        db.session.commit()
        
        log_activity('password_change', 'user', current_user.id, 'Password changed')
        
        return jsonify({
            'message': 'تم تغيير كلمة المرور بنجاح'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Password change error: {e}")
        return jsonify({
            'error': 'Password change failed',
            'message': 'حدث خطأ أثناء تغيير كلمة المرور'
        }), 500

@auth_bp.route('/users', methods=['GET'])
@require_role('admin')
def get_users():
    """Get all users (admin only)"""
    try:
        users = User.query.all()
        return jsonify({
            'users': [user.to_dict() for user in users]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get users error: {e}")
        return jsonify({
            'error': 'Failed to get users',
            'message': 'حدث خطأ أثناء جلب المستخدمين'
        }), 500

@auth_bp.route('/users', methods=['POST'])
@require_role('admin')
def create_user():
    """Create new user (admin only)"""
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'viewer')
        full_name = data.get('full_name')
        department = data.get('department')
        phone = data.get('phone')
        
        if not username or not email or not password:
            return jsonify({
                'error': 'Missing required fields',
                'message': 'يرجى إدخال جميع الحقول المطلوبة'
            }), 400
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            return jsonify({
                'error': 'Username exists',
                'message': 'اسم المستخدم موجود بالفعل'
            }), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({
                'error': 'Email exists',
                'message': 'البريد الإلكتروني موجود بالفعل'
            }), 400
        
        # Create new user
        user = User(
            username=username,
            email=email,
            role=role,
            full_name=full_name,
            department=department,
            phone=phone
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        log_activity('user_create', 'user', user.id, f'Created user {username}')
        
        return jsonify({
            'message': 'تم إنشاء المستخدم بنجاح',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Create user error: {e}")
        db.session.rollback()
        return jsonify({
            'error': 'Failed to create user',
            'message': 'حدث خطأ أثناء إنشاء المستخدم'
        }), 500

@auth_bp.route('/users/<int:user_id>', methods=['PUT'])
@require_role('admin')
def update_user(user_id):
    """Update user (admin only)"""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        # Update fields
        if 'email' in data:
            user.email = data['email']
        if 'role' in data:
            user.role = data['role']
        if 'full_name' in data:
            user.full_name = data['full_name']
        if 'department' in data:
            user.department = data['department']
        if 'phone' in data:
            user.phone = data['phone']
        if 'is_active' in data:
            user.is_active = data['is_active']
        
        db.session.commit()
        
        log_activity('user_update', 'user', user.id, f'Updated user {user.username}')
        
        return jsonify({
            'message': 'تم تحديث المستخدم بنجاح',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Update user error: {e}")
        db.session.rollback()
        return jsonify({
            'error': 'Failed to update user',
            'message': 'حدث خطأ أثناء تحديث المستخدم'
        }), 500

@auth_bp.route('/users/<int:user_id>/reset-password', methods=['POST'])
@require_role('admin')
def reset_user_password(user_id):
    """Reset user password (admin only)"""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        new_password = data.get('new_password')
        
        if not new_password:
            return jsonify({
                'error': 'Missing password',
                'message': 'يرجى إدخال كلمة المرور الجديدة'
            }), 400
        
        if len(new_password) < 8:
            return jsonify({
                'error': 'Password too short',
                'message': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
            }), 400
        
        user.set_password(new_password)
        db.session.commit()
        
        log_activity('password_reset', 'user', user.id, f'Password reset for {user.username}')
        
        return jsonify({
            'message': 'تم إعادة تعيين كلمة المرور بنجاح'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Reset password error: {e}")
        db.session.rollback()
        return jsonify({
            'error': 'Failed to reset password',
            'message': 'حدث خطأ أثناء إعادة تعيين كلمة المرور'
        }), 500

@auth_bp.route('/activity-logs', methods=['GET'])
@require_role('admin')
def get_activity_logs():
    """Get system activity logs (admin only)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        logs = SystemLog.query.order_by(SystemLog.timestamp.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'logs': [log.to_dict() for log in logs.items],
            'total': logs.total,
            'pages': logs.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get activity logs error: {e}")
        return jsonify({
            'error': 'Failed to get activity logs',
            'message': 'حدث خطأ أثناء جلب سجل الأنشطة'
        }), 500

