import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { navigateTo } from '../utils/navigationRef';
import { useAppStore } from '../store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Token okuma — SecureStore hata toleranslı ────────────────────────────────
const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync('userToken');
  } catch (error) {
    console.log('Token okuma hatası:', error);
    return null;
  }
};

// ── Request interceptor: token ekle ──────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: hata yönetimi ──────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token süresi dolmuş veya geçersiz → oturumu kapat
      await SecureStore.deleteItemAsync('userToken');
      useAppStore.getState().clearUser();
      navigateTo('Auth');
    }

    return Promise.reject(error);
  },
);

export default api;

// ── Global hata mesajı çözümleyici ───────────────────────────────────────────
/**
 * Axios hatasından kullanıcıya gösterilebilir mesaj üretir.
 * Ekranlarda `catch (err) { setError(parseApiError(err)); }` şeklinde kullanın.
 */
export function parseApiError(err: unknown): string {
  if (!err) return 'Bilinmeyen hata.';

  const axiosErr = err as AxiosError<{ message?: unknown; error?: unknown; detail?: unknown }>;
  const status   = axiosErr.response?.status;
  const data     = axiosErr.response?.data;

  if (status === 400) {
    const raw = data?.message ?? data?.error ?? data?.detail;
    if (Array.isArray(raw))        return raw[0];
    if (typeof raw === 'string')   return raw;
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
