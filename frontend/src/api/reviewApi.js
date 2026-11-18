import api from './client';

export const reviewApi = {
  getByPackage: async (packageId, params = {}) => {
    const res = await api.get(`/packages/${packageId}/reviews`, { params });
    return res.data;
  },

  create: async (packageId, { rating, comment }) => {
    const res = await api.post(`/packages/${packageId}/reviews`, {
      rating,
      comment,
    });
    return res.data;
  },

  getFeatured: async (params = {}) => {
    const res = await api.get('/reviews/featured', { params });
    return res.data;
  },

  delete: async (reviewId) => {
    const res = await api.delete(`/reviews/${reviewId}`);
    return res.data;
  },
};
