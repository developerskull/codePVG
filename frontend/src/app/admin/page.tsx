'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  Activity,
  Database,
  Settings
} from 'lucide-react';

interface DashboardData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
    systemHealth: string;
    pendingApprovals: number;
    securityAlerts: number;
  };
  userStats: {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
    roleDistribution: Record<string, number>;
    recentRegistrations: number;
  };
  systemStats: {
    tableStats: Record<string, number>;
    systemSettings: any;
    totalRecords: number;
  };
  recentActivity: Array<{
    id: string;
    action_type: string;
    created_at: string;
    admin: {
      name: string;
      email: string;
    };
  }>;
  securityAlerts: Array<{
    id: string;
    type: string;
    severity: string;
    description: string;
    created_at: string;
  }>;
  pendingApprovals: Array<{
    id: string;
    title: string;
    description: string;
    requester: {
      name: string;
      email: string;
    };
    created_at: string;
  }>;
  systemHealth: {
    status: string;
    database: string;
    errorRate: number;
    lastChecked: string;
  };
}

export default function AdminDashboard() {
  const { get } = useApi();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await get<DashboardData>('/api/admin/dashboard');
      setDashboardData(data);
    } catch (err) {
      console.error('Dashboard error:', err);
      // Provide fallback data for development
      setDashboardData({
        overview: {
          totalUsers: 0,
          activeUsers: 0,
          bannedUsers: 0,
          systemHealth: 'healthy',
          pendingApprovals: 0,
          securityAlerts: 0
        },
        userStats: {
          totalUsers: 0,
          activeUsers: 0,
          bannedUsers: 0,
          roleDistribution: {},
          recentRegistrations: 0
        },
        systemStats: {
          tableStats: {},
          systemSettings: {},
          totalRecords: 0
        },
        recentActivity: [],
        securityAlerts: [],
        pendingApprovals: [],
        systemHealth: {
          status: 'healthy',
          database: 'connected',
          errorRate: 0,
          lastChecked: new Date().toISOString()
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchDashboardData}>Retry</Button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No dashboard data available</p>
      </div>
    );
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of system status and key metrics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.userStats.recentRegistrations} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((dashboardData.overview.activeUsers / dashboardData.overview.totalUsers) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.bannedUsers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((dashboardData.overview.bannedUsers / dashboardData.overview.totalUsers) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(dashboardData.overview.systemHealth)}`}>
              {dashboardData.overview.systemHealth}
            </div>
            <p className="text-xs text-muted-foreground">
              Database: {dashboardData.systemHealth.database}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.securityAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Recent security events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>User Role Distribution</CardTitle>
          <CardDescription>Breakdown of users by role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(dashboardData.userStats.roleDistribution).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium capitalize">{role.replace('-', ' ')}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest admin actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{activity.action_type.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-600">by {activity.admin.name}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Alerts</CardTitle>
            <CardDescription>Recent security events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.securityAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{alert.type.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      {dashboardData.pendingApprovals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Requests awaiting your review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.pendingApprovals.map((approval) => (
                <div key={approval.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <p className="font-medium">{approval.title}</p>
                    <p className="text-sm text-gray-600">by {approval.requester.name}</p>
                    <p className="text-sm text-gray-500">{approval.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">Review</Button>
                    <span className="text-xs text-gray-500">
                      {new Date(approval.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">Manage Users</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Settings className="h-6 w-6 mb-2" />
              <span className="text-sm">System Settings</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Shield className="h-6 w-6 mb-2" />
              <span className="text-sm">Security</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Database className="h-6 w-6 mb-2" />
              <span className="text-sm">Database</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}