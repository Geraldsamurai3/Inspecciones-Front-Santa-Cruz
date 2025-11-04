// src/config/axiosConfig.js
import axios from 'axios';
import { handleTokenExpired } from '../utils/auth-helpers';

const BASE_URL = import.meta.env.VITE_API_URL;

// Crear instancia de axios
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a cada petición
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el error es 401 (no autorizado)
    // Pero NO es una petición de login (donde 401 = credenciales incorrectas)
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthRequest = requestUrl.includes('/auth/login') || 
                           requestUrl.includes('/auth/register') ||
                           requestUrl.includes('/auth/forgot-password') ||
                           requestUrl.includes('/auth/reset-password') ||
                           requestUrl.includes('/users/forgot-password') ||
                           requestUrl.includes('/users/reset-password');
      
      // Solo manejar token expirado si NO es una petición de autenticación
      if (!isAuthRequest) {
        handleTokenExpired();
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
