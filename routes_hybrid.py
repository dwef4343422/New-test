from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from extensions import db
from models import User, FAQ, DrugAlert, EducationalContent, SystemLog
from google_sheets_service import get_sheets_service

api_bp = Blueprint("api", __name__)
user_bp = Blueprint("user", __name__)
pharma_bp = Blueprint("pharma", __name__)

# API Routes
@api_bp.route("/faqs", methods=["GET"])
def get_faqs():
    faqs = FAQ.query.all()
    return jsonify([faq.to_dict() for faq in faqs])

@api_bp.route("/drug_alerts", methods=["GET"])
def get_drug_alerts():
    alerts = DrugAlert.query.all()
    return jsonify([alert.to_dict() for alert in alerts])

@api_bp.route("/educational_content", methods=["GET"])
def get_educational_content():
    content = EducationalContent.query.all()
    return jsonify([item.to_dict() for item in content])

# User Routes
@user_bp.route("/profile", methods=["GET"])
@login_required
def user_profile():
    return jsonify(current_user.to_dict())

# Pharma Routes
@pharma_bp.route("/submit_adverse_reaction", methods=["POST"])
@login_required
def submit_adverse_reaction():
    data = request.get_json()
    sheets_service = get_sheets_service()
    if sheets_service.add_adverse_reaction(data):
        return jsonify({"message": "Adverse reaction report submitted successfully"}), 200
    else:
        return jsonify({"error": "Failed to submit adverse reaction report"}), 500

# Public endpoint for anonymous report submissions
@api_bp.route("/submit_report", methods=["POST"])
def submit_public_report():
    """Public endpoint for submitting adverse reaction reports without authentication"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Basic validation
        required_fields = ['drug_name', 'reaction_description']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400
        
        # Add submission timestamp and source
        data['submission_source'] = 'public_form'
        data['submission_timestamp'] = request.headers.get('X-Timestamp', '')
        
        sheets_service = get_sheets_service()
        
        if not sheets_service or not sheets_service.is_available():
            return jsonify({
                "error": "Report submission service is currently unavailable. Please try again later."
            }), 503
        
        if sheets_service.add_adverse_reaction(data):
            return jsonify({
                "message": "تم إرسال التقرير بنجاح! شكراً لمساهمتك في تحسين سلامة الأدوية.",
                "report_id": data.get('id', 'N/A')
            }), 200
        else:
            return jsonify({
                "error": "فشل في إرسال التقرير. يرجى المحاولة مرة أخرى."
            }), 500
            
    except Exception as e:
        print(f"Error in submit_public_report: {e}")
        return jsonify({
            "error": "حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً."
        }), 500

@pharma_bp.route("/submit_intruder_report", methods=["POST"])
@login_required
def submit_intruder_report():
    data = request.get_json()
    sheets_service = get_sheets_service()
    if sheets_service.add_intruder_report(data):
        return jsonify({"message": "Intruder report submitted successfully"}), 200
    else:
        return jsonify({"error": "Failed to submit intruder report"}), 500

@pharma_bp.route("/reports_summary", methods=["GET"])
@login_required
def reports_summary():
    sheets_service = get_sheets_service()
    summary = sheets_service.get_reports_summary()
    return jsonify(summary)

@pharma_bp.route("/adverse_reactions", methods=["GET"])
@login_required
def get_adverse_reactions_reports():
    filters = request.args.to_dict()
    sheets_service = get_sheets_service()
    reports = sheets_service.get_adverse_reactions(filters)
    return jsonify(reports)

@pharma_bp.route("/intruder_reports", methods=["GET"])
@login_required
def get_intruder_reports_data():
    filters = request.args.to_dict()
    sheets_service = get_sheets_service()
    reports = sheets_service.get_intruder_reports(filters)
    return jsonify(reports)

@pharma_bp.route("/update_report_status", methods=["POST"])
@login_required
def update_report_status():
    data = request.get_json()
    sheet_name = data.get("sheet_name")
    report_id = data.get("report_id")
    status = data.get("status")
    
    if not all([sheet_name, report_id, status]):
        return jsonify({"error": "Missing sheet_name, report_id, or status"}), 400
    
    sheets_service = get_sheets_service()
    if sheets_service.update_report_status(sheet_name, report_id, status):
        return jsonify({"message": "Report status updated successfully"}), 200
    else:
        return jsonify({"error": "Failed to update report status"}), 500

@pharma_bp.route("/statistics", methods=["GET"])
def get_statistics():
    """Get basic statistics for the dashboard from Google Sheets"""
    try:
        sheets_service = get_sheets_service()
        
        # Initialize default stats
        stats = {
            "total_adverse_reports": 0,
            "total_intruder_reports": 0,
            "pending_adverse_reports": 0,
            "pending_intruder_reports": 0,
            "under_review_adverse_reports": 0,
            "reviewed_adverse_reports": 0,
            "closed_adverse_reports": 0,
            "investigating_intruder_reports": 0,
            "verified_intruder_reports": 0,
            "closed_intruder_reports": 0
        }
        
        if sheets_service and sheets_service.is_available():
            try:
                # Get summary from Google Sheets with error handling
                summary = sheets_service.get_reports_summary()
                
                if summary and 'adverse_reactions' in summary:
                    adverse_data = summary['adverse_reactions']
                    stats.update({
                        "total_adverse_reports": adverse_data.get('total', 0),
                        "pending_adverse_reports": adverse_data.get('pending', 0),
                        "under_review_adverse_reports": adverse_data.get('under_review', 0),
                        "reviewed_adverse_reports": adverse_data.get('reviewed', 0),
                        "closed_adverse_reports": adverse_data.get('closed', 0)
                    })
                
                if summary and 'intruder_reports' in summary:
                    intruder_data = summary['intruder_reports']
                    stats.update({
                        "total_intruder_reports": intruder_data.get('total', 0),
                        "pending_intruder_reports": intruder_data.get('pending', 0),
                        "investigating_intruder_reports": intruder_data.get('investigating', 0),
                        "verified_intruder_reports": intruder_data.get('verified', 0),
                        "closed_intruder_reports": intruder_data.get('closed', 0)
                    })
                    
            except Exception as sheets_error:
                # Log the error but return default stats instead of failing
                print(f"Error getting Google Sheets summary: {sheets_error}")
        
        return jsonify(stats)
        
    except Exception as e:
        print(f"Error in get_statistics: {e}")
        # Return default stats instead of error to prevent dashboard crash
        return jsonify({
            "total_adverse_reports": 0,
            "total_intruder_reports": 0,
            "pending_adverse_reports": 0,
            "pending_intruder_reports": 0,
            "under_review_adverse_reports": 0,
            "reviewed_adverse_reports": 0,
            "closed_adverse_reports": 0,
            "investigating_intruder_reports": 0,
            "verified_intruder_reports": 0,
            "closed_intruder_reports": 0
        })

