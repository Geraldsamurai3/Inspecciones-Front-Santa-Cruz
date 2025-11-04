// src/components/TokenExpirationChecker.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasValidSession, handleTokenExpired } from '../utils/auth-helpers';

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = ['/login', '/admin/forgot-password', '/admin/reset-password'];

/**
 * Componente para verificar periódicamente si el token ha expirado
 * Se monta en App.jsx para verificar en toda la aplicación
 */
const TokenExpirationChecker = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar el token cada 30 segundos
    const intervalId = setInterval(() => {
      const token = localStorage.getItem('token');
      const currentPath = window.location.pathname;
      const isPublicRoute = PUBLIC_ROUTES.some(route => currentPath.startsWith(route));
      
      // Si no hay token o está en una ruta pública, no hacer nada
      if (!token || isPublicRoute) {
        return;
      }

      // Si el token no es válido o ha expirado
      if (!hasValidSession()) {
        console.log('Token expirado detectado por verificación periódica');
        handleTokenExpired();
      }
    }, 30000); // 30 segundos

    // Verificar después de un pequeño delay al montar (para evitar conflictos con logout manual)
    const initialCheckTimeout = setTimeout(() => {
      const token = localStorage.getItem('token');
      const currentPath = window.location.pathname;
      const isPublicRoute = PUBLIC_ROUTES.some(route => currentPath.startsWith(route));
      
      if (token && !isPublicRoute && !hasValidSession()) {
        console.log('Token expirado detectado al montar componente');
        handleTokenExpired();
      }
    }, 1000); // 1 segundo de delay

    // Limpiar el intervalo y timeout al desmontar
    return () => {
      clearInterval(intervalId);
      clearTimeout(initialCheckTimeout);
    };
  }, [navigate]);

  // Este componente no renderiza nada
  return null;
};

export default TokenExpirationChecker;
