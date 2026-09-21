import api from './api';

export const teamService = {
  getTeam: async (params = {}) => {
    const res = await api.get('/team', { params });
    return res.data.data;
  },

  updateRole: async (userId, role) => {
    const res = await api.patch(`/team/${userId}/role`, { role });
    return res.data.data;
  },

  deleteUser: async (userId) => {
    const res = await api.delete(`/team/${userId}`);
    return res.data.data;
  },
};
