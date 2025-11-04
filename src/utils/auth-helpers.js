// src/utils/auth-helpers.js
import Swal from 'sweetalert2';

let isShowingExpiredAlert = false;
let isManualLogout = false; // Bandera para distinguir logout manual de expiración

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = [
  '/login',
  '/admin/forgot-password',
  '/admin/reset-password'
];

/**
 * Verifica si la ruta actual es pública
 */
const isPublicRoute = () => {
  const currentPath = window.location.pathname;
  return PUBLIC_ROUTES.some(route => currentPath.startsWith(route));
};

/**
 * Maneja el logout manual (sin mostrar alerta)
 */
export const handleManualLogout = () => {
  isManualLogout = true;
  localStorage.removeItem('token');
  // Resetear la bandera después de un breve delay
  setTimeout(() => {
    isManualLogout = false;
  }, 500);
};

/**
 * Maneja el caso de token expirado
 * Muestra alerta y redirige al login
 */
export const handleTokenExpired = () => {
  // No mostrar alerta si fue un logout manual
  if (isManualLogout) {
    return;
  }

  // No mostrar alerta si estamos en una ruta pública
  if (isPublicRoute()) {
    localStorage.removeItem('token');
    return;
  }

  // No mostrar si ya no hay token
  const token = localStorage.getItem('token');
  if (!token) {
    return;
  }

  // Evitar mostrar múltiples alertas
  if (isShowingExpiredAlert) {
    return;
  }
  
  isShowingExpiredAlert = true;
  
  // Limpiar el token
  localStorage.removeItem('token');
  
  // Mostrar alerta de sesión expirada
  Swal.fire({
    icon: 'warning',
    title: 'Sesión Expirada',
    text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    confirmButtonText: 'Aceptar',
    allowOutsideClick: false,
    allowEscapeKey: false,
  }).then(() => {
    isShowingExpiredAlert = false;
    // Redirigir al login
    window.location.href = '/login';
  });
};

/**
 * Validar token JWT básico
 */
export const isValidToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

/**
 * Verificar si el token ha expirado (decodificando el JWT)
 */
export const isTokenExpired = (token) => {
  if (!isValidToken(token)) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convertir a milisegundos
    return Date.now() >= exp;
  } catch (error) {
    return true;
  }
};

/**
 * Obtener el token del localStorage
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Verificar si hay una sesión activa válida
 */
export const hasValidSession = () => {
  const token = getToken();
  if (!token) return false;
  return !isTokenExpired(token);
};
