// src/services/usersService.js
const BASE_URL = import.meta.env.VITE_API_URL;

async function request(path, opts = {}) {
  const { method = 'GET', body = null, headers = {}, credentials = 'include' } = opts;
  const token = localStorage.getItem('token');
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeader, ...headers },
    credentials,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let errBody = {};
    try { errBody = await res.json(); } catch {}
    throw new Error(errBody.message || `Error ${res.status}`);
  }
  if (res.status === 204) return null;

  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

export const usersService = {
  // — Usuarios CRUD —
  getUsers: () => request('/users'),
  updateUser: (id, body) => request(`/users/${id}`, { method: 'PATCH', body }),
  toggleBlock: (id) => request(`/users/${id}/block`, { method: 'PATCH' }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  forgotPassword: (email) => request('/users/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token, newPassword) => request('/users/reset-password', { method: 'POST', body: { token, newPassword } }),
};
