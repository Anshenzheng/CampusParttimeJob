import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { adminAPI } from '../api';
import AdminJobs from './AdminJobs';
import AdminMessages from './AdminMessages';

function AdminDashboard({ onLogout }) {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await adminAPI.check();
      if (response.status === 200) {
        try {
          const countResponse = await adminAPI.getUnreadCount?.();
          if (countResponse) {
            setUnreadCount(countResponse.data.count);
          }
        } catch (err) {
          console.log('获取未读消息数量失败');
        }
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await adminAPI.logout();
      onLogout();
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <Link 
          to="/admin" 
          className={`admin-sidebar-link ${isActive('/admin')}`}
        >
          <span>📋</span>
          <span>岗位管理</span>
        </Link>
        <Link 
          to="/admin/messages" 
          className={`admin-sidebar-link ${isActive('/admin/messages')}`}
          style={{ position: 'relative' }}
        >
          <span>💬</span>
          <span>留言管理</span>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              right: '24px',
              background: 'var(--danger-color)',
              color: 'white',
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: '10px',
              minWidth: '20px',
              textAlign: 'center'
            }}>
              {unreadCount}
            </span>
          )}
        </Link>
        <div style={{ marginTop: 'auto', padding: '0 24px' }}>
          <button 
            onClick={handleLogout}
            className="admin-sidebar-link"
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <span>🚪</span>
            <span>退出登录</span>
          </button>
        </div>
      </div>

      <div className="admin-content">
        <Routes>
          <Route path="/" element={<AdminJobs />} />
          <Route path="messages" element={<AdminMessages />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminDashboard;
