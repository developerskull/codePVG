'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  username: string;
  role: 'student' | 'admin' | 'superadmin';
  verified: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, userData?: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();
  const router = useRouter();

  // Fetch user profile from the users table
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(authError.message || 'Login failed');
      }

      if (!data.user) {
        throw new Error('No user returned from login');
      }

      // Fetch user profile
      let profileData = await fetchProfile(data.user.id);

      // If profile doesn't exist, create it
      if (!profileData) {
        console.log('Profile not found, creating new profile for user:', data.user.email);
        try {
          const email = data.user.email || '';
          const name = data.user.user_metadata?.name ||
                     data.user.user_metadata?.full_name ||
                     email.split('@')[0];

          const { data: newProfile, error: insertError } = await supabase
            .from('users')
            .insert({
              auth_user_id: data.user.id,
              email,
              name,
              username: null,
              prn: null,
              batch: null,
              department: null,
              college_id: null,
              year_of_study: null,
              bio: null,
              approval_status: 'pending',
              role: 'student',
            })
            .select('*')
            .single();

          if (insertError) {
            console.error('Failed to create profile during login:', insertError);
            throw new Error('Failed to create user profile. Please try again.');
          }

          profileData = newProfile;
          console.log('Profile created successfully during login');
        } catch (profileError) {
          console.error('Error creating profile during login:', profileError);
          throw new Error('Failed to set up user profile. Please contact support.');
        }
      }

      setUser(data.user);
      setSession(data.session);
      setProfile(profileData);

      // Handle approval status and redirect
      if (profileData.approval_status === 'pending') {
        console.log('User pending approval, redirecting to pending page');
        router.push('/auth/pending-approval');
        return;
      }

      if (profileData.approval_status === 'rejected') {
        console.log('User rejected, showing error message');
        throw new Error('Your account has been rejected. Please contact an administrator.');
      }

      // Redirect based on role
      if (profileData.role === 'admin' || profileData.role === 'superadmin') {
        console.log('Admin user, redirecting to admin dashboard');
        router.push('/admin');
      } else {
        console.log('Regular user, redirecting to home');
        router.push('/');
      }

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function (for signup page)
  const register = async (name: string, email: string, password: string, userData?: any): Promise<void> => {
    try {
      setLoading(true);

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('Register auth error:', authError);
        throw new Error(authError.message || 'Registration failed');
      }

      if (!data.user) {
        throw new Error('No user created');
      }

      // Prepare profile data
      const profileData = {
        auth_user_id: data.user.id,
        name,
        email,
        username: userData?.username || null,
        role: 'student',
        verified: false,
        approval_status: 'pending',
        ...(userData?.prn && { prn: userData.prn }),
        ...(userData?.batch && { batch: userData.batch }),
        ...(userData?.department && { department: userData.department }),
        ...(userData?.phone_number && { phone_number: userData.phone_number }),
        ...(userData?.year_of_study && { year_of_study: userData.year_of_study }),
      };

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert(profileData);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error('Failed to create user profile');
      }

      // Don't log in automatically - wait for email confirmation
      throw new Error('Please check your email to confirm your account before logging in.');

    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error);
        throw new Error(error.message || 'Logout failed');
      }

      setUser(null);
      setProfile(null);
      setSession(null);
      router.push('/auth/login');

    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Refresh profile function
  const refreshProfile = async (): Promise<void> => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('Initial session found for user:', session.user.email);
          const profileData = await fetchProfile(session.user.id);

          if (profileData) {
            console.log('Initial profile fetched successfully:', profileData.email);
            setProfile(profileData);
          } else {
            console.error('❌ Initial profile not found for user:', session.user.email);
            // Profile doesn't exist - create one
            try {
              const email = session.user.email || '';
              const name = session.user.user_metadata?.name ||
                         session.user.user_metadata?.full_name ||
                         email.split('@')[0];

              const { data: newProfile, error: insertError } = await supabase
                .from('users')
                .insert({
                  auth_user_id: session.user.id,
                  email,
                  name,
                  username: null,
                  prn: null,
                  batch: null,
                  department: null,
                  college_id: null,
                  year_of_study: null,
                  bio: null,
                  approval_status: 'pending',
                  role: 'student',
                })
                .select('*')
                .single();

              if (insertError) {
                console.error('Failed to create initial profile:', insertError);
              } else {
                console.log('Initial profile created successfully:', newProfile);
                setProfile(newProfile);
              }
            } catch (profileError) {
              console.error('Error creating initial profile:', profileError);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            console.log('Fetching profile for user:', session.user.id);
            const profileData = await fetchProfile(session.user.id);

            if (profileData) {
              console.log('Profile fetched successfully:', profileData.email, profileData.role);
              setProfile(profileData);

              // Handle approval status
              if (profileData.approval_status === 'pending') {
                console.log('User pending approval, redirecting to pending page');
                router.push('/auth/pending-approval');
              } else if (profileData.approval_status === 'rejected') {
                console.log('User rejected, staying on login page');
                // Stay on login page or show error
              } else if (profileData.role === 'admin' || profileData.role === 'superadmin') {
                console.log('Admin user, redirecting to admin dashboard');
                router.push('/admin');
              } else {
                console.log('Regular user, redirecting to home');
                router.push('/');
              }
            } else {
              console.error('❌ Profile not found for user:', session.user.email);
              console.log('User exists in auth but not in users table');

              // Profile doesn't exist - this might be a new OAuth user or missing profile
              // For now, create a basic profile or redirect to setup
              try {
                console.log('Attempting to create profile for user...');
                const email = session.user.email || '';
                const name = session.user.user_metadata?.name ||
                           session.user.user_metadata?.full_name ||
                           email.split('@')[0];

                const { data: newProfile, error: insertError } = await supabase
                  .from('users')
                  .insert({
                    auth_user_id: session.user.id,
                    email,
                    name,
                    username: null,
                    prn: null,
                    batch: null,
                    department: null,
                    college_id: null,
                    year_of_study: null,
                    bio: null,
                    approval_status: 'pending',
                    role: 'student',
                  })
                  .select('*')
                  .single();

                if (insertError) {
                  console.error('Failed to create profile:', insertError);
                  // Profile creation failed - redirect to error page or stay on login
                  router.push('/auth/login?error=profile_creation_failed');
                } else {
                  console.log('Profile created successfully:', newProfile);
                  setProfile(newProfile);
                  router.push('/auth/pending-approval');
                }
              } catch (profileError) {
                console.error('Error creating profile:', profileError);
                router.push('/auth/login?error=profile_creation_failed');
              }
            }
          } catch (error) {
            console.error('Error in auth state change:', error);
            setProfile(null);
          }
        } else {
          console.log('No session user, clearing profile');
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
      }