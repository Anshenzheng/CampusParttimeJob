from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class ParttimeJob(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    salary = db.Column(db.String(50), nullable=False)
    job_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text, nullable=False)
    contact = db.Column(db.String(100), nullable=False)
    deadline = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    messages = db.relationship('Message', backref='job', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'salary': self.salary,
            'job_type': self.job_type,
            'description': self.description,
            'requirements': self.requirements,
            'contact': self.contact,
            'deadline': self.deadline.strftime('%Y-%m-%d'),
            'is_active': self.is_active,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('parttime_job.id'), nullable=False)
    student_name = db.Column(db.String(50), nullable=False)
    student_contact = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    reply = db.Column(db.Text, nullable=True)
    is_read = db.Column(db.Boolean, default=False)
    is_replied = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    replied_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'job_id': self.job_id,
            'student_name': self.student_name,
            'student_contact': self.student_contact,
            'content': self.content,
            'reply': self.reply,
            'is_read': self.is_read,
            'is_replied': self.is_replied,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'replied_at': self.replied_at.strftime('%Y-%m-%d %H:%M:%S') if self.replied_at else None
        }
