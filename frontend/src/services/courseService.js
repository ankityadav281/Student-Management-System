import api from './api';

export const courseService = {
  getAll: async (params = {}) => {
    const response = await api.get('/courses/', { params });
    return response.data.results || response.data;
  },
  create: async (data) => {
    const response = await api.post('/courses/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/courses/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/courses/${id}/`);
    return response.data;
  },
  enrollStudent: async (courseId, studentId) => {
    const response = await api.post('/courses/enrollments/', { course: courseId, student: studentId });
    return response.data;
  },
  getEnrollments: async (params = {}) => {
    const response = await api.get('/courses/enrollments/', { params });
    return response.data.results || response.data;
  }
};
