'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Mail, 
  Send,
  CheckCircle,
  AlertCircle,
  Users,
  Shield
} from 'lucide-react';

interface AdminInvitation {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired';
  invited_by: string;
  created_at: string;
  expires_at: string;
}

export default function CreateAdminPage() {
  const { post, get } = useApi();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('admin');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
  const [showInvitations, setShowInvitations] = useState(false);

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await post('/api/admin/invite', {
        email,
        role,
        message: message || `You have been invited to become an ${role} on CollegeCodeHub.`
      });

      setSuccess(`Invitation sent successfully to ${email}`);
      setEmail('');
      setMessage('');
      await fetchInvitations();
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const data = await get<AdminInvitation[]>('/api/admin/invitations');
      setInvitations(data);
    } catch (err) {
      console.error('Failed to fetch invitations:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super-admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Admin</h1>
        <p className="text-gray-600 mt-2">Invite new administrators to the platform</p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Invitation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Send Admin Invitation
          </CardTitle>
          <CardDescription>
            Invite a new administrator by sending them an email invitation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendInvitation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Admin Role</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Custom Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message to the invitation..."
                rows={3}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Invitation...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Invitation Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Admin Invitations
              </CardTitle>
              <CardDescription>
                Manage pending and sent invitations
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setShowInvitations(!showInvitations);
                if (!showInvitations) {
                  fetchInvitations();
                }
              }}
            >
              {showInvitations ? 'Hide' : 'Show'} Invitations
            </Button>
          </div>
        </CardHeader>
        {showInvitations && (
          <CardContent>
            <div className="space-y-3">
              {invitations.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No invitations sent yet</p>
              ) : (
                invitations.map((invitation) => (
                  <div key={invitation.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{invitation.email}</span>
                          <Badge className={getRoleColor(invitation.role)}>
                            {invitation.role.replace('-', ' ')}
                          </Badge>
                          <Badge className={getStatusColor(invitation.status)}>
                            {invitation.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Invited on {new Date(invitation.created_at).toLocaleDateString()}
                          {invitation.status === 'pending' && (
                            <span className="ml-2">
                              • Expires on {new Date(invitation.expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Admin Creation Process Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Admin Creation Process
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">Send Invitation</h4>
                <p className="text-sm text-gray-600">
                  Enter the email address and send an invitation to the potential admin.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">Email Notification</h4>
                <p className="text-sm text-gray-600">
                  The invited person receives an email with a secure link to create their admin profile.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">Profile Creation</h4>
                <p className="text-sm text-gray-600">
                  The admin fills out their basic information (name, department) and creates their account.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div>
                <h4 className="font-medium">Admin Access</h4>
                <p className="text-sm text-gray-600">
                  Once approved, the new admin gains access to the admin console with their assigned role.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
