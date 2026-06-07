import React, { createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../store';
import { authService } from '../api/AuthService';
import { navigationRef } from '../utils/navigationRef';

interface AuthContextType {
  signOut: () => Promise<void>;
  signIn:  (token: string) => void;
  token:   string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setToken, clearUser } = useAppStore();

  const signOut = async () => {
    // Best-effort: clear everything, then navigate — even if one step throws
    try { await authService.logout(); } catch { /* already clears locally */ }
    try { await AsyncStorage.removeItem('@roomski/language'); } catch {}
    clearUser();
    navigationRef.current?.reset({ index: 0, routes: [{ name: 'Auth' }] });
  };

  const signIn = (newToken: string) => {
    setToken(newToken);
  };

  return (
    <AuthContext.Provider value={{ signOut, signIn, token }}>
      {children}
    </AuthContext.Provider>
  );
}
