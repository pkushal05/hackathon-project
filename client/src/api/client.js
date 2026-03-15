import axios from "axios";

const TOKEN_STORAGE_KEY = "fleetpulse_auth_token";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export const getStoredToken = () => {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || "";
};

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY);
  delete api.defaults.headers.common.Authorization;
};

const initialToken = getStoredToken();
if (initialToken) {
  api.defaults.headers.common.Authorization = `Bearer ${initialToken}`;
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      setStoredToken("");
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    const message =
      err.response?.data?.error || err.message || "Something went wrong";
    console.error("API Error:", message);
    return Promise.reject(new Error(message));
  },
);

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  me: () => api.get("/auth/me"),
  getPendingUsers: () => api.get("/auth/pending-users"),
  approveUser: (id) => api.patch(`/auth/approve/${id}`),
  denyUser: (id) => api.patch(`/auth/deny/${id}`),
  getUsers: () => api.get("/auth/users"),
  makeAdmin: (id) => api.patch(`/auth/make-admin/${id}`),
};

// ─── Buses ────────────────────────────────
export const busesApi = {
  getAll: () => api.get("/buses"),
  getById: (id) => api.get(`/buses/${id}`),
  create: (data) => api.post("/buses", data),
  update: (id, data) => api.put(`/buses/${id}`, data),
  remove: (id) => api.delete(`/buses/${id}`),
};

// ─── Maintenance Records ──────────────────
export const maintenanceApi = {
  getAll: () => api.get("/maintenance"),
  getById: (id) => api.get(`/maintenance/${id}`),
  create: (data) => api.post("/maintenance", data),
  update: (id, data) => api.put(`/maintenance/${id}`, data),
  remove: (id) => api.delete(`/maintenance/${id}`),
  getHealth: () => api.get("/maintenance/health"),
};

// ─── Service Types ────────────────────────
export const servicesApi = {
  getAll: () => api.get("/services"),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post("/services", data),
  update: (id, data) => api.put(`/services/${id}`, data),
  remove: (id) => api.delete(`/services/${id}`),
};

// ─── Parts ────────────────────────────────
export const partsApi = {
  getAll: () => api.get("/parts"),
  getById: (id) => api.get(`/parts/${id}`),
  create: (data) => api.post("/parts", data),
  update: (id, data) => api.put(`/parts/${id}`, data),
  remove: (id) => api.delete(`/parts/${id}`),
};

// ─── Service Parts ────────────────────────
export const servicePartsApi = {
  getAll: (params) => api.get("/service-parts", { params }),
  getById: (id) => api.get(`/service-parts/${id}`),
  create: (data) => api.post("/service-parts", data),
  update: (id, data) => api.put(`/service-parts/${id}`, data),
  remove: (id) => api.delete(`/service-parts/${id}`),
};

// ─── Forecasts ────────────────────────────
export const forecastApi = {
  getMaintenance: (window) =>
    api.get("/forecast/maintenance", { params: { window } }),
  generateMaintenance: () => api.post("/forecast/maintenance/generate"),
  removeMaintenance: (id) => api.delete(`/forecast/maintenance/${id}`),
  getParts: (window) => api.get("/forecast/parts", { params: { window } }),
  generateParts: () => api.post("/forecast/parts/generate"),
  removeParts: (id) => api.delete(`/forecast/parts/${id}`),
};

// ─── GTFS & Dashboard ────────────────────
export const gtfsApi = {
  getVehicles: () => api.get("/vehicles"),
};

export const dashboardApi = {
  getStats: () => api.get("/dashboard"),
  generateForecasts: () => api.post("/dashboard/generate"),
};

export default api;
