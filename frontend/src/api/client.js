import axios from 'axios';

// In-memory access token storage
let currentAccessToken = localStorage.getItem('wanderlust_token') || null;

export const setAccessToken = (token) => {
  currentAccessToken = token;
  if (token) {
    localStorage.setItem('wanderlust_token', token);
  } else {
    localStorage.removeItem('wanderlust_token');
  }
};

export const getAccessToken = () => currentAccessToken;

// Axios instance with cookies enabled
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token if present
api.interceptors.request.use(
  (config) => {
    if (currentAccessToken) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Silent refresh queue management
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: intercept 401 TOKEN_EXPIRED and auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and error code is TOKEN_EXPIRED
    const isTokenExpired =
      error.response?.status === 401 &&
      (error.response?.data?.code === 'TOKEN_EXPIRED' ||
        error.response?.data?.message?.includes('expired'));

    if (isTokenExpired && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        if (newAccessToken) {
          setAccessToken(newAccessToken);
          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error('No access token returned from refresh');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAccessToken(null);
        // Only broadcast logout if previously logged in
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
