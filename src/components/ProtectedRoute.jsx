// src/components/RequireAuth.jsx
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'

export default function RequireAuth() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  
  useEffect(() => {
    // Validar que el token sea válido y no un token de reset
    const token = localStorage.getItem('token')
    if (token && user) {
      try {
        // Decodificar el payload del token
        const [, payload] = token.split('.')
        const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        const decoded = JSON.parse(json)
        
        // Verificar que el token tenga los campos necesarios para autenticación
        // Un token de reset NO debe tener estos campos
        if (!decoded.email || !decoded.role || !decoded.sub) {
          console.error('SEGURIDAD: Token inválido detectado (posiblemente token de reset)')
          logout()
          navigate('/admin/login', { replace: true })
          return
        }
        
        // Verificar que el token no haya expirado
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.error('SEGURIDAD: Token expirado')
          logout()
          navigate('/admin/login', { replace: true })
          return
        }
      } catch (error) {
        console.error('SEGURIDAD: Error al validar token', error)
        logout()
        navigate('/admin/login', { replace: true })
      }
    }
  }, [user, logout, navigate])
  
  if (loading) return <div>Loading...</div>

  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}
