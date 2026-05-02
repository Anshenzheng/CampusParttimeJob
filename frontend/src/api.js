import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true
});

export const jobAPI = {
  getAll: () => api.get('/jobs'),
  getActive: () => api.get('/jobs/active'),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/admin/jobs', data),
  update: (id, data) => api.put(`/admin/jobs/${id}`, data),
  toggle: (id) => api.post(`/admin/jobs/${id}/toggle`),
  delete: (id) => api.delete(`/admin/jobs/${id}`),
};

export const messageAPI = {
  create: (jobId, data) => api.post(`/jobs/${jobId}/messages`, data),
  getByJobId: (jobId) => api.get(`/jobs/${jobId}/messages`),
  getAll: () => api.get('/admin/messages'),
  getById: (id) => api.get(`/admin/messages/${id}`),
  reply: (id, data) => api.post(`/admin/messages/${id}/reply`, data),
  getUnreadCount: () => api.get('/admin/messages/unread-count'),
};

export const adminAPI = {
  login: (data) => api.post('/admin/login', data),
  logout: () => api.post('/admin/logout'),
  check: () => api.get('/admin/check'),
};

export default api;
