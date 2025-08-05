// src/hooks/useAuth.jsx
import { createContext, useContext, useState, useCallback } from 'react'
import { authService } from '../services/authService'

// decodifica JWT sin librerías
function decodeJWT(token) {
  try {
    const [, payload] = token.split('.')
    const str = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(str)
  } catch {
    return null
  }
}

const AuthContext = createContext()

export function AuthProvider({ children }) {
  // 🔹 Inicialización **sincrónica** con lo que haya en localStorage:
  const raw = localStorage.getItem('token')
  const initialUser = raw ? decodeJWT(raw) : null

  const [user, setUser]     = useState(initialUser)
  const [loading, setLoading] = useState(false) // ya no true al montar

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const { access_token } = await authService.login(email, password)
      localStorage.setItem('token', access_token)
      const payload = decodeJWT(access_token)
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
      if (res.access_token) {
        localStorage.setItem('token', res.access_token)
        const payload = decodeJWT(res.access_token)
        setUser(payload)
        return payload
      }
      return res
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await authService.logout()
    } catch {
      // ignora errores de logout
    }
    localStorage.removeItem('token')
    setUser(null)
    setLoading(false)
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
