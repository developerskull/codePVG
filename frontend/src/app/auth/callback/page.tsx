'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // Get the code from URL (Supabase Auth will handle the exchange)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setError(sessionError.message);
          setProcessing(false);
          return;
        }

        if (!session?.user) {
          setError('No session found. Please try signing in again.');
          setProcessing(false);
          return;
        }

        const authUserId = session.user.id;
        
        // Check if user profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from('users')
          .select('id, name, email, username, role, approval_status, verified, created_at')
          .eq('auth_user_id', authUserId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 = not found, which is ok for new users
          console.error('Error fetching profile:', fetchError);
          setError('Failed to fetch user profile');
          setProcessing(false);
          return;
        }

        let userProfile = existingProfile;

        // If profile doesn't exist, create it
        if (!existingProfile) {
          const email = session.user.email || '';
          const name = session.user.user_metadata?.name ||
                       session.user.user_metadata?.full_name ||
                       email.split('@')[0];

          const { data: newProfile, error: insertError } = await supabase
            .from('users')
            .insert({
              auth_user_id: authUserId,
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
            .select('id, name, email, username, role, approval_status, verified, created_at')
            .single();

          if (insertError) {
            console.error('Error creating profile:', insertError);
            setError('Failed to create user profile');
            setProcessing(false);
            return;
          }

          userProfile = newProfile;
        }

        // Existing user - Store user data and token in localStorage
        if (userProfile) {
          localStorage.setItem('token', session.access_token);
          localStorage.setItem('user', JSON.stringify(userProfile));
          
          // Check approval status
          if (userProfile.approval_status === 'pending') {
            router.push('/auth/pending-approval');
          } else if (userProfile.approval_status === 'approved') {
            router.push('/dashboard');
          } else {
            router.push('/');
          }
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred during authentication');
        setProcessing(false);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-600">Authentication Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <button
              onClick={() => router.push('/auth/login')}
              className="text-primary hover:underline"
            >
              Return to login
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <CardTitle className="text-2xl">Completing Sign In</CardTitle>
          <CardDescription>
            {processing ? 'Please wait while we set up your account...' : 'Redirecting...'}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

