import api from './api';

export const searchService = {
  search: async (query) => {
    if (!query || !query.trim()) {
      return { projects: [], tasks: [], people: [] };
    }
    const res = await api.get('/search', { params: { q: query } });
    return res.data.data;
  },
};
