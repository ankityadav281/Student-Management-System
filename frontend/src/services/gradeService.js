import api from './api';

export const gradeService = {
  getAll: async (params = {}) => {
    const response = await api.get('/grades/', { params });
    return response.data.results || response.data;
  },
  create: async (data) => {
    const response = await api.post('/grades/', data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/grades/${id}/`);
    return response.data;
  },
  getReportCard: async (studentId) => {
    const response = await api.get(`/grades/report-card/${studentId}/`);
    return response.data;
  }
};
