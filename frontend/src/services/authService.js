import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login/', { email, password });
    if (response.data.token) {
      localStorage.setItem('sms_auth_token', response.data.token);
      localStorage.setItem('sms_auth_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    if (response.data.token) {
      localStorage.setItem('sms_auth_token', response.data.token);
      localStorage.setItem('sms_auth_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout/');
    } catch (err) {
      console.warn('Logout server notification failed:', err);
    } finally {
      localStorage.removeItem('sms_auth_token');
      localStorage.removeItem('sms_auth_user');
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me/');
    if (response.data.user) {
      localStorage.setItem('sms_auth_user', JSON.stringify(response.data.user));
    }
    return response.data.user;
  },

  getUsers: async (role) => {
    const params = role ? { role } : {};
    const response = await api.get('/auth/users/', { params });
    return response.data.results || response.data;
  }
};
