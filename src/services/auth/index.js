import axios from "axios";

const BASE_URL = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_BASE_URL ?? "");

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

// Refresh control
let isRefreshing = false;
let queue = [];

const resolveQueue = (error) => {
  queue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve();
  });
  queue = [];
};

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Hard guard: network / CORS / timeout
    if (!error || !error.response) {
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const originalRequest = error.config;

    // Only care about 401
    if (status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Never retry auth endpoints
    const AUTH_ROUTES = [
      "/api/auth/login",
      "/api/auth/signup",
      "/api/auth/refresh",
    ];

    if (AUTH_ROUTES.some((r) => originalRequest.url?.includes(r))) {
      forceLogout();
      return Promise.reject(error);
    }

    // Prevent infinite loop
    if (originalRequest._retry) {
      forceLogout();
      return Promise.reject(error);
    }

    // Only refresh on explicit signal from backend
    const REFRESH_CODES = new Set([
      "TOKEN_EXPIRED",
      "TOKEN_INVALIDATED",
      "PASSWORD_CHANGED",
      "NO_ACCESS_TOKEN",
    ]);
    if (!REFRESH_CODES.has(data?.code)) {
      return Promise.reject(error);
    }

    // Queue requests while refresh is running
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then(() => api(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await refreshToken();
      resolveQueue();
      return api(originalRequest);
    } catch (refreshError) {
      resolveQueue(refreshError);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// Auth APIs
export const registerAPI = (data) => api.post("/api/auth/signup", data);

export const loginAPI = (data) => api.post("/api/auth/login", data);

export const logoutAPI = async () => {
  try {
    await api.post("/api/auth/logout");
  } finally {
    forceLogout();
  }
};

export const verifyUser = async () => {
  const res = await api.get("/api/auth/verify");
  return res.data;
};

export const getMe = async () => {
  try {
    const res = await api.get("/api/auth/me", {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    if (err?.response?.status === 401) return null;
    throw err;
  }
};

const refreshToken = async () => {
  const res = await api.post("/api/auth/refresh");
  if (!res?.data?.ok) {
    throw new Error("Refresh failed");
  }
};

export const forgotPasswordAPI = (mobileNumber) => {
  return api.post(`/api/auth/forgot-password`, { mobileNumber });
};

export const changePasswordAPI = (data) => {
  return api.post(`/api/auth/change-password`, data);
};

export const resetPasswordAPI = (data) => {
  return api.post(`/api/auth/reset-password`, data);
};
// Forced logout (cross-tab safe)
const forceLogout = () => {
  localStorage.setItem("force-logout", Date.now().toString());
  window.dispatchEvent(new Event("auth-logout"));
};

window.addEventListener("storage", (e) => {
  if (e.key === "force-logout") {
    window.dispatchEvent(new Event("auth-logout"));
  }
});

export default api;
