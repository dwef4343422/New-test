from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')
    full_name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def has_role(self, role):
        roles_hierarchy = {
            'user': 1,
            'pharmacist': 2,
            'admin': 3
        }
        user_level = roles_hierarchy.get(self.role, 0)
        required_level = roles_hierarchy.get(role, 0)
        return user_level >= required_level
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'full_name': self.full_name,
            'department': self.department,
            'phone': self.phone,
            'is_active': self.is_active,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class SystemLog(db.Model):
    __tablename__ = 'system_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    action = db.Column(db.String(100), nullable=False)
    resource_type = db.Column(db.String(50))
    resource_id = db.Column(db.String(50))
    details = db.Column(db.Text)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='system_logs')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else None,
            'action': self.action,
            'resource_type': self.resource_type,
            'resource_id': self.resource_id,
            'details': self.details,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class FAQ(db.Model):
    __tablename__ = 'faqs'
    
    id = db.Column(db.Integer, primary_key=True)
    question_ar = db.Column(db.Text, nullable=False)
    question_en = db.Column(db.Text)
    question_ku = db.Column(db.Text)
    answer_ar = db.Column(db.Text, nullable=False)
    answer_en = db.Column(db.Text)
    answer_ku = db.Column(db.Text)
    category = db.Column(db.String(50))
    is_active = db.Column(db.Boolean, default=True)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    updated_date = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'question_ar': self.question_ar,
            'question_en': self.question_en,
            'question_ku': self.question_ku,
            'answer_ar': self.answer_ar,
            'answer_en': self.answer_en,
            'answer_ku': self.answer_ku,
            'category': self.category,
            'is_active': self.is_active,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'updated_date': self.updated_date.isoformat() if self.updated_date else None
        }

class DrugAlert(db.Model):
    __tablename__ = 'drug_alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    title_ar = db.Column(db.String(200), nullable=False)
    title_en = db.Column(db.String(200))
    title_ku = db.Column(db.String(200))
    content_ar = db.Column(db.Text, nullable=False)
    content_en = db.Column(db.Text)
    content_ku = db.Column(db.Text)
    alert_type = db.Column(db.String(50))
    severity = db.Column(db.String(20))
    drug_name = db.Column(db.String(200))
    manufacturer = db.Column(db.String(200))
    batch_numbers = db.Column(db.Text)
    expiry_date = db.Column(db.Date)
    is_active = db.Column(db.Boolean, default=True)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    updated_date = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    creator = db.relationship('User', backref='created_alerts')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title_ar': self.title_ar,
            'title_en': self.title_en,
            'title_ku': self.title_ku,
            'content_ar': self.content_ar,
            'content_en': self.content_en,
            'content_ku': self.content_ku,
            'alert_type': self.alert_type,
            'severity': self.severity,
            'drug_name': self.drug_name,
            'manufacturer': self.manufacturer,
            'batch_numbers': self.batch_numbers,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'is_active': self.is_active,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'updated_date': self.updated_date.isoformat() if self.updated_date else None,
            'created_by': self.created_by
        }

class EducationalContent(db.Model):
    __tablename__ = 'educational_content'
    
    id = db.Column(db.Integer, primary_key=True)
    title_ar = db.Column(db.String(200), nullable=False)
    title_en = db.Column(db.String(200))
    title_ku = db.Column(db.String(200))
    content_ar = db.Column(db.Text, nullable=False)
    content_en = db.Column(db.Text)
    content_ku = db.Column(db.Text)
    category = db.Column(db.String(50))
    target_audience = db.Column(db.String(50))
    is_active = db.Column(db.Boolean, default=True)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    updated_date = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    creator = db.relationship('User', backref='created_content')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title_ar': self.title_ar,
            'title_en': self.title_en,
            'title_ku': self.title_ku,
            'content_ar': self.content_ar,
            'content_en': self.content_en,
            'content_ku': self.content_ku,
            'category': self.category,
            'target_audience': self.target_audience,
            'is_active': self.is_active,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'updated_date': self.updated_date.isoformat() if self.updated_date else None,
            'created_by': self.created_by
        }
