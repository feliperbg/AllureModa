import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  withCredentials: true, // Importante para enviar cookies
});

// Interceptador para tratamento de erro
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expirou ou inválido
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
