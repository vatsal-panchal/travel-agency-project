import api, { setAccessToken } from './client';

export const authApi = {
  register: async ({ name, email, password }) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data?.data?.accessToken) {
      setAccessToken(res.data.data.accessToken);
    }
    return res.data;
  },

  login: async ({ email, password }) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.data?.accessToken) {
      setAccessToken(res.data.data.accessToken);
    }
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  updateProfile: async ({ name, email }) => {
    const res = await api.patch('/auth/profile', { name, email });
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    const res = await api.patch('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },
};
