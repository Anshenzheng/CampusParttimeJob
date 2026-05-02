import React, { useState, useEffect } from 'react';
import { messageAPI } from '../api';

function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await messageAPI.getAll();
      setMessages(response.data);
    } catch (error) {
      console.error('获取留言列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewMessage = async (message) => {
    setSelectedMessage(message);
    setReplyContent('');
    
    if (!message.is_read) {
      try {
        await messageAPI.getById(message.id);
        fetchMessages();
      } catch (error) {
        console.error('标记已读失败:', error);
      }
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      alert('请输入回复内容');
      return;
    }

    setSubmitLoading(true);
    try {
      await messageAPI.reply(selectedMessage.id, { reply: replyContent });
      setSuccessMessage('回复成功！');
      setSelectedMessage(null);
      setReplyContent('');
      fetchMessages();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('回复失败:', error);
      alert('回复失败，请稍后重试');
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

  return (
    <div>
      <div className="admin-header">
        <h1>留言管理</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            未读：<span style={{ color: 'var(--danger-color)', fontWeight: '600' }}>
              {messages.filter(m => !m.is_read).length}
            </span>
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>
          ✅ {successMessage}
        </div>
      )}

      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="icon">💬</div>
          <h3>暂无留言</h3>
          <p>学生还没有发送留言</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedMessage ? '1fr 400px' : '1fr', gap: '24px' }}>
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th>状态</th>
                  <th>留言者</th>
                  <th>联系方式</th>
                  <th>留言时间</th>
                  <th>是否回复</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {messages.map(msg => (
                  <tr 
                    key={msg.id} 
                    style={{ 
                      cursor: 'pointer',
                      background: selectedMessage?.id === msg.id ? 'var(--bg-secondary)' : undefined
                    }}
                    onClick={() => viewMessage(msg)}
                  >
                    <td>
                      <span className={`badge ${msg.is_read ? 'badge-inactive' : 'badge-active'}`}
                        style={{ position: 'static', display: 'inline-block' }}>
                        {msg.is_read ? '已读' : '未读'}
                      </span>
                    </td>
                    <td style={{ fontWeight: '500' }}>{msg.student_name}</td>
                    <td>{msg.student_contact || '-'}</td>
                    <td>{msg.created_at}</td>
                    <td>
                      {msg.is_replied ? (
                        <span style={{ color: 'var(--success-color)', fontWeight: '500' }}>已回复</span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>待回复</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-primary btn-sm">
                          查看详情
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedMessage && (
            <div className="card" style={{ position: 'sticky', top: '30px' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title">留言详情</h3>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="modal-close"
                  style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>
              <div className="card-body">
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    留言者：<span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{selectedMessage.student_name}</span>
                  </p>
                  {selectedMessage.student_contact && (
                    <p style={{ marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      联系方式：<span style={{ color: 'var(--text-primary)' }}>{selectedMessage.student_contact}</span>
                    </p>
                  )}
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    留言时间：{selectedMessage.created_at}
                  </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontWeight: '500', marginBottom: '8px' }}>留言内容：</p>
                  <div style={{ 
                    background: 'var(--bg-secondary)', 
                    padding: '16px', 
                    borderRadius: 'var(--radius-md)',
                    lineHeight: '1.8'
                  }}>
                    {selectedMessage.content}
                  </div>
                </div>

                {selectedMessage.reply && (
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontWeight: '500', marginBottom: '8px', color: 'var(--success-color)' }}>
                      管理员回复：
                    </p>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
                      padding: '16px', 
                      borderRadius: 'var(--radius-md)',
                      borderLeft: '4px solid var(--success-color)',
                      lineHeight: '1.8'
                    }}>
                      {selectedMessage.reply}
                      <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        回复时间：{selectedMessage.replied_at}
                      </p>
                    </div>
                  </div>
                )}

                {!selectedMessage.is_replied && (
                  <form onSubmit={handleReply}>
                    <div className="form-group">
                      <label className="form-label">回复内容</label>
                      <textarea
                        className="form-textarea"
                        placeholder="请输入回复内容..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      disabled={submitLoading}
                    >
                      {submitLoading ? '发送中...' : '发送回复'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminMessages;
