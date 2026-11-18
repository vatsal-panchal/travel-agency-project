import api from './client';

export const adminApi = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  getUsers: async (params = {}) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  toggleBlockUser: async (userId) => {
    const res = await api.patch(`/admin/users/${userId}/block`);
    return res.data;
  },

  getBookings: async (params = {}) => {
    const res = await api.get('/admin/bookings', { params });
    return res.data;
  },

  getPayments: async (params = {}) => {
    const res = await api.get('/admin/payments', { params });
    return res.data;
  },

  seedDummyData: async () => {
    const res = await api.post('/admin/seed-dummy-data');
    return res.data;
  },
};

