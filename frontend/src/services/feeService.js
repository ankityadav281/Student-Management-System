import api from './api';

export const feeService = {
  getInvoices: async (params = {}) => {
    const response = await api.get('/fees/invoices/', { params });
    return response.data.results || response.data;
  },
  createInvoice: async (data) => {
    const response = await api.post('/fees/invoices/', data);
    return response.data;
  },
  getPayments: async (params = {}) => {
    const response = await api.get('/fees/payments/', { params });
    return response.data.results || response.data;
  },
  recordPayment: async (data) => {
    const response = await api.post('/fees/payments/', data);
    return response.data;
  },
  getSummary: async () => {
    const response = await api.get('/fees/summary/');
    return response.data;
  }
};
