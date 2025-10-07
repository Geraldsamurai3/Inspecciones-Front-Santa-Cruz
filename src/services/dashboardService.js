// src/services/dashboardService.js
const BASE_URL = import.meta.env.VITE_API_URL;

async function request(path, opts = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    credentials = 'include',
    rawBody = false, // para FormData (no setear Content-Type)
  } = opts;

  const token = localStorage.getItem('token');
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  const baseHeaders = rawBody ? authHeader : { 'Content-Type': 'application/json', ...authHeader };

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { ...baseHeaders, ...headers },
    credentials,
    body: rawBody ? body : body ? JSON.stringify(body) : undefined,
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

export const dashboardService = {
  getInspectorDashboard: () => request('/dashboard/inspector'),
  getAdminDashboard: () => request('/dashboard/admin'),
  getStatsByPeriod: (params = {}) => {
    const qs = new URLSearchParams(params).toString(); // {startDate,endDate}
    return request(`/dashboard/stats/period${qs ? `?${qs}` : ''}`);
  },
};
