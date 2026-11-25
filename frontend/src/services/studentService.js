import api from './api';

export const studentService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/students/', { params: filters });
    return response.data.results || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/students/${id}/`);
    return response.data;
  },

  create: async (studentData) => {
    const response = await api.post('/students/', studentData);
    return response.data;
  },

  update: async (id, studentData) => {
    const response = await api.put(`/students/${id}/`, studentData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/students/${id}/`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/students/stats/');
    return response.data;
  },

  seedDemo: async () => {
    const response = await api.post('/students/seed-demo/');
    return response.data;
  },

  clearAll: async () => {
    const response = await api.post('/students/clear-all/');
    return response.data;
  },

  exportCSVUrl: () => {
    return `${api.defaults.baseURL}/students/export-csv/`;
  }
};
