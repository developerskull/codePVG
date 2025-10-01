'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Code, Github, Linkedin, FileText, Globe, Eye, EyeOff, Save, User, Edit3, Settings, Calendar, Shield, Mail } from 'lucide-react';
import Link from 'next/link';

interface PrivacySettings {
  show_email: boolean;
  show_github: boolean;
  show_linkedin: boolean;
  show_bio: boolean;
  show_resume: boolean;
  show_portfolio: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  github_link?: string;
  linkedin_url?: string;
  bio?: string;
  resume_link?: string;
  portfolio_link?: string;
  privacy_settings?: PrivacySettings;
  role: string;
  created_at: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { get, put, clearError } = useApi();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    github_link: '',
    linkedin_url: '',
    bio: '',
    resume_link: '',
    portfolio_link: ''
  });
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    show_email: false,
    show_github: true,
    show_linkedin: true,
    show_bio: true,
    show_resume: false,
    show_portfolio: true
  });
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await get<UserProfile>('/api/auth/profile');
      setProfile(response);
      setFormData({
        username: response.username || '',
        github_link: response.github_link || '',
        linkedin_url: response.linkedin_url || '',
        bio: response.bio || '',
        resume_link: response.resume_link || '',
        portfolio_link: response.portfolio_link || ''
      });
      setPrivacySettings(response.privacy_settings || privacySettings);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  }, [get, privacySettings]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrivacyChange = (setting: keyof PrivacySettings, value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      clearError();

      const updateData = {
        ...formData,
        privacy_settings: privacySettings
      };

      await put('/api/auth/profile', updateData);
      await fetchProfile();
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        github_link: profile.github_link || '',
        linkedin_url: profile.linkedin_url || '',
        bio: profile.bio || '',
        resume_link: profile.resume_link || '',
        portfolio_link: profile.portfolio_link || ''
      });
      setPrivacySettings(profile.privacy_settings || privacySettings);
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold">Profile Page</h1>
        <p>Welcome, {user.name}!</p>
        
        {profile ? (
          <div className="mt-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Your Profile</h2>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave} 
                    disabled={saveLoading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saveLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    {isEditing ? (
                      <Input
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="Enter your username"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile.username || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    {isEditing ? (
                      <Textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={3}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile.bio || 'No bio provided'}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Social Links</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">GitHub</label>
                    {isEditing ? (
                      <Input
                        value={formData.github_link}
                        onChange={(e) => handleInputChange('github_link', e.target.value)}
                        placeholder="https://github.com/yourusername"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.github_link ? (
                          <a href={profile.github_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.github_link}
                          </a>
                        ) : 'Not provided'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                    {isEditing ? (
                      <Input
                        value={formData.linkedin_url}
                        onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                        placeholder="https://linkedin.com/in/yourusername"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.linkedin_url ? (
                          <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.linkedin_url}
                          </a>
                        ) : 'Not provided'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resume</label>
                    {isEditing ? (
                      <Input
                        value={formData.resume_link}
                        onChange={(e) => handleInputChange('resume_link', e.target.value)}
                        placeholder="https://your-resume-link.com"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.resume_link ? (
                          <a href={profile.resume_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.resume_link}
                          </a>
                        ) : 'Not provided'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Portfolio</label>
                    {isEditing ? (
                      <Input
                        value={formData.portfolio_link}
                        onChange={(e) => handleInputChange('portfolio_link', e.target.value)}
                        placeholder="https://your-portfolio.com"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.portfolio_link ? (
                          <a href={profile.portfolio_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.portfolio_link}
                          </a>
                        ) : 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Status</label>
                  <p className="mt-1 text-sm text-green-600 font-medium">Active</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
