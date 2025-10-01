'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, userData?: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const doFetch = async (url: string, init: RequestInit) => {
    // Add a timeout to avoid hanging network requests masking as "Failed to fetch"
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal, headers: { Accept: 'application/json', ...(init.headers || {}) } });
      clearTimeout(timeout);
      return res;
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  };

  useEffect(() => {
    // Check for stored token and user data
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data?.user) {
        const message = error?.message || 'Login failed';
        showToast({ title: 'Login error', description: message, variant: 'error' });
        throw new Error(message);
      }

      const authUserId = data.user.id;
      const { data: profile, error: profErr } = await supabase
        .from('users')
        .select('id, name, email, username, role, approval_status, verified, created_at')
        .eq('auth_user_id', authUserId)
        .single();

      if (profErr || !profile) {
        const message = profErr?.message || 'User profile not found';
        showToast({ title: 'Login error', description: message, variant: 'error' });
        throw new Error(message);
      }

      setUser(profile as any);
      const accessToken = data.session?.access_token || '';
      setToken(accessToken);
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(profile));
      showToast({ title: 'Login successful', description: 'Welcome back!', variant: 'success' });
    } catch (error) {
      console.error('Login error:', error);
      const message = error instanceof Error ? error.message : 'Login failed';
      showToast({ title: 'Login error', description: message, variant: 'error' });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, userData: any = {}) => {
    try {
      const supabase = getSupabaseClient();
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, username: userData?.username || null } },
      });
      if (authErr || !authData?.user) {
        const message = authErr?.message || 'Registration failed';
        showToast({ title: 'Signup error', description: message, variant: 'error' });
        throw new Error(message);
      }

      const authUserId = authData.user.id;
      const { error: insErr } = await supabase
        .from('users')
        .insert({
          auth_user_id: authUserId,
          email,
          name,
          username: userData?.username || null,
          prn: userData?.prn || null,
          batch: userData?.batch || null,
          department: userData?.department || null,
          college_id: userData?.college_id || null,
          year_of_study: userData?.year_of_study || null,
          bio: userData?.bio || null,
          approval_status: 'pending',
          role: 'student',
        });
      if (insErr) {
        const message = insErr.message || 'Failed to create profile';
        showToast({ title: 'Signup error', description: message, variant: 'error' });
        throw new Error(message);
      }

      // Do not auto-login; require email confirmation
      showToast({ title: 'Signup successfully', description: 'Check email for confirmation', variant: 'success' });
    } catch (error) {
      console.error('Registration error:', error);
      const message = error instanceof Error ? error.message : 'Registration failed';
      showToast({ title: 'Signup error', description: message, variant: 'error' });
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
