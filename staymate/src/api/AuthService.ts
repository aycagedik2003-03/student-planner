import * as SecureStore from 'expo-secure-store';
import api from './client';

export type AuthResponse = {
  access_token:  string;
  refresh_token: string;
  user_id:       string;
};

export const authService = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    console.log('Register request:', { email });
    const res = await api.post<AuthResponse>('/auth/register', { email, password });
    const { access_token, refresh_token, user_id } = res.data;
    await SecureStore.setItemAsync('userToken',     access_token);
    await SecureStore.setItemAsync('refreshToken',  refresh_token);
    await SecureStore.setItemAsync('userId',        user_id);
    return { access_token, refresh_token, user_id };
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    console.log('Login request:', { email });
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    const { access_token, refresh_token, user_id } = res.data;
    await SecureStore.setItemAsync('userToken',    access_token);
    await SecureStore.setItemAsync('refreshToken', refresh_token);
    await SecureStore.setItemAsync('userId',       user_id);
    return { access_token, refresh_token, user_id };
  },

  logout: async (): Promise<void> => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('userId');
  },

  getToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync('userToken');
    } catch {
      return null;
    }
  },

  getUserId: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync('userId');
    } catch {
      return null;
    }
  },
};
