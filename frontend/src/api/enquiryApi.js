import api from './client';

export const enquiryApi = {
  submit: async ({ name, email, phone, message, packageId }) => {
    const res = await api.post('/enquiries', {
      name,
      email,
      phone,
      message,
      ...(packageId ? { packageId } : {}),
    });
    return res.data;
  },

  getMyEnquiries: async (params = {}) => {
    const res = await api.get('/enquiries/my', { params });
    return res.data;
  },

  getAdminEnquiries: async (params = {}) => {
    const res = await api.get('/enquiries/admin', { params });
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await api.patch(`/enquiries/admin/${id}`, { status });
    return res.data;
  },
};
