// src/hooks/useAuth.jsx
import { createContext, useContext, useState, useCallback } from 'react'
import { authService } from '../services/authService'
import { handleManualLogout } from '../utils/auth-helpers'

// Decodifica JWT sin librerías
function decodeJWT(token) {
  try {
    const [, payload] = token.split('.')
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

const AuthContext = createContext()

export function AuthProvider({ children }) {
  // Al montar, leemos el token (si hubo uno previo)
  const raw = localStorage.getItem('token')
  const initialUser = raw ? decodeJWT(raw) : null

  const [user, setUser]       = useState(initialUser)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      // Recibe { access_token } del backend
      const res = await authService.login(email, password)
      const token = res.access_token
      if (!token) throw new Error('No vino access_token del login')
      localStorage.setItem('token', token)
      const payload = decodeJWT(token)
      setUser(payload)
      return payload
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (userData) => {
    setLoading(true)
    try {
      const res = await authService.register(userData)
      const token = res.access_token
      if (token) {
        localStorage.setItem('token', token)
        const payload = decodeJWT(token)
        setUser(payload)
        return payload
      }
      return res
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    handleManualLogout() // Usa la función que marca como logout manual
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
