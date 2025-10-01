'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Eye, EyeOff, Linkedin } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

interface College {
  id: string;
  name: string;
  city?: string;
  state?: string;
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [prn, setPrn] = useState('');
  const [batch, setBatch] = useState('');
  const [department, setDepartment] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [colleges, setColleges] = useState<College[]>([]);
  const [collegeSearch, setCollegeSearch] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const router = useRouter();

  // Fetch colleges
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/auth/colleges?search=${collegeSearch}`);
        setColleges(response.data.colleges);
      } catch (err) {
        console.error('Failed to fetch colleges:', err);
        // Silently fail - colleges feature will work once backend is properly configured
        setColleges([]);
      }
    };

    if (collegeSearch.length > 2) {
      fetchColleges();
    } else {
      setColleges([]);
    }
  }, [collegeSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        name,
        email,
        password,
        username: username || undefined,
        prn: prn || undefined,
        batch: batch || undefined,
        department: department || undefined,
        college_id: collegeId || undefined,
        year_of_study: yearOfStudy ? parseInt(yearOfStudy) : undefined,
      };

      await register(name, email, password, userData);
      // Redirect to home page after successful registration
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Left Side - Basic Information */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 m-0 bg-white border-r border-gray-200">
        <div className="w-full max-w-md">
          {/* Header - Desktop */}
          <div className="hidden lg:block mb-8">
            <div className="text-center mb-6">
              <Link href="/" className="inline-flex items-center space-x-3 justify-center">
                <Code className="h-8 w-8 text-gray-800" />
                <span className="text-3xl font-bold text-gray-900">CollegeCodeHub</span>
              </Link>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-sm text-gray-600">Enter your basic details to get started</p>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="lg:hidden mb-8">
            <div className="text-center mb-6">
              <Link href="/" className="inline-flex items-center space-x-3 justify-center">
                <Code className="h-8 w-8 text-gray-800" />
                <span className="text-3xl font-bold text-gray-900">CollegeCodeHub</span>
              </Link>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Create Account</h2>
              <p className="text-sm text-gray-600">Join our coding platform</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm">Full Name *</Label>
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

            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-9"
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

            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-sm">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-9"
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

            <div className="lg:hidden mt-6">
              <Button type="submit" className="w-full h-10 bg-gray-900 hover:bg-gray-800 text-white font-medium transition-colors" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Continue to College Info'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - College Information */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 m-0 bg-white">
        <div className="w-full max-w-md">
          {/* Header - Desktop */}
          <div className="hidden lg:block text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">College Information</h2>
            <p className="text-sm text-gray-600">Optional details about your college</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="username" className="text-sm">Username (Optional)</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="prn" className="text-sm">PRN Number (Optional)</Label>
              <Input
                id="prn"
                type="text"
                placeholder="Enter PRN"
                value={prn}
                onChange={(e) => setPrn(e.target.value.toUpperCase())}
                disabled={loading}
                className="h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="batch" className="text-sm">Batch</Label>
                <Input
                  id="batch"
                  type="text"
                  placeholder="2021-2025"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  disabled={loading}
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="year" className="text-sm">Year</Label>
                <select
                  id="year"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Year</option>
                  <option value="1">1st</option>
                  <option value="2">2nd</option>
                  <option value="3">3rd</option>
                  <option value="4">4th</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="department" className="text-sm">Department (Optional)</Label>
              <select
                id="department"
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={loading}
              >
                <option value="">Select department</option>
                <option value="Computer Science">CS</option>
                <option value="AI & Data Science">AI & DS</option>
                <option value="Information Technology">IT</option>
                <option value="Electronics & Telecommunication">E&TC</option>
                <option value="Mechanical Engineering">Mechanical</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="college" className="text-sm">College (Optional)</Label>
              <Input
                id="college"
                type="text"
                placeholder="Search college"
                value={collegeSearch}
                onChange={(e) => setCollegeSearch(e.target.value)}
                disabled={loading}
                className="h-9"
              />
              {colleges.length > 0 && (
                <div className="border rounded-md max-h-32 overflow-y-auto text-sm">
                  {colleges.map((college) => (
                    <button
                      key={college.id}
                      type="button"
                      className="w-full text-left px-2 py-1.5 hover:bg-muted transition-colors"
                      onClick={() => {
                        setCollegeId(college.id);
                        setCollegeSearch(college.name);
                        setColleges([]);
                      }}
                    >
                      <div className="font-medium text-xs">{college.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-gray-900 hover:bg-gray-800 text-white font-medium transition-colors"
              disabled={loading}
              onClick={handleSubmit}
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-gray-500">or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              onClick={() => window.location.href = 'http://localhost:5000/api/auth/linkedin'}
              disabled={loading}
            >
              <Linkedin className="mr-2 h-4 w-4 text-[#0077B5]" />
              <span className="text-gray-700 font-medium">LinkedIn</span>
            </Button>

            <div className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-gray-900 hover:text-gray-700 font-medium">
                Sign in
              </Link>
            </div>

            <div className="text-center text-xs text-gray-500 mt-4">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-gray-900 hover:text-gray-700 underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-gray-900 hover:text-gray-700 underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}