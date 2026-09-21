import api from './api';

export const analyticsService = {
  getDashboardAnalytics: async () => {
    const res = await api.get('/analytics/dashboard');
    return res.data.data;
  },

  getProjectAnalytics: async (projectId) => {
    const res = await api.get(`/analytics/projects/${projectId}`);
    return res.data.data;
  },
};
