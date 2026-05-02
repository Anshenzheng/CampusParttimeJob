import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adminAPI } from '../api';

function Navbar({ isAdmin, onLogout }) {
  const location = useLocation();

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
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <span className="logo">🎓</span>
          <span>校园兼职平台</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className={`navbar-link ${isActive('/')}`}>
            首页
          </Link>
          {isAdmin ? (
            <>
              <Link to="/admin" className={`navbar-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>
                管理后台
              </Link>
              <button 
                onClick={handleLogout} 
                className="btn btn-secondary btn-sm"
                style={{ border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                退出登录
              </button>
            </>
          ) : (
            <Link to="/admin/login" className={`navbar-link ${isActive('/admin/login')}`}>
              管理员登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
