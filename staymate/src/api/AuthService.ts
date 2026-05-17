import api from './client';
import { storage } from '../utils/storage';

export type AuthResponse = {
  access_token:  string;
  refresh_token: string;
  user_id:       string;
  user_type:     'student' | 'landlord';
};

export const authService = {
  register: async (
    email: string,
    password: string,
    user_type: 'student' | 'landlord' = 'student',
  ): Promise<AuthResponse> => {
    console.log('\n=== REGISTER START ===');
    console.log('Email:', email, '| user_type:', user_type);

    try {
      const response = await api.post<AuthResponse>('/auth/register', {
        email,
        password,
        user_type,
      });
      const { access_token, refresh_token, user_id, user_type: returnedType } = response.data;

      await storage.setItem('userToken',    access_token);
      await storage.setItem('refreshToken', refresh_token);
      await storage.setItem('userId',       user_id);
      await storage.setItem('userType',     returnedType ?? user_type);

      console.log('=== REGISTER SUCCESS — user_id:', user_id, 'user_type:', returnedType, '===\n');
      return response.data;
    } catch (error: any) {
      console.log('\n=== REGISTER FAILED ===');
      console.error('Message:', error.message);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      throw error;
    }
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    console.log('\n=== LOGIN START ===');
    console.log('Email:', email);

    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      const { access_token, refresh_token, user_id, user_type } = response.data;

      await storage.setItem('userToken',    access_token);
      await storage.setItem('refreshToken', refresh_token);
      await storage.setItem('userId',       user_id);
      await storage.setItem('userType',     user_type ?? 'student');

      console.log('=== LOGIN SUCCESS — user_id:', user_id, 'user_type:', user_type, '===\n');
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
      await storage.deleteItem('userType');
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

  getUserType: async (): Promise<'student' | 'landlord'> => {
    try {
      const t = await storage.getItem('userType');
      return (t === 'landlord') ? 'landlord' : 'student';
    } catch {
      return 'student';
    }
  },
};
