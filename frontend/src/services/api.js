import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || err.message || 'An error occurred';
    return Promise.reject(new Error(msg));
  }
);

export const salesApi = {
  getAll: (params) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post('/sales', data),
  update: (id, data) => api.put(`/sales/${id}`, data),
  remove: (id) => api.delete(`/sales/${id}`),
  bulkImport: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/sales/import/bulk', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAggregations: (params) => api.get('/sales/aggregations', { params }),
  getFilterOptions: () => api.get('/sales/filter-options'),
  downloadTemplate: () =>
    axios.get('/api/sales/template', { responseType: 'blob' }).then((res) => res),
};

export const itemsApi = {
  getAll: () => api.get('/items'),
  create: (data) => api.post('/items', data),
  update: (id, data) => api.put(`/items/${id}`, data),
};

export default api;
