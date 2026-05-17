import api from './client';
import { storage } from '../utils/storage';

export type AuthResponse = {
  access_token:  string;
  refresh_token: string;
  user_id:       string;
};

export const authService = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    console.log('\n=== REGISTER START ===');
    console.log('Email:', email);
    console.log('Password length:', password.length);

    try {
      const response = await api.post<AuthResponse>('/auth/register', { email, password });
      const { access_token, refresh_token, user_id } = response.data;

      await storage.setItem('userToken',    access_token);
      await storage.setItem('refreshToken', refresh_token);
      await storage.setItem('userId',       user_id);

      console.log('=== REGISTER SUCCESS — user_id:', user_id, '===\n');
      return response.data;
    } catch (error: any) {
      console.log('\n=== REGISTER FAILED ===');
      console.error('Message:', error.message);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('URL:', error.config?.url);
      throw error;
    }
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    console.log('\n=== LOGIN START ===');
    console.log('Email:', email);

    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      const { access_token, refresh_token, user_id } = response.data;

      await storage.setItem('userToken',    access_token);
      await storage.setItem('refreshToken', refresh_token);
      await storage.setItem('userId',       user_id);

      console.log('=== LOGIN SUCCESS — user_id:', user_id, '===\n');
      return response.data;
    } catch (error: any) {
      console.log('\n=== LOGIN FAILED ===');
      console.error('Message:', error.message);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await storage.deleteItem('userToken');
      await storage.deleteItem('refreshToken');
      await storage.deleteItem('userId');
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  getToken: async (): Promise<string | null> => {
    try {
      const token = await storage.getItem('userToken');
      console.log('Token:', token ? 'exists' : 'not found');
      return token;
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },

  getUserId: async (): Promise<string | null> => {
    try {
      return await storage.getItem('userId');
    } catch {
      return null;
    }
  },
};
