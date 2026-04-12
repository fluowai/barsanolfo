import { useState, useCallback } from 'react';
import { AuthToken, AuthUser } from '../types';
import { STORAGE_KEYS } from '../constants';

interface UseAuthReturn {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  loadFromStorage: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const loadFromStorage = useCallback(() => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    
    if (storedToken) setToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Erro ao carregar usuário do storage', e);
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Falha ao fazer login');

      const { accessToken, user: userData }: { accessToken: string; user: AuthUser } = await response.json();
      
      setToken(accessToken);
      setUser(userData);
      
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) throw new Error('Falha ao registrar');

      const { accessToken, user: userData }: { accessToken: string; user: AuthUser } = await response.json();
      
      setToken(accessToken);
      setUser(userData);
      
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao registrar:', error);
      throw error;
    }
  }, []);

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    register,
    loadFromStorage,
  };
}
