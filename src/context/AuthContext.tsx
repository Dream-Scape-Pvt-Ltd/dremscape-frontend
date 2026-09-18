'use client';

import React, {createContext, useContext, useEffect, useState, useCallback} from 'react';
import {authService} from '../services/auth.service.ts';
import {ApiClientError} from '../services/api-client.ts';
import {tokenStorage} from '../utils/token-storage.ts';
import type {User, LoginPayload, RegisterPayload} from '../types/auth.ts';

export interface AuthContextType {
  user: User | null;
  userName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    if (!tokenStorage.hasAccessToken()) {
      setUser(null);
      setUserName(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.getMe();
      setUserName(data.name || null);
      if (data.user) {
        setUser(data.user);
      }
    } catch (err) {
      setUser(null);
      setUserName(null);
      if (err instanceof ApiClientError && err.status !== 401) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(payload);
      setUser(response.user || null);
      setUserName(response.user?.first_name || null);
      await refreshSession();
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : 'Sign in failed.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(payload);
      setUser(response.user || null);
      setUserName(response.user?.first_name || null);
      await refreshSession();
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : 'Registration failed.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.logout();
      setUser(null);
      setUserName(null);
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : 'Logout failed.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userName,
        isAuthenticated: Boolean(userName || user),
        isLoading,
        error,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
