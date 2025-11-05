// src/services/inspectionsService.js
import { handleTokenExpired } from '../utils/auth-helpers';

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
    // Manejar token expirado
    if (res.status === 401) {
      handleTokenExpired();
      throw new Error('Token expirado');
    }
    
    let errBody = {};
    try { errBody = await res.json(); } catch {}
    throw new Error(errBody.message || `Error ${res.status}`);
  }
  if (res.status === 204) return null;

  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

export const inspectionsService = {
  getInspections: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/inspections${qs ? `?${qs}` : ''}`);
  },
  getInspectionById: (id) => request(`/inspections/${id}`),
  createInspection: (dto) => request('/inspections', { method: 'POST', body: dto }),
  updateInspection: (id, body) => request(`/inspections/${id}`, { method: 'PATCH', body }),
  updateInspectionStatus: (id, status) => {
    console.log('Sending status update:', { id, status, statusType: typeof status });
    return request(`/inspections/${id}/status`, { 
      method: 'PATCH', 
      body: { status } 
    });
  },
  deleteInspection: (id) => request(`/inspections/${id}`, { method: 'DELETE' }),

  // Papelera endpoints
  getTrashInspections: () => request('/inspections/trash/list'),
  moveToTrash: (id) => request(`/inspections/${id}/trash`, { method: 'PATCH' }),
  restoreFromTrash: (id) => request(`/inspections/${id}/restore`, { method: 'PATCH' }),

  uploadPhotos: async (inspectionId, files = []) => {
    if (!files || files.length === 0) return null;
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    return request(`/inspections/${inspectionId}/photos`, {
      method: 'POST',
      body: form,
      rawBody: true,
    });
  },
};
