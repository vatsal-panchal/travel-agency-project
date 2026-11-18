import api from './client';

export const chatApi = {
  sendMessage: async (message, history = []) => {
    const res = await api.post('/chat', { message, history });
    return res.data;
  },
};
