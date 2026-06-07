import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils/storage';
import { useAppStore } from '../store';
import { navigationRef } from '../utils/navigationRef';

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
});

// ── Request: attach access token ──────────────────────────────────────────────

api.interceptors.request.use(async (config) => {
  const token = await storage.getItem('userToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Token refresh state ───────────────────────────────────────────────────────

let isRefreshing = false;
const refreshQueue: Array<(token: string | null) => void> = [];

function drainQueue(token: string | null) {
  refreshQueue.splice(0).forEach(resolve => resolve(token));
}

// Auth endpoints that must never be retried on 401
const AUTH_ENDPOINTS = ['/auth/login', '/auth/signup', '/auth/register', '/auth/refresh', '/auth/logout'];

async function attemptTokenRefresh(): Promise<string | null> {
  const refreshToken = await storage.getItem('refreshToken');
  if (!refreshToken) return null;

  // Use a plain axios instance — bypasses our interceptor to avoid loops
  // Backend uses camelCase: { refreshToken } — same as logout endpoint
  const res = await axios.post(
    `${API_URL}/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' }, timeout: 10000 },
  );

  const newAccess: string  = res.data.accessToken  ?? res.data.access_token;
  const newRefresh: string = res.data.refreshToken ?? res.data.refresh_token ?? refreshToken;
  const expiresIn: number  = res.data.expires_in   ?? 3600;

  await storage.setItem('userToken',     newAccess);
  await storage.setItem('refreshToken',  newRefresh);
  await storage.setItem('tokenExpiresAt', String(Date.now() + expiresIn * 1000));

  useAppStore.getState().setToken(newAccess);
  return newAccess;
}

async function clearSession() {
  await storage.deleteItem('userToken');
  await storage.deleteItem('refreshToken');
  await storage.deleteItem('userId');
  await storage.deleteItem('userType');
  await storage.deleteItem('tokenExpiresAt');
  useAppStore.getState().clearUser();
}

function navigateToAuth() {
  // Small delay so the store clears before navigation fires
  setTimeout(() => {
    try {
      navigationRef.current?.reset({ index: 0, routes: [{ name: 'Auth' }] });
    } catch { /* navigation not ready */ }
  }, 150);
}

// ── Response: auto-refresh on 401 ─────────────────────────────────────────────

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;

    if (__DEV__) {
      console.warn(`[API] ${config?.method?.toUpperCase() ?? '?'} ${config?.url} → ${error.response?.status ?? error.message}`);
    }

    const status = error.response?.status;

    // 403 Forbidden — this endpoint is not accessible for this user role.
    // Return an empty payload silently to prevent crashes.
    if (status === 403) {
      if (__DEV__) console.warn(`[API] 403 Forbidden: ${config?.url} — returning empty data`);
      return Promise.resolve({ data: [] });
    }

    // Skip refresh for non-401, already-retried, or auth endpoints
    if (
      status !== 401 ||
      config?._retry ||
      !config ||
      AUTH_ENDPOINTS.some(ep => config.url?.includes(ep))
    ) {
      return Promise.reject(error);
    }

    config._retry = true;

    // Another refresh already in flight — queue this request
    if (isRefreshing) {
      return new Promise<string | null>(resolve => {
        refreshQueue.push(resolve);
      }).then(token => {
        if (!token) return Promise.reject(error);
        config.headers.Authorization = `Bearer ${token}`;
        return api(config);
      });
    }

    isRefreshing = true;
    try {
      const newToken = await attemptTokenRefresh();
      drainQueue(newToken);
      if (!newToken) {
        await clearSession();
        navigateToAuth();
        return Promise.reject(error);
      }
      config.headers.Authorization = `Bearer ${newToken}`;
      return api(config);
    } catch (refreshErr) {
      drainQueue(null);
      await clearSession();
      navigateToAuth();
      if (__DEV__) console.warn('[API] Token refresh failed — session cleared:', refreshErr);
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
