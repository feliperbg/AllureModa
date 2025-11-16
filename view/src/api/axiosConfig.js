import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const consent = localStorage.getItem('cookie_consent') === 'true';
  config.withCredentials = consent ? true : false;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/me');
    const isOnLoginPage = window.location.pathname === '/login';
    if (status === 401 && !isAuthEndpoint && !isOnLoginPage) {
      if (!window.__redirectingToLogin) {
        window.__redirectingToLogin = true;
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
