import axios from 'axios';
import api from './client';
import { storage } from '../utils/storage';
import { useAppStore } from '../store';

// ── Types ─────────────────────────────────────────────────────────────────────

export type AuthResponse = {
  access_token:  string;
  refresh_token: string;
  user_id:       string;
  user_type:     'student' | 'landlord';
  expires_in?:   number;
};

// ── Config ────────────────────────────────────────────────────────────────────

const USE_MOCK = false;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Response normalizer ───────────────────────────────────────────────────────
// Backend returns { accessToken, refreshToken, expires_in, user: { id, userType } }
// We normalize to our flat snake_case AuthResponse so callers don't change.

function normalizeAuthResponse(raw: any): AuthResponse {
  const user = raw.user ?? {};
  const normalized: AuthResponse = {
    access_token:  raw.accessToken  ?? raw.access_token  ?? '',
    refresh_token: raw.refreshToken ?? raw.refresh_token ?? '',
    user_id:       user.id          ?? raw.user_id       ?? '',
    user_type:     (user.userType   ?? raw.user_type     ?? 'student') as 'student' | 'landlord',
    expires_in:    raw.expires_in   ?? 3600,
  };
  if (__DEV__) {
    console.log('[Auth] raw response keys:', Object.keys(raw));
    console.log('[Auth] raw.user:', JSON.stringify(user));
    console.log('[Auth] normalized user_id:', normalized.user_id);
    console.log('[Auth] normalized user_type:', normalized.user_type);
  }
  return normalized;
}

// ── Session helpers ───────────────────────────────────────────────────────────

const IS_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function saveSession(res: AuthResponse): Promise<void> {
  if (__DEV__ && !IS_UUID.test(res.user_id)) {
    console.warn('[Auth] ⚠ user_id is not a valid UUID:', res.user_id,
      '— backend may not be returning the user object correctly');
  }
  const expiresIn = res.expires_in ?? 3600;
  await storage.setItem('userToken',      res.access_token);
  await storage.setItem('refreshToken',   res.refresh_token);
  await storage.setItem('userId',         res.user_id);
  await storage.setItem('userType',       res.user_type);
  await storage.setItem('tokenExpiresAt', String(Date.now() + expiresIn * 1000));
}

async function clearSession(): Promise<void> {
  await storage.deleteItem('userToken');
  await storage.deleteItem('refreshToken');
  await storage.deleteItem('userId');
  await storage.deleteItem('userType');
  await storage.deleteItem('tokenExpiresAt');
}

// ── Mock helpers ──────────────────────────────────────────────────────────────

async function mockRegister(
  email: string,
  user_type: 'student' | 'landlord',
): Promise<AuthResponse> {
  await sleep(900);
  const resp: AuthResponse = {
    access_token:  `mock_access_${Date.now()}`,
    refresh_token: `mock_refresh_${Date.now()}`,
    user_id:       `mock_${Date.now()}`,
    user_type,
    expires_in:    3600,
  };
  await saveSession(resp);
  return resp;
}

async function mockLogin(email: string): Promise<AuthResponse> {
  await sleep(900);
  const resp: AuthResponse = {
    access_token:  `mock_access_${Date.now()}`,
    refresh_token: `mock_refresh_${Date.now()}`,
    user_id:       `mock_${Date.now()}`,
    user_type:     'student',
    expires_in:    3600,
  };
  await saveSession(resp);
  return resp;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const authService = {
  register: async (
    email: string,
    password: string,
    user_type: 'student' | 'landlord' = 'student',
    name?: string,
  ): Promise<AuthResponse> => {
    if (USE_MOCK) return mockRegister(email, user_type);
    const response = await api.post('/auth/signup', {
      email,
      password,
      userType: user_type,
      ...(name ? { name } : {}),
    });
    const normalized = normalizeAuthResponse(response.data);
    await saveSession(normalized);
    return normalized;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    if (USE_MOCK) return mockLogin(email);
    const response = await api.post('/auth/login', { email, password });
    const normalized = normalizeAuthResponse(response.data);
    await saveSession(normalized);
    return normalized;
  },

  logout: async (): Promise<void> => {
    if (!USE_MOCK) {
      const refreshToken = await storage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken }).catch(() => {});
      }
    }
    await clearSession();
  },

  isTokenExpired: async (): Promise<boolean> => {
    const raw = await storage.getItem('tokenExpiresAt');
    if (!raw) return true;
    return Date.now() >= Number(raw) - 60_000;
  },

  getToken:    async (): Promise<string | null>            => storage.getItem('userToken'),
  getUserId:   async (): Promise<string | null>            => storage.getItem('userId'),
  getUserType: async (): Promise<'student' | 'landlord'>   => {
    const t = await storage.getItem('userType');
    return t === 'landlord' ? 'landlord' : 'student';
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  /**
   * Access token'ı refresh token ile yeniler.
   * İki format dener: body'de refresh_token, başarısızsa Authorization header ile.
   * Başarısızsa oturumu temizler.
   */
  refreshAccessToken: async (): Promise<boolean> => {
    try {
      const refreshToken = await storage.getItem('refreshToken');
      if (!refreshToken) {
        console.warn('[Auth] No refresh token available');
        return false;
      }

      const baseURL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/api\/v1\/?$/, '');
      const url = `${baseURL}/api/v1/auth/refresh`;

      console.log('[Auth] Attempting to refresh token…');

      // TRY #1: refresh_token in body
      let response = await axios.post(url,
        { refresh_token: refreshToken },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 },
      ).catch(e => e.response);

      // TRY #2: 422 → send token in Authorization header instead
      if (response?.status === 422) {
        console.log('[Auth] 422 with body, retrying with Authorization header…');
        response = await axios.post(url, {},
          { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${refreshToken}` }, timeout: 10000 },
        ).catch(e => e.response);
      }

      if (!response || response.status < 200 || response.status >= 300) {
        console.error('[Auth] Refresh failed:', response?.status);
        await clearSession();
        useAppStore.getState().clearUser?.();
        return false;
      }

      const data = response.data ?? response;
      const newAccess  = data.accessToken  ?? data.access_token;
      const newRefresh = data.refreshToken ?? data.refresh_token ?? refreshToken;
      const expiresIn  = data.expires_in   ?? 3600;

      if (!newAccess) {
        console.warn('[Auth] Refresh response missing access_token');
        return false;
      }

      await storage.setItem('userToken',     newAccess);
      await storage.setItem('refreshToken',  newRefresh);
      await storage.setItem('tokenExpiresAt', String(Date.now() + expiresIn * 1000));
      useAppStore.getState().setToken(newAccess);

      console.log('[Auth] Token refreshed successfully');
      return true;
    } catch (err) {
      console.error('[Auth] refreshAccessToken error:', err);
      return false;
    }
  },
};
