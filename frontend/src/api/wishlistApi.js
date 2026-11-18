import api from './client';

export const wishlistApi = {
  getWishlist: async () => {
    const res = await api.get('/wishlist');
    return res.data;
  },

  add: async (packageId) => {
    const res = await api.post(`/wishlist/${packageId}`);
    return res.data;
  },

  remove: async (packageId) => {
    const res = await api.delete(`/wishlist/${packageId}`);
    return res.data;
  },
};
