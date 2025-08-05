// src/services/authService.js
const BASE_URL = import.meta.env.VITE_API_URL

async function request(path, opts = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    credentials = 'include',
  } = opts

  const token = localStorage.getItem('token')
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {}

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...headers,
    },
    credentials,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Error ${res.status}`)
  }

  return res.json()
}

export const authService = {
  /** POST /auth/login */
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: { email, password },
      credentials: 'include',
    }),

  /** POST /auth/register */
  register: ({ firstName, lastName, secondLastName, cedula, email, password, phone, role }) =>
    request('/auth/register', {
      method: 'POST',
      body: { firstName, lastName, secondLastName, cedula, email, password, phone, role },
    }),
}
