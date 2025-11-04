// src/services/profileService.js
import { handleTokenExpired } from '../utils/auth-helpers';

const BASE_URL = import.meta.env.VITE_API_URL

async function request(path, opts = {}) {
  const { method='GET', headers={}, body=null, credentials='include' } = opts
  const token = localStorage.getItem('token')
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {}

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type':'application/json', ...authHeader, ...headers },
    credentials,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    // Manejar token expirado
    if (res.status === 401) {
      handleTokenExpired();
      throw new Error('Token expirado');
    }
    
    const err = await res.json().catch(()=>({}))
    throw new Error(err.message||`Error ${res.status}`)
  }
  if (res.status===204) return null
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const profileService = {
  getProfile: () => request('/users/me'),
}
