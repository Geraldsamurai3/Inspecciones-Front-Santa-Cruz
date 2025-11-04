// src/services/usersService.js
import { handleTokenExpired } from '../utils/auth-helpers';

const BASE_URL = import.meta.env.VITE_API_URL;

async function request(path, opts = {}) {
  const { method = 'GET', body = null, headers = {}, credentials = 'include' } = opts;
  
  // Rutas públicas que NO necesitan token
  const isPublicRoute = path.includes('/forgot-password') || path.includes('/reset-password');
  
  const token = localStorage.getItem('token');
  const authHeader = (!isPublicRoute && token) ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeader, ...headers },
    credentials,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    // Manejar token expirado solo si NO es una ruta pública
    if (res.status === 401 && !isPublicRoute) {
      handleTokenExpired();
      throw new Error('Token expirado');
    }
    
    let errBody = {};
    try { errBody = await res.json(); } catch {}
    throw new Error(errBody.message || `Error ${res.status}`);
  }
  if (res.status === 204) return null;

  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

export const usersService = {
  // — Usuarios CRUD —
  getUsers: () => request('/users'),
  getSystemUsers: () => request('/users/system'), // Agregado para obtener usuarios del sistema
  updateUser: (id, body) => request(`/users/${id}`, { method: 'PATCH', body }),
  toggleBlock: (id) => request(`/users/${id}/block`, { method: 'PATCH' }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  
  // Forgot Password - NO debe retornar access_token
  forgotPassword: async (email) => {
    const response = await request('/users/forgot-password', { method: 'POST', body: { email } });
    
    // SEGURIDAD: Verificar que no venga access_token en la respuesta
    if (response && response.access_token) {
      console.error('ALERTA DE SEGURIDAD: Backend envió access_token en forgot-password');
      delete response.access_token; // Eliminar el token de la respuesta
      localStorage.removeItem('token'); // Asegurar que no se guarde
    }
    
    return response;
  },
  
  // Reset Password - NO debe retornar access_token
  resetPassword: async (token, newPassword) => {
    const response = await request('/users/reset-password', { method: 'POST', body: { token, newPassword } });
    
    // SEGURIDAD: Verificar que no venga access_token en la respuesta
    if (response && response.access_token) {
      console.error('ALERTA DE SEGURIDAD: Backend envió access_token en reset-password');
      delete response.access_token; // Eliminar el token de la respuesta
      localStorage.removeItem('token'); // Asegurar que no se guarde
    }
    
    return response;
  },
};
