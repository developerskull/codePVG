'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Eye, EyeOff, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login for:', email);
      await login(email, password);
      console.log('Login successful, redirecting...');
      // The AuthContext will handle the redirect based on user role
      // Don't redirect here to avoid conflicts
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      console.error('Error message:', errorMessage);
      setError(errorMessage);

      // If it's a pending approval error, redirect to pending page
      if (errorMessage.includes('pending admin approval')) {
        setTimeout(() => {
          router.push('/auth/pending-approval');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInSignIn = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('LinkedIn sign-in error:', error);
        setError(error.message);
        setLoading(false);
      }
      // If successful, the browser will redirect to LinkedIn
    } catch (err) {
      console.error('LinkedIn sign-in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with LinkedIn');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <BackButton />
            <Link href="/" className="inline-flex items-center space-x-2">
              <Code className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">CollegeCodeHub</span>
            </Link>
            <div></div>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">
              Sign in to your account to continue coding
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {loading && (
                <div className="mt-2 text-center text-sm text-muted-foreground">
                  Please wait while we sign you in...
                </div>
              )}
            </form>

            {/* Social Login Options */}
            <div className="mt-6">
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLinkedInSignIn}
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-50 border-gray-300 text-blue-700 hover:text-blue-800"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Continue with LinkedIn
                </Button>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Demo Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div><strong>Student:</strong> student@example.com / password123</div>
              <div><strong>Admin:</strong> admin@example.com / password123</div>
              <div><strong>Super Admin:</strong> superadmin@example.com / password123</div>
              <div><strong>Pending Student:</strong> pending@example.com / password123</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
