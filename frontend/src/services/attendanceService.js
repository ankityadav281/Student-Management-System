import api from './api';

export const attendanceService = {
  getAll: async (params = {}) => {
    const response = await api.get('/attendance/', { params });
    return response.data.results || response.data;
  },
  create: async (data) => {
    const response = await api.post('/attendance/', data);
    return response.data;
  },
  recordBatch: async (date, records, courseId = null) => {
    const response = await api.post('/attendance/batch/', {
      date,
      records,
      course_id: courseId
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/attendance/${id}/`);
    return response.data;
  }
};
