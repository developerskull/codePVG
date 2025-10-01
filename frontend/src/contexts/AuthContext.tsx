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
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
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
    const initializeAuth = async () => {
      try {
        // First, try to use cached data for immediate UI response
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setLoading(false); // Show UI immediately with cached data
        }

        const supabase = getSupabaseClient();
        
        // Get the current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          // Clear any invalid stored data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
          setLoading(false);
          return;
        }

        if (session?.user && session?.access_token) {
          // Only fetch profile if we don't have cached data or if the user ID changed
          const cachedUser = storedUser ? JSON.parse(storedUser) : null;
          const shouldFetchProfile = !cachedUser || cachedUser.id !== session.user.id;
          
          if (shouldFetchProfile) {
            // Get user profile from database
            const { data: profile, error: profErr } = await supabase
              .from('users')
              .select('id, name, email, username, role, approval_status, verified, created_at')
              .eq('auth_user_id', session.user.id)
              .single();

            if (profErr || !profile) {
              console.error('Profile error:', profErr);
              // Clear invalid session
              await supabase.auth.signOut();
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setToken(null);
            } else {
              setUser(profile as any);
              setToken(session.access_token);
              localStorage.setItem('token', session.access_token);
              localStorage.setItem('user', JSON.stringify(profile));
            }
          } else {
            // Use cached data, just update token if needed
            setToken(session.access_token);
            localStorage.setItem('token', session.access_token);
          }
        } else {
          // No valid session, clear stored data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const supabase = getSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user && session?.access_token) {
        // Get user profile
        const { data: profile, error: profErr } = await supabase
          .from('users')
          .select('id, name, email, username, role, approval_status, verified, created_at')
          .eq('auth_user_id', session.user.id)
          .single();

        if (profErr || !profile) {
          console.error('Profile error on sign in:', profErr);
          await supabase.auth.signOut();
        } else {
          setUser(profile as any);
          setToken(session.access_token);
          localStorage.setItem('token', session.access_token);
          localStorage.setItem('user', JSON.stringify(profile));
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        setToken(session.access_token);
        localStorage.setItem('token', session.access_token);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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

      // Set loading to false immediately after successful auth
      setLoading(false);

      const authUserId = data.user.id;
      const accessToken = data.session?.access_token || '';
      
      // Set token immediately for faster response
      setToken(accessToken);
      localStorage.setItem('token', accessToken);

      // Fetch profile in background (don't block UI)
      try {
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
        localStorage.setItem('user', JSON.stringify(profile));
        showToast({ title: 'Login successful', description: 'Welcome back!', variant: 'success' });
      } catch (profileError) {
        console.error('Profile fetch error:', profileError);
        // Don't throw here, user is already authenticated
        showToast({ title: 'Login successful', description: 'Welcome back!', variant: 'success' });
      }
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
        let message = insErr.message || 'Failed to create profile';
        
        // Handle specific database constraint errors
        if (insErr.message?.includes('users_prn_key')) {
          message = 'This PRN number is already registered. Please use a different PRN or contact support if this is an error.';
        } else if (insErr.message?.includes('users_email_key')) {
          message = 'This email is already registered. Please use a different email or try logging in.';
        } else if (insErr.message?.includes('users_username_key')) {
          message = 'This username is already taken. Please choose a different username.';
        }
        
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

  const refreshToken = async (): Promise<string | null> => {
    try {
      const supabase = getSupabaseClient();
      
      // First check if we have a valid session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        console.log('No current session found, cannot refresh token');
        logout();
        return null;
      }
      
      // Try to refresh the session
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error || !session?.access_token) {
        console.error('Token refresh failed:', error);
        logout(); // Logout if refresh fails
        return null;
      }
      
      const newToken = session.access_token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      return newToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return null;
    }
  };

  const logout = async () => {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear all Supabase-related localStorage items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    refreshToken,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
