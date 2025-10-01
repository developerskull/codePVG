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
import { Code, Github, Linkedin, FileText, Globe, Eye, EyeOff, Save, User } from 'lucide-react';
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

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

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
          <Link href="/auth/login" className="text-primary hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="inline-flex items-center space-x-2">
              <Code className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">CollegeCodeHub</span>
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-xl font-semibold">Profile</span>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{profile?.name || user.name}</h3>
                <p className="text-sm text-gray-600">{profile?.username || user.username || user.email}</p>
                <p className="text-xs text-gray-500 mt-1">{user.role}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Member since:</span>
                  <span>{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.approval_status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : user.approval_status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.approval_status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile">Profile Details</TabsTrigger>
                  <TabsTrigger value="privacy">Privacy Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="Choose a unique username"
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Social Links</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="github_link" className="flex items-center space-x-2">
                          <Github className="h-4 w-4" />
                          <span>GitHub Profile</span>
                        </Label>
                        <Input
                          id="github_link"
                          value={formData.github_link}
                          onChange={(e) => handleInputChange('github_link', e.target.value)}
                          placeholder="https://github.com/username"
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedin_url" className="flex items-center space-x-2">
                          <Linkedin className="h-4 w-4" />
                          <span>LinkedIn Profile</span>
                        </Label>
                        <Input
                          id="linkedin_url"
                          value={formData.linkedin_url}
                          onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      disabled={!isEditing}
                      className="resize-none"
                    />
                    <p className="text-xs text-gray-500">{formData.bio.length}/500 characters</p>
                  </div>

                  {/* Links */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Professional Links</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="resume_link" className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Resume</span>
                        </Label>
                        <Input
                          id="resume_link"
                          value={formData.resume_link}
                          onChange={(e) => handleInputChange('resume_link', e.target.value)}
                          placeholder="https://example.com/resume.pdf"
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="portfolio_link" className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span>Portfolio</span>
                        </Label>
                        <Input
                          id="portfolio_link"
                          value={formData.portfolio_link}
                          onChange={(e) => handleInputChange('portfolio_link', e.target.value)}
                          placeholder="https://yourportfolio.com"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex space-x-3 pt-4">
                      <Button onClick={handleSave} disabled={saveLoading} className="flex-1">
                        {saveLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button onClick={handleCancel} variant="outline" className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="privacy" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Control what information is visible to other users on your public profile.
                    </p>

                    <div className="space-y-4">
                      {Object.entries(privacySettings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {key === 'show_email' && <span className="text-sm font-medium">Email Address</span>}
                            {key === 'show_github' && <span className="text-sm font-medium">GitHub Profile</span>}
                            {key === 'show_linkedin' && <span className="text-sm font-medium">LinkedIn Profile</span>}
                            {key === 'show_bio' && <span className="text-sm font-medium">Bio</span>}
                            {key === 'show_resume' && <span className="text-sm font-medium">Resume</span>}
                            {key === 'show_portfolio' && <span className="text-sm font-medium">Portfolio</span>}
                          </div>
                          <div className="flex items-center space-x-2">
                            {value ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                            <Switch
                              checked={value}
                              onCheckedChange={(checked) => handlePrivacyChange(key as keyof PrivacySettings, checked)}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {isEditing && (
                      <div className="flex space-x-3 mt-6">
                        <Button onClick={handleSave} disabled={saveLoading} className="flex-1">
                          {saveLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Privacy Settings
                            </>
                          )}
                        </Button>
                        <Button onClick={handleCancel} variant="outline" className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

