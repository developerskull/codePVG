'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [prn, setPrn] = useState('');
  const [batch, setBatch] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // Function to check if PRN already exists
  const checkPRNExists = async (prnValue: string): Promise<boolean> => {
    if (!prnValue.trim()) return false;
    
    try {
      const response = await fetch('/api/check-prn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prn: prnValue }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.exists;
      }
      return false;
    } catch (error) {
      console.error('Error checking PRN:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (password !== confirmPassword) {
      showToast({ 
        title: 'Validation Error', 
        description: 'Passwords do not match', 
        variant: 'error' 
      });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      showToast({ 
        title: 'Validation Error', 
        description: 'Password must be at least 6 characters long', 
        variant: 'error' 
      });
      setLoading(false);
      return;
    }

    if (!name.trim()) {
      showToast({ 
        title: 'Validation Error', 
        description: 'Full name is required', 
        variant: 'error' 
      });
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      showToast({ 
        title: 'Validation Error', 
        description: 'Email is required', 
        variant: 'error' 
      });
      setLoading(false);
      return;
    }

    // Check if PRN already exists (only if PRN is provided)
    if (prn.trim()) {
      try {
        const prnExists = await checkPRNExists(prn);
        if (prnExists) {
          showToast({ 
            title: 'PRN Already Exists', 
            description: 'This PRN number is already registered. Please use a different PRN or contact support if this is an error.', 
            variant: 'error' 
          });
          setLoading(false);
          return;
        }
      } catch (error) {
        // If PRN check fails, continue with registration and let backend handle it
        console.warn('PRN check failed, continuing with registration:', error);
      }
    }

    try {
      const userData = {
        username: username || undefined,
        prn: prn || undefined,
        batch: batch || undefined,
        department: department || undefined,
        phone_number: phoneNumber || undefined,
        year_of_study: yearOfStudy ? parseInt(yearOfStudy) : undefined,
      };

      await register(name, email, password, userData);
      // Redirect to home page after successful registration
      router.push('/');
    } catch (err) {
      // Error handling is done in the AuthContext with toast notifications
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInSignIn = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase.auth.signInWithOAuth({
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
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl">
        <div className="bg-white rounded-lg shadow-lg border p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">Create Account</h1>
              <p className="text-muted-foreground mt-2">Join our community and start your journey</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Left Side - Basic Information */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold">Personal Information</h2>
                      <p className="text-muted-foreground">Enter your basic details to get started</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
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
                      <Label htmlFor="password">
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-2 py-1 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-2 py-1 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={loading}
                        >
                          {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Additional Information */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold">Additional Information</h2>
                      <p className="text-muted-foreground">Optional details about yourself</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="phone">Mobile Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98XXXXXX90"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="batch">Batch</Label>
                      <select
                        id="batch"
                        value={batch}
                        onChange={(e) => setBatch(e.target.value)}
                        disabled={loading}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select batch</option>
                        <option value="2022-2026">2022-2026</option>
                        <option value="2023-2027">2023-2027</option>
                        <option value="2024-2028">2024-2028</option>
                        <option value="2025-2029">2025-2029</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <select
                        id="year"
                        value={yearOfStudy}
                        onChange={(e) => setYearOfStudy(e.target.value)}
                        disabled={loading}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select year</option>
                        <option value="1">First</option>
                        <option value="2">Second</option>
                        <option value="3">Third</option>
                        <option value="4">Fourth</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">Department (Optional)</Label>
                      <select
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        disabled={loading}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select department</option>
                        <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
                        <option value="Computer Engineering">Computer Engineering</option>
                        <option value="Electronics and Telecommunication">Electronics and Telecommunication</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prn">PRN Number</Label>
                      <Input
                        id="prn"
                        type="text"
                        placeholder="Enter PRN"
                        value={prn}
                        onChange={(e) => setPrn(e.target.value.toUpperCase())}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="mt-8">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </div>

              {/* Social Login Options */}
              <div className="mt-8">
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.location.href = 'http://localhost:5000/api/auth/linkedin'}
                    disabled={loading}
                    className="w-full bg-white hover:bg-gray-50 border-gray-300 text-blue-700 hover:text-blue-800"
                  >
                    <Linkedin className="mr-2 h-4 w-4 text-blue-600" />
                    LinkedIn
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
                    disabled={loading}
                    className="w-full bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-800"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                </div>
              </div>

              {/* Footer Links */}
              <div className="text-center text-sm text-muted-foreground">
                Already have an Account? <Link href="/auth/login" className="text-primary hover:underline">Sign in</Link>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                By creating an account, you agree to our <Link href="/terms" className="underline">Terms of Service</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}