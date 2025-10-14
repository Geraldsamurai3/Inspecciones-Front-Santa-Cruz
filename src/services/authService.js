// src/services/authService.js
const BASE_URL = import.meta.env.VITE_API_URL

// Sanitizar datos de entrada para prevenir XSS
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  return input;
};

// Validar token JWT básico
const isValidToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

async function request(path, opts = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    credentials = 'include',
  } = opts

  // Validar path para prevenir ataques de directory traversal
  if (path.includes('../') || path.includes('..\\')) {
    throw new Error('Invalid path detected');
  }

  const token = localStorage.getItem('token')
  
  // Validar token antes de usar
  const authHeader = (token && isValidToken(token)) ? { Authorization: `Bearer ${token}` } : {}

  // Sanitizar body si existe
  const sanitizedBody = body ? Object.keys(body).reduce((acc, key) => {
    acc[key] = sanitizeInput(body[key]);
    return acc;
  }, {}) : null;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      // X-Requested-With removido para evitar problemas CORS
      // La protección CSRF se maneja con credentials: 'include' y tokens
      ...authHeader,
      ...headers,
    },
    credentials,
    body: sanitizedBody ? JSON.stringify(sanitizedBody) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    
    // Logout en caso de token inválido
    if (res.status === 401 && token) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
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
