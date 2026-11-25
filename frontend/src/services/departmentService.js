import api from './api';

export const departmentService = {
  getAll: async () => {
    const response = await api.get('/departments/');
    return response.data.results || response.data;
  },
  create: async (data) => {
    const response = await api.post('/departments/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/departments/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/departments/${id}/`);
    return response.data;
  }
};
