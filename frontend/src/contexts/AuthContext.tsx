'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/lib/types';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (user: User, token: string) => void;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    year: number;
    branch: string;
    bio?: string;
    skills?: string[];
  }) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const isAuthenticated = !!user && !!token;

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setToken(savedToken);
      api.setToken(savedToken);
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fetch current user data
  const fetchCurrentUser = async () => {
    try {
      const response = await api.getMe() as { data: { user: User } };
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      // If token is invalid, clear it
      localStorage.removeItem('auth_token');
      api.removeToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.login({ email, password }) as { data: { user: User; token: string } };
      
      const { user: userData, token: authToken } = response.data;
      
      setUser(userData);
      setToken(authToken);
      api.setToken(authToken);
      localStorage.setItem('auth_token', authToken);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Login with token (for OAuth)
  const loginWithToken = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    api.setToken(authToken);
    localStorage.setItem('auth_token', authToken);
  };

  // Register function
  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    year: number;
    branch: string;
    bio?: string;
    skills?: string[];
  }) => {
    try {
      setIsLoading(true);
      const response = await api.register({
        ...userData,
        year: userData.year.toString(),
      }) as { data: { user: User; token: string } };
      
      const { user: newUser, token: authToken } = response.data;
      
      setUser(newUser);
      setToken(authToken);
      api.setToken(authToken);
      localStorage.setItem('auth_token', authToken);
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    api.removeToken();
    localStorage.removeItem('auth_token');
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      if (!token) return;
      
      const response = await api.refreshToken(token) as { data: { token: string } };
      const { token: newToken } = response.data;
      
      setToken(newToken);
      api.setToken(newToken);
      localStorage.setItem('auth_token', newToken);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
    loginWithToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
