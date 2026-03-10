/**
 * Centralized Axios API Client
 * 
 * Features:
 * - Automatic JWT token injection on every request
 * - Automatic token refresh on 401 responses
 * - Global error formatting
 * - Configurable base URL via environment variable
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// ─── Request Interceptor ──────────────────────────────────────
// Attaches the JWT access token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('cms_auth_tokens');
    if (authData) {
      try {
        const { accessToken } = JSON.parse(authData);
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch {
        // Malformed JSON in storage — ignore
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────
// Handles 401 responses by attempting a token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401 errors, and only once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Another refresh is already in progress — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const authData = localStorage.getItem('cms_auth_tokens');
        if (!authData) throw new Error('No auth data');

        const { refreshToken } = JSON.parse(authData);
        if (!refreshToken) throw new Error('No refresh token');

        // Call refresh endpoint directly (bypasses interceptor)
        const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });

        const newTokens = {
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        };
        localStorage.setItem('cms_auth_tokens', JSON.stringify(newTokens));

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        processQueue(null, newTokens.accessToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Refresh failed — clear auth data and redirect to login
        localStorage.removeItem('cms_auth_tokens');
        localStorage.removeItem('cms_auth_data');
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
