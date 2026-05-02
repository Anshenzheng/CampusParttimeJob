import React, { useState, useEffect } from 'react';
import { jobAPI } from '../api';

function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    job_type: '校内兼职',
    description: '',
    requirements: '',
    contact: '',
    deadline: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobAPI.getAll();
      setJobs(response.data);
    } catch (error) {
      console.error('获取岗位列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      company: '',
      location: '',
      salary: '',
      job_type: '校内兼职',
      description: '',
      requirements: '',
      contact: '',
      deadline: ''
    });
    setShowModal(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      job_type: job.job_type,
      description: job.description,
      requirements: job.requirements,
      contact: job.contact,
      deadline: job.deadline
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      if (editingJob) {
        await jobAPI.update(editingJob.id, formData);
        setSuccessMessage('岗位更新成功！');
      } else {
        await jobAPI.create(formData);
        setSuccessMessage('岗位创建成功！');
      }
      
      setShowModal(false);
      fetchJobs();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请稍后重试');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggle = async (jobId) => {
    try {
      await jobAPI.toggle(jobId);
      fetchJobs();
    } catch (error) {
      console.error('切换状态失败:', error);
      alert('操作失败，请稍后重试');
    }
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('确定要删除这个岗位吗？')) {
      try {
        await jobAPI.delete(jobId);
        fetchJobs();
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败，请稍后重试');
      }
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
        <h1>岗位管理</h1>
        <button onClick={openCreateModal} className="btn btn-primary">
          ➕ 发布新岗位
        </button>
      </div>

      {successMessage && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>
          ✅ {successMessage}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <h3>暂无岗位</h3>
          <p>点击上方按钮发布第一个岗位</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>岗位名称</th>
              <th>公司</th>
              <th>薪资</th>
              <th>类型</th>
              <th>截止日期</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id}>
                <td style={{ fontWeight: '500' }}>{job.title}</td>
                <td>{job.company}</td>
                <td style={{ color: 'var(--accent-color)', fontWeight: '500' }}>{job.salary}</td>
                <td>
                  <span className="badge-type">{job.job_type}</span>
                </td>
                <td>{job.deadline}</td>
                <td>
                  <span className={`badge ${job.is_active ? 'badge-active' : 'badge-inactive'}`}
                    style={{ position: 'static', display: 'inline-block' }}>
                    {job.is_active ? '上架中' : '已下架'}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      onClick={() => openEditModal(job)}
                      className="btn btn-secondary btn-sm"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleToggle(job.id)}
                      className={`btn btn-sm ${job.is_active ? 'btn-warning' : 'btn-success'}`}
                    >
                      {job.is_active ? '下架' : '上架'}
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="btn btn-danger btn-sm"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editingJob ? '编辑岗位' : '发布新岗位'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">岗位名称 *</label>
                    <input
                      type="text"
                      name="title"
                      className="form-input"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">公司/单位 *</label>
                    <input
                      type="text"
                      name="company"
                      className="form-input"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">工作地点 *</label>
                    <input
                      type="text"
                      name="location"
                      className="form-input"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">薪资待遇 *</label>
                    <input
                      type="text"
                      name="salary"
                      className="form-input"
                      placeholder="如：15元/小时 或 3000元/月"
                      value={formData.salary}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">岗位类型</label>
                    <select
                      name="job_type"
                      className="form-select"
                      value={formData.job_type}
                      onChange={handleInputChange}
                    >
                      <option value="校内兼职">校内兼职</option>
                      <option value="校外家教">校外家教</option>
                      <option value="实习">实习</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">截止日期 *</label>
                    <input
                      type="date"
                      name="deadline"
                      className="form-input"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">联系方式 *</label>
                  <input
                    type="text"
                    name="contact"
                    className="form-input"
                    placeholder="手机号或联系人信息"
                    value={formData.contact}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">岗位描述 *</label>
                  <textarea
                    name="description"
                    className="form-textarea"
                    placeholder="详细描述岗位内容和工作内容..."
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label">任职要求 *</label>
                  <textarea
                    name="requirements"
                    className="form-textarea"
                    placeholder="列出任职要求，每行一条..."
                    value={formData.requirements}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitLoading}
                >
                  {submitLoading ? '提交中...' : (editingJob ? '保存修改' : '发布岗位')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminJobs;
