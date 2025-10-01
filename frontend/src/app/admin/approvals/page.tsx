'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, User, Mail, Hash, Calendar, Building } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  prn?: string;
  batch?: string;
  department?: string;
  year_of_study?: number;
  linkedin_id?: string;
  college_name?: string;
  created_at: string;
}

export default function ApprovalsPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
      router.push('/');
      return;
    }

    fetchPendingApprovals();
  }, [user, router]);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/auth/approvals/pending', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPendingUsers(response.data.requests);
    } catch (err) {
      setError('Failed to fetch pending approvals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      setProcessingId(userId);
      await axios.put(
        `http://localhost:5000/api/auth/approvals/${userId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Remove from list
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Failed to update approval status:', err);
      alert('Failed to update approval status');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pending Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve student registration requests
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {pendingUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No pending approval requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingUsers.map((pendingUser) => (
            <Card key={pendingUser.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {pendingUser.name}
                      {pendingUser.linkedin_id && (
                        <Badge variant="secondary" className="ml-2">
                          LinkedIn
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Mail className="h-4 w-4" />
                      {pendingUser.email}
                    </CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(pendingUser.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {pendingUser.username && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Username:</span> @{pendingUser.username}
                      </span>
                    </div>
                  )}
                  
                  {pendingUser.prn && (
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">PRN:</span> {pendingUser.prn}
                      </span>
                    </div>
                  )}
                  
                  {pendingUser.college_name && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">College:</span> {pendingUser.college_name}
                      </span>
                    </div>
                  )}
                  
                  {pendingUser.department && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Department:</span> {pendingUser.department}
                      </span>
                    </div>
                  )}
                  
                  {pendingUser.batch && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Batch:</span> {pendingUser.batch}
                      </span>
                    </div>
                  )}
                  
                  {pendingUser.year_of_study && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Year:</span> {pendingUser.year_of_study}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApproval(pendingUser.id, 'approved')}
                    disabled={processingId === pendingUser.id}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleApproval(pendingUser.id, 'rejected')}
                    disabled={processingId === pendingUser.id}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
