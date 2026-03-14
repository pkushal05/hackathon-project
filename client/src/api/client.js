import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Something went wrong';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

// ─── Buses ────────────────────────────────
export const busesApi = {
  getAll: () => api.get('/buses'),
  getById: (id) => api.get(`/buses/${id}`),
  create: (data) => api.post('/buses', data),
  update: (id, data) => api.put(`/buses/${id}`, data),
  remove: (id) => api.delete(`/buses/${id}`),
};

// ─── Maintenance Records ──────────────────
export const maintenanceApi = {
  getAll: () => api.get('/maintenance'),
  getById: (id) => api.get(`/maintenance/${id}`),
  create: (data) => api.post('/maintenance', data),
  update: (id, data) => api.put(`/maintenance/${id}`, data),
  remove: (id) => api.delete(`/maintenance/${id}`),
  getHealth: () => api.get('/maintenance/health'),
};

// ─── Service Types ────────────────────────
export const servicesApi = {
  getAll: () => api.get('/services'),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  remove: (id) => api.delete(`/services/${id}`),
};

// ─── Parts ────────────────────────────────
export const partsApi = {
  getAll: () => api.get('/parts'),
  getById: (id) => api.get(`/parts/${id}`),
  create: (data) => api.post('/parts', data),
  update: (id, data) => api.put(`/parts/${id}`, data),
  remove: (id) => api.delete(`/parts/${id}`),
};

// ─── Service Parts ────────────────────────
export const servicePartsApi = {
  getAll: (params) => api.get('/service-parts', { params }),
  getById: (id) => api.get(`/service-parts/${id}`),
  create: (data) => api.post('/service-parts', data),
  update: (id, data) => api.put(`/service-parts/${id}`, data),
  remove: (id) => api.delete(`/service-parts/${id}`),
};

// ─── Forecasts ────────────────────────────
export const forecastApi = {
  getMaintenance: (window) => api.get('/forecast/maintenance', { params: { window } }),
  generateMaintenance: () => api.post('/forecast/maintenance/generate'),
  removeMaintenance: (id) => api.delete(`/forecast/maintenance/${id}`),
  getParts: (window) => api.get('/forecast/parts', { params: { window } }),
  generateParts: () => api.post('/forecast/parts/generate'),
  removeParts: (id) => api.delete(`/forecast/parts/${id}`),
};

// ─── GTFS & Dashboard ────────────────────
export const gtfsApi = {
  getVehicles: () => api.get('/vehicles'),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard'),
  generateForecasts: () => api.post('/dashboard/generate'),
};

export default api;
