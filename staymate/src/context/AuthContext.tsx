import React, { createContext, useContext } from 'react';
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
    await authService.logout();
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
