from flask import Flask, request, jsonify, session
from flask_cors import CORS
from datetime import datetime, timedelta
from functools import wraps
from config import Config
from models import db, ParttimeJob, Message

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, supports_credentials=True)
db.init_app(app)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return jsonify({'error': '需要管理员登录'}), 401
        return f(*args, **kwargs)
    return decorated_function

with app.app_context():
    db.create_all()
    jobs = ParttimeJob.query.count()
    if jobs == 0:
        sample_jobs = [
            ParttimeJob(
                title='校园图书馆助理',
                company='XX大学图书馆',
                location='图书馆二楼',
                salary='15元/小时',
                job_type='校内兼职',
                description='负责图书整理、读者咨询、书架维护等工作',
                requirements='1. 热爱读书，工作认真负责\n2. 每周至少能工作10小时\n3. 有图书馆工作经验优先',
                contact='李老师 13800138000',
                deadline=datetime.now() + timedelta(days=30),
                is_active=True
            ),
            ParttimeJob(
                title='校园快递分拣员',
                company='校园快递中心',
                location='学生活动中心旁',
                salary='20元/小时',
                job_type='校内兼职',
                description='负责快递件的分拣、扫描、入库等工作',
                requirements='1. 工作细心，手脚麻利\n2. 能适应站立工作\n3. 下午和晚上有空优先',
                contact='张经理 13900139000',
                deadline=datetime.now() + timedelta(days=20),
                is_active=True
            ),
            ParttimeJob(
                title='家教老师（初中数学）',
                company='个人家教',
                location='市区某小区',
                salary='80元/小时',
                job_type='校外家教',
                description='辅导初中学生数学，每周2-3次，每次2小时',
                requirements='1. 数学成绩优秀，有家教经验优先\n2. 耐心细致，善于沟通\n3. 师范类专业优先',
                contact='王女士 13700137000',
                deadline=datetime.now() + timedelta(days=15),
                is_active=True
            )
        ]
        for job in sample_jobs:
            db.session.add(job)
        db.session.commit()

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if username == app.config['ADMIN_USERNAME'] and password == app.config['ADMIN_PASSWORD']:
        session['admin_logged_in'] = True
        return jsonify({'message': '登录成功', 'success': True}), 200
    else:
        return jsonify({'error': '用户名或密码错误', 'success': False}), 401

@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('admin_logged_in', None)
    return jsonify({'message': '登出成功'}), 200

@app.route('/api/admin/check', methods=['GET'])
def check_admin_login():
    if session.get('admin_logged_in'):
        return jsonify({'logged_in': True}), 200
    else:
        return jsonify({'logged_in': False}), 401

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    jobs = ParttimeJob.query.order_by(ParttimeJob.created_at.desc()).all()
    return jsonify([job.to_dict() for job in jobs]), 200

@app.route('/api/jobs/active', methods=['GET'])
def get_active_jobs():
    jobs = ParttimeJob.query.filter_by(is_active=True).order_by(ParttimeJob.created_at.desc()).all()
    return jsonify([job.to_dict() for job in jobs]), 200

@app.route('/api/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    job = ParttimeJob.query.get_or_404(job_id)
    return jsonify(job.to_dict()), 200

@app.route('/api/admin/jobs', methods=['POST'])
@admin_required
def create_job():
    data = request.get_json()
    
    try:
        deadline = datetime.strptime(data.get('deadline'), '%Y-%m-%d')
    except (ValueError, TypeError):
        return jsonify({'error': '日期格式错误'}), 400
    
    job = ParttimeJob(
        title=data.get('title'),
        company=data.get('company'),
        location=data.get('location'),
        salary=data.get('salary'),
        job_type=data.get('job_type'),
        description=data.get('description'),
        requirements=data.get('requirements'),
        contact=data.get('contact'),
        deadline=deadline,
        is_active=True
    )
    
    db.session.add(job)
    db.session.commit()
    
    return jsonify({'message': '岗位创建成功', 'job': job.to_dict()}), 201

@app.route('/api/admin/jobs/<int:job_id>', methods=['PUT'])
@admin_required
def update_job(job_id):
    job = ParttimeJob.query.get_or_404(job_id)
    data = request.get_json()
    
    job.title = data.get('title', job.title)
    job.company = data.get('company', job.company)
    job.location = data.get('location', job.location)
    job.salary = data.get('salary', job.salary)
    job.job_type = data.get('job_type', job.job_type)
    job.description = data.get('description', job.description)
    job.requirements = data.get('requirements', job.requirements)
    job.contact = data.get('contact', job.contact)
    
    if data.get('deadline'):
        try:
            job.deadline = datetime.strptime(data.get('deadline'), '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': '日期格式错误'}), 400
    
    db.session.commit()
    
    return jsonify({'message': '岗位更新成功', 'job': job.to_dict()}), 200

@app.route('/api/admin/jobs/<int:job_id>/toggle', methods=['POST'])
@admin_required
def toggle_job(job_id):
    job = ParttimeJob.query.get_or_404(job_id)
    job.is_active = not job.is_active
    db.session.commit()
    
    status = '上架' if job.is_active else '下架'
    return jsonify({'message': f'岗位已{status}', 'job': job.to_dict()}), 200

@app.route('/api/admin/jobs/<int:job_id>', methods=['DELETE'])
@admin_required
def delete_job(job_id):
    job = ParttimeJob.query.get_or_404(job_id)
    db.session.delete(job)
    db.session.commit()
    
    return jsonify({'message': '岗位删除成功'}), 200

@app.route('/api/jobs/<int:job_id>/messages', methods=['POST'])
def create_message(job_id):
    job = ParttimeJob.query.get_or_404(job_id)
    data = request.get_json()
    
    message = Message(
        job_id=job_id,
        student_name=data.get('student_name'),
        student_contact=data.get('student_contact'),
        content=data.get('content')
    )
    
    db.session.add(message)
    db.session.commit()
    
    return jsonify({'message': '留言发送成功', 'message_data': message.to_dict()}), 201

@app.route('/api/jobs/<int:job_id>/messages', methods=['GET'])
def get_job_messages(job_id):
    messages = Message.query.filter_by(job_id=job_id).order_by(Message.created_at.desc()).all()
    return jsonify([msg.to_dict() for msg in messages]), 200

@app.route('/api/admin/messages', methods=['GET'])
@admin_required
def get_all_messages():
    messages = Message.query.order_by(Message.created_at.desc()).all()
    return jsonify([msg.to_dict() for msg in messages]), 200

@app.route('/api/admin/messages/<int:message_id>', methods=['GET'])
@admin_required
def get_message(message_id):
    message = Message.query.get_or_404(message_id)
    message.is_read = True
    db.session.commit()
    return jsonify(message.to_dict()), 200

@app.route('/api/admin/messages/<int:message_id>/reply', methods=['POST'])
@admin_required
def reply_message(message_id):
    message = Message.query.get_or_404(message_id)
    data = request.get_json()
    
    message.reply = data.get('reply')
    message.is_replied = True
    message.replied_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({'message': '回复成功', 'message_data': message.to_dict()}), 200

@app.route('/api/admin/messages/unread-count', methods=['GET'])
@admin_required
def get_unread_count():
    count = Message.query.filter_by(is_read=False).count()
    return jsonify({'count': count}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
