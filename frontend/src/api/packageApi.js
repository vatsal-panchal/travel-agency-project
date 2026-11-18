import api from './client';

export const packageApi = {
  getAll: async (params = {}) => {
    // params: { page, limit, search, destination, category, minPrice, maxPrice, sort }
    // Empty filter values must be omitted: the API validates enums and rejects "".
    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) => value !== undefined && value !== null && value !== ''
      )
    );
    const res = await api.get('/packages', { params: cleanedParams });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/packages/${id}`);
    return res.data;
  },

  create: async (packageData) => {
    const res = await api.post('/packages', packageData);
    return res.data;
  },

  update: async (id, packageData) => {
    const res = await api.patch(`/packages/${id}`, packageData);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/packages/${id}`);
    return res.data;
  },
};
