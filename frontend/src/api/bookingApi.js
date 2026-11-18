import api from './client';

export const bookingApi = {
  create: async ({ packageId, travelers, travelersInfo }) => {
    const res = await api.post('/bookings', {
      packageId,
      travelers,
      travelersInfo,
    });
    return res.data;
  },

  getMyBookings: async (params = {}) => {
    const res = await api.get('/bookings/my', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },

  cancel: async (id) => {
    const res = await api.patch(`/bookings/${id}/cancel`);
    return res.data;
  },
};
