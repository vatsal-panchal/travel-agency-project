import api from './client';

export const paymentApi = {
  initiate: async (bookingId) => {
    const res = await api.post('/payments/initiate', { bookingId });
    return res.data;
  },

  confirm: async (paymentId, { cardNumber, cardHolder, expiry, cvv }) => {
    const res = await api.post(`/payments/${paymentId}/confirm`, {
      cardNumber,
      cardHolder,
      expiry,
      cvv,
    });
    return res.data;
  },

  getMyPayments: async (params = {}) => {
    const res = await api.get('/payments/my', { params });
    return res.data;
  },
};
