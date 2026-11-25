import api from './api';

export const teacherService = {
  getAll: async (params = {}) => {
    const response = await api.get('/teachers/', { params });
    return response.data.results || response.data;
  },
  create: async (data) => {
    const response = await api.post('/teachers/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/teachers/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/teachers/${id}/`);
    return response.data;
  }
};
