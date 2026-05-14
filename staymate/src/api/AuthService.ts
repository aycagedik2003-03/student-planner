import * as SecureStore from 'expo-secure-store';
import api from './client';

export type AuthResponse = {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export const authService = {
  /**
   * Yeni kullanıcı kaydı.
   * Başarılı olursa token'ı SecureStore'a yazar ve response'u döner.
   */
  register: async (
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
    });
    await SecureStore.setItemAsync('userToken', res.data.access_token);
    return res.data;
  },

  /**
   * Mevcut kullanıcı girişi.
   * Başarılı olursa token'ı SecureStore'a yazar ve response'u döner.
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    await SecureStore.setItemAsync('userToken', res.data.access_token);
    return res.data;
  },

  /**
   * Çıkış — token'ı SecureStore'dan siler.
   */
  logout: async (): Promise<void> => {
    await SecureStore.deleteItemAsync('userToken');
  },

  /**
   * Uygulama açılışında mevcut token'ı kontrol eder.
   * Varsa token string'i döner, yoksa null.
   */
  getToken: (): Promise<string | null> =>
    SecureStore.getItemAsync('userToken'),
};
