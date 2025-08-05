// src/components/RequireAuth.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RequireAuth() {
  const { user } = useAuth()

  if (!user) {
    // si no hay usuario (ni token válido), redirige al login
    return <Navigate to="/login" replace />
  }

  // en caso contrario, renderiza las rutas hijas
  return <Outlet />
}
