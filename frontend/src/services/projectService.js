import api from './api';

export const projectService = {
  getProjects: async (params = {}) => {
    const res = await api.get('/projects', { params });
    return res.data.data;
  },

  getProjectById: async (id) => {
    const res = await api.get(`/projects/${id}`);
    return res.data.data;
  },

  createProject: async (data) => {
    const res = await api.post('/projects', data);
    return res.data.data;
  },

  updateProject: async (id, data) => {
    const res = await api.put(`/projects/${id}`, data);
    return res.data.data;
  },

  deleteProject: async (id) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data.data;
  },

  addMember: async (projectId, userId, role = 'MEMBER') => {
    const res = await api.post(`/projects/${projectId}/members`, { userId, role });
    return res.data.data;
  },

  removeMember: async (projectId, userId) => {
    const res = await api.delete(`/projects/${projectId}/members/${userId}`);
    return res.data.data;
  },
};
