import api from './api';

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.data?.token) {
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
    }
    return res.data.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.data?.token) {
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
    }
    return res.data.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.data.data) {
      localStorage.setItem('user', JSON.stringify(res.data.data));
    }
    return res.data.data;
  },

  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
};
