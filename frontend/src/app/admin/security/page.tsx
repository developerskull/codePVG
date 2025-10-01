'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye, 
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Users,
  Globe
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: string;
  severity: string;
  description: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  status: string;
}

interface SecurityStats {
  totalThreats: number;
  blockedIPs: number;
  failedLogins: number;
  suspiciousActivity: number;
  activeSessions: number;
  securityScore: number;
}

export default function SecurityDashboardPage() {
  const { get, post } = useApi();
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, eventsData] = await Promise.all([
        get<SecurityStats>('/api/security/dashboard'),
        get<SecurityEvent[]>('/api/security/logs')
      ]);
      setStats(statsData);
      setEvents(eventsData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch security data');
      console.error('Error fetching security data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBlockIP = async (ip: string) => {
    try {
      await post('/api/security/block-ip', { ip_address: ip });
      await fetchSecurityData(); // Refresh the data
      alert(`IP ${ip} has been blocked`);
    } catch (err: any) {
      console.error('Failed to block IP:', err);
      setError(err.message || 'Failed to block IP');
    }
  };

  const handleResolveEvent = async (eventId: string) => {
    try {
      await post(`/api/security/events/${eventId}/resolve`);
      await fetchSecurityData(); // Refresh the data
    } catch (err: any) {
      console.error('Failed to resolve event:', err);
      setError(err.message || 'Failed to resolve event');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <XCircle className="h-12 w-12 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Error Loading Security Data</h2>
            <p className="text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={fetchSecurityData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and manage security threats and incidents</p>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Security Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.securityScore}%</p>
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Good
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Threats</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalThreats}</p>
                <div className="flex items-center text-sm text-red-600">
                  <XCircle className="h-4 w-4 mr-1" />
                  Requires attention
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Ban className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Blocked IPs</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.blockedIPs}</p>
                <div className="flex items-center text-sm text-orange-600">
                  <Lock className="h-4 w-4 mr-1" />
                  Recently blocked
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeSessions}</p>
                <div className="flex items-center text-sm text-green-600">
                  <Users className="h-4 w-4 mr-1" />
                  Normal activity
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Monitor and respond to security incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-2">
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-gray-900">{event.type}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {event.status === 'investigating' && (
                      <Button
                        size="sm"
                        onClick={() => handleResolveEvent(event.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleBlockIP(event.ip_address)}
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-gray-600 mb-3">{event.description}</p>

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      {event.ip_address}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 max-w-xs truncate">
                    {event.user_agent}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>IP Management</CardTitle>
            <CardDescription>Manage blocked and whitelisted IP addresses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input placeholder="Enter IP address" className="flex-1" />
                <Button variant="outline">Add to Whitelist</Button>
                <Button variant="destructive">Block IP</Button>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Blocked IPs</h4>
                <div className="space-y-1">
                  {['203.0.113.42', '198.51.100.25', '192.0.2.100'].map((ip, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <span className="text-sm font-mono">{ip}</span>
                      <Button size="sm" variant="outline">Unblock</Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Policies</CardTitle>
            <CardDescription>Configure security rules and thresholds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">Failed Login Threshold</h4>
                  <p className="text-sm text-gray-600">Block after 5 failed attempts</p>
                </div>
                <Button size="sm" variant="outline">Configure</Button>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">Session Timeout</h4>
                  <p className="text-sm text-gray-600">Auto-logout after 30 minutes</p>
                </div>
                <Button size="sm" variant="outline">Configure</Button>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">Required for admin accounts</p>
                </div>
                <Button size="sm" variant="outline">Configure</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}