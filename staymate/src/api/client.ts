import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

console.log('API Configuration:');
console.log('  URL:', API_URL);
console.log('  Environment:', __DEV__ ? 'development' : 'production');

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    console.log(`[${config.method?.toUpperCase()}] ${config.url}`);
    if (config.data) console.log('  Body:', config.data);

    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('  Token: attached');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  },
);

// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    console.log(`[${response.status}] ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    console.error('Response error:', {
      message:    error.message,
      status:     error.response?.status,
      data:       error.response?.data,
      url:        error.config?.url,
      method:     error.config?.method,
    });

    if (error.response?.status === 401) {
      console.log('401 — attempting token refresh...');
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (refreshToken) {
          // TODO: call refresh endpoint and update tokens
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// ── Kept for backward compatibility (ProfileEditScreen) ───────────────────────
export function parseApiError(err: unknown): string {
  if (!err) return 'Bilinmeyen hata.';

  const axiosErr = err as AxiosError<{ message?: unknown; error?: unknown; detail?: unknown }>;
  const status   = axiosErr.response?.status;
  const data     = axiosErr.response?.data;

  if (status === 400) {
    const raw = data?.message ?? data?.error ?? data?.detail;
    if (Array.isArray(raw))      return raw[0];
    if (typeof raw === 'string') return raw;
    return 'Girilen bilgileri kontrol edin.';
  }

  if (status === 401) return 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.';
  if (status === 403) return 'Bu işlem için yetkiniz yok.';
  if (status === 404) return 'İstenen kaynak bulunamadı.';
  if (status === 409) return 'Bu kayıt zaten mevcut.';
  if (status && status >= 500) return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';

  if ((err as any)?.code === 'ECONNABORTED') return 'Bağlantı zaman aşımına uğradı.';
  if ((err as any)?.message === 'Network Error') return 'İnternet bağlantınızı kontrol edin.';

  const msg = (err as any)?.message;
  return typeof msg === 'string' ? msg : 'Bir hata oluştu.';
}
