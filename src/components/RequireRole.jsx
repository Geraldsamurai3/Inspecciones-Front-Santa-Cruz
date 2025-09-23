// src/components/RequireRole.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function normalizeRole(user) {
  const raw = (user?.role || user?.rol || '').toString().trim().toLowerCase()
  if (!raw) return 'inspector' // fallback conservador
  return raw
}

export default function RequireRole({ roles = [] }) {
  const { user } = useAuth()
  const location = useLocation()

  // Si no hay usuario, que se encargue RequireAuth en el nivel superior
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  const role = normalizeRole(user)

  // Admin siempre pasa, acceso total
  if (role === 'admin') return <Outlet />

  // Si el rol del usuario está permitido explícitamente
  if (roles.map(r => r.toLowerCase()).includes(role)) return <Outlet />

  // Si no está permitido, redirigir a dashboard
  return <Navigate to="/admin/dashboard" replace />
}
