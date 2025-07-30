from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db

class User(UserMixin, db.Model):
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default="user")
    full_name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    # Security enhancements
    failed_login_attempts = db.Column(db.Integer, default=0)
    last_failed_login = db.Column(db.DateTime)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# Standardized Adverse Reaction Report Model
class AdverseReactionReport(db.Model):
    __tablename__ = "adverse_reaction_reports"
    
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.String(50), unique=True, nullable=False)
    
    # Patient Information (standardized field names)
    patient_age = db.Column(db.Integer)
    patient_gender = db.Column(db.String(20))
    patient_weight = db.Column(db.Float)
    patient_height = db.Column(db.Float)
    medical_history = db.Column(db.Text)
    
    # Drug Information (standardized field names)
    drug_name = db.Column(db.String(200), nullable=False)
    drug_manufacturer = db.Column(db.String(200))
    drug_batch = db.Column(db.String(100))  # Standardized as 'drug_batch'
    drug_dosage = db.Column(db.String(100))
    drug_route = db.Column(db.String(100))
    drug_indication = db.Column(db.Text)
    drug_start_date = db.Column(db.Date)
    
    # Reaction Information (standardized field names)
    reaction_description = db.Column(db.Text, nullable=False)
    reaction_severity = db.Column(db.String(50))
    reaction_start_date = db.Column(db.Date)
    reaction_end_date = db.Column(db.Date)
    actions_taken = db.Column(db.Text)
    concomitant_medications = db.Column(db.Text)
    
    # Reporter Information (standardized field names)
    reporter_name = db.Column(db.String(200), nullable=False)
    reporter_email = db.Column(db.String(200), nullable=False)
    reporter_phone = db.Column(db.String(50), nullable=False)
    reporter_profession = db.Column(db.String(100))
    
    # Location Information (standardized field names)
    governorate = db.Column(db.String(100))
    city = db.Column(db.String(100))
    pharmacy_name = db.Column(db.String(200))
    pharmacy_address = db.Column(db.Text)
    
    # System fields
    status = db.Column(db.String(50), default="pending")
    priority = db.Column(db.String(50), default="normal")
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    updated_date = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    assigned_to = db.Column(db.String(200))
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            "id": self.id,
            "report_id": self.report_id,
            "patient_age": self.patient_age,
            "patient_gender": self.patient_gender,
            "patient_weight": self.patient_weight,
            "patient_height": self.patient_height,
            "medical_history": self.medical_history,
            "drug_name": self.drug_name,
            "drug_manufacturer": self.drug_manufacturer,
            "drug_batch": self.drug_batch,
            "drug_dosage": self.drug_dosage,
            "drug_route": self.drug_route,
            "drug_indication": self.drug_indication,
            "drug_start_date": self.drug_start_date.isoformat() if self.drug_start_date else None,
            "reaction_description": self.reaction_description,
            "reaction_severity": self.reaction_severity,
            "reaction_start_date": self.reaction_start_date.isoformat() if self.reaction_start_date else None,
            "reaction_end_date": self.reaction_end_date.isoformat() if self.reaction_end_date else None,
            "actions_taken": self.actions_taken,
            "concomitant_medications": self.concomitant_medications,
            "reporter_name": self.reporter_name,
            "reporter_email": self.reporter_email,
            "reporter_phone": self.reporter_phone,
            "reporter_profession": self.reporter_profession,
            "governorate": self.governorate,
            "city": self.city,
            "pharmacy_name": self.pharmacy_name,
            "pharmacy_address": self.pharmacy_address,
            "status": self.status,
            "priority": self.priority,
            "created_date": self.created_date.isoformat() if self.created_date else None,
            "updated_date": self.updated_date.isoformat() if self.updated_date else None,
            "assigned_to": self.assigned_to,
            "notes": self.notes
        }