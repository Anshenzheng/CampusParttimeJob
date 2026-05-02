import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import JobDetail from './pages/JobDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Footer from './components/Footer';
import { adminAPI } from './api';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      await adminAPI.check();
      setIsAdmin(true);
    } catch (error) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAdmin(true);
  };

  const handleLogout = () => {
    setIsAdmin(false);
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
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar isAdmin={isAdmin} onLogout={handleLogout} />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/job/:id" element={<JobDetail />} />
            <Route 
              path="/admin/login" 
              element={
                isAdmin ? 
                  <Navigate to="/admin" replace /> : 
                  <AdminLogin onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/admin/*" 
              element={
                isAdmin ? 
                  <AdminDashboard onLogout={handleLogout} /> : 
                  <Navigate to="/admin/login" replace />
              } 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
