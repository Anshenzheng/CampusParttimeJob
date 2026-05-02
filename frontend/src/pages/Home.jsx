import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../api';

function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobAPI.getActive();
      setJobs(response.data);
    } catch (error) {
      console.error('获取岗位列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || job.job_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const jobTypes = ['all', ...new Set(jobs.map(job => job.job_type))];

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
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">校园兼职信息平台</h1>
          <p className="page-subtitle">发现适合你的兼职机会，开启校园生活新篇章</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="搜索岗位名称、公司或地点..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-bar">
          {jobTypes.map(type => (
            <button
              key={type}
              className={`filter-btn ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type === 'all' ? '全部' : type}
            </button>
          ))}
        </div>

        {filteredJobs.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <h3>暂无兼职岗位</h3>
            <p>请稍后再来查看，或尝试调整搜索条件</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.map(job => (
              <Link 
                to={`/job/${job.id}`} 
                key={job.id}
                style={{ textDecoration: 'none' }}
              >
                <div className="card job-card">
                  <span className={`badge badge-active`}>招聘中</span>
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>
                          {job.title}
                        </h3>
                        <span className="badge-type">{job.job_type}</span>
                      </div>
                      <span className="salary-tag">{job.salary}</span>
                    </div>
                    
                    <div className="job-info">
                      <div className="job-info-item">
                        <span>🏢</span>
                        <span>{job.company}</span>
                      </div>
                      <div className="job-info-item">
                        <span>📍</span>
                        <span>{job.location}</span>
                      </div>
                      <div className="job-info-item">
                        <span>📅</span>
                        <span>截止: {job.deadline}</span>
                      </div>
                    </div>

                    <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {job.description}
                    </p>
                  </div>
                  <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: '500' }}>
                      查看详情 →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
