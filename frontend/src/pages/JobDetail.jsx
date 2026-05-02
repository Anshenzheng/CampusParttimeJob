import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jobAPI, messageAPI } from '../api';

function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageForm, setMessageForm] = useState({
    student_name: '',
    student_contact: '',
    content: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchJobDetail();
    fetchMessages();
  }, [id]);

  const fetchJobDetail = async () => {
    try {
      const response = await jobAPI.getById(id);
      setJob(response.data);
    } catch (error) {
      console.error('获取岗位详情失败:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await messageAPI.getByJobId(id);
      setMessages(response.data);
    } catch (error) {
      console.error('获取留言失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMessageForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    
    if (!messageForm.student_name.trim() || !messageForm.content.trim()) {
      alert('请填写姓名和留言内容');
      return;
    }

    setSubmitLoading(true);
    try {
      await messageAPI.create(id, messageForm);
      setSuccessMessage('留言发送成功！');
      setMessageForm({ student_name: '', student_contact: '', content: '' });
      fetchMessages();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('发送留言失败:', error);
      alert('发送失败，请稍后重试');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <div className="empty-state">
          <div className="icon">❌</div>
          <h3>岗位不存在</h3>
          <p>该岗位可能已被删除</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            ← 返回岗位列表
          </Link>
          <h1 className="page-title">{job.title}</h1>
          <p className="page-subtitle">{job.company}</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
        <div className="job-detail">
          <div className="job-detail-header">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏢</span>
                <span style={{ color: 'var(--text-secondary)' }}>公司：</span>
                <span style={{ fontWeight: '500' }}>{job.company}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📍</span>
                <span style={{ color: 'var(--text-secondary)' }}>地点：</span>
                <span style={{ fontWeight: '500' }}>{job.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>💰</span>
                <span style={{ color: 'var(--text-secondary)' }}>薪资：</span>
                <span className="salary-tag" style={{ fontSize: '1rem', padding: '6px 12px' }}>{job.salary}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📋</span>
                <span style={{ color: 'var(--text-secondary)' }}>类型：</span>
                <span className="badge-type">{job.job_type}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📅</span>
                <span style={{ color: 'var(--text-secondary)' }}>截止日期：</span>
                <span style={{ fontWeight: '500' }}>{job.deadline}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📞</span>
                <span style={{ color: 'var(--text-secondary)' }}>联系方式：</span>
                <span style={{ fontWeight: '500' }}>{job.contact}</span>
              </div>
            </div>
          </div>

          <div className="job-detail-content">
            <div style={{ marginBottom: '32px' }}>
              <h3 className="section-title">岗位描述</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                {job.description}
              </p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h3 className="section-title">任职要求</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                {job.requirements}
              </p>
            </div>
          </div>
        </div>

        <div className="message-list">
          <h3 className="section-title">留言咨询</h3>
          
          {messages.length > 0 ? (
            messages.map(msg => (
              <div key={msg.id}>
                <div className="message-item">
                  <div className="message-header">
                    <span className="message-author">{msg.student_name}</span>
                    <span className="message-time">{msg.created_at}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {msg.content}
                  </p>
                  {msg.student_contact && (
                    <p style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                      联系方式：{msg.student_contact}
                    </p>
                  )}
                </div>
                {msg.reply && (
                  <div className="message-item reply">
                    <div className="message-header">
                      <span className="message-author">管理员回复</span>
                      <span className="message-time">{msg.replied_at}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      {msg.reply}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="icon" style={{ fontSize: '3rem' }}>💬</div>
              <h3>暂无留言</h3>
              <p>成为第一个咨询的人吧</p>
            </div>
          )}
        </div>

        <div className="message-form">
          <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '600' }}>发表留言</h3>
          
          {successMessage && (
            <div className="alert alert-success" style={{ marginBottom: '20px' }}>
              ✅ {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmitMessage}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">姓名 *</label>
                <input
                  type="text"
                  name="student_name"
                  className="form-input"
                  placeholder="请输入您的姓名"
                  value={messageForm.student_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">联系方式</label>
                <input
                  type="text"
                  name="student_contact"
                  className="form-input"
                  placeholder="手机号或邮箱（选填）"
                  value={messageForm.student_contact}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">留言内容 *</label>
              <textarea
                name="content"
                className="form-textarea"
                placeholder="请输入您的问题或咨询内容..."
                value={messageForm.content}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitLoading}
            >
              {submitLoading ? '发送中...' : '提交留言'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default JobDetail;
