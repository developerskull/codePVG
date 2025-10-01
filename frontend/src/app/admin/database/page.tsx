'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  HardDrive, 
  Activity, 
  Shield, 
  Download,
  Upload,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

interface DatabaseStats {
  totalSize: string;
  tableCount: number;
  recordCount: number;
  lastBackup: string;
  healthScore: number;
  connectionStatus: string;
}

interface TableInfo {
  name: string;
  rows: number;
  size: string;
  lastModified: string;
  status: string;
}

export default function DatabaseManagementPage() {
  const { get, post } = useApi();
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDatabaseData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, tablesData] = await Promise.all([
        get<DatabaseStats>('/api/admin/database-stats'),
        get<TableInfo[]>('/api/admin/database-tables')
      ]);
      setStats(statsData);
      setTables(tablesData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch database data');
      console.error('Error fetching database data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      case 'connecting': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBackup = async () => {
    setActionLoading('backup');
    try {
      await post('/api/admin/database/backup');
      await fetchDatabaseData(); // Refresh the data
      alert('Database backup completed successfully!');
    } catch (err: any) {
      console.error('Backup failed:', err);
      setError(err.message || 'Backup failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOptimize = async () => {
    setActionLoading('optimize');
    try {
      await post('/api/admin/database/optimize');
      await fetchDatabaseData(); // Refresh the data
      alert('Database optimization completed!');
    } catch (err: any) {
      console.error('Optimization failed:', err);
      setError(err.message || 'Optimization failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCleanup = async () => {
    setActionLoading('cleanup');
    try {
      await post('/api/admin/cleanup-data');
      await fetchDatabaseData(); // Refresh the data
      alert('Old data cleanup completed!');
    } catch (err: any) {
      console.error('Cleanup failed:', err);
      setError(err.message || 'Cleanup failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading database information...</p>
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
            <h2 className="text-xl font-semibold">Error Loading Database Data</h2>
            <p className="text-gray-600 mt-2">{error}</p>
          </div>
          <Button onClick={fetchDatabaseData} variant="outline">
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
        <h1 className="text-3xl font-bold text-gray-900">Database Management</h1>
        <p className="text-gray-600 mt-2">Monitor and manage database health and performance</p>
      </div>

      {/* Database Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalSize}</p>
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Normal
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <HardDrive className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tables</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.tableCount}</p>
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  All healthy
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Records</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.recordCount?.toLocaleString()}</p>
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Growing
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Health Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.healthScore}%</p>
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Excellent
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <h3 className="font-medium text-gray-900">Database Connection</h3>
                <p className="text-sm text-gray-600">PostgreSQL - Supabase</p>
              </div>
            </div>
            <Badge className={getConnectionStatusColor(stats?.connectionStatus || 'connected')}>
              {stats?.connectionStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Database Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Database Operations</CardTitle>
          <CardDescription>Perform maintenance and backup operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleBackup}
              disabled={actionLoading === 'backup'}
              className="h-20 flex flex-col items-center justify-center"
            >
              <Download className="h-6 w-6 mb-2" />
              <span>Create Backup</span>
              {actionLoading === 'backup' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mt-1"></div>
              )}
            </Button>
            
            <Button
              onClick={handleOptimize}
              disabled={actionLoading === 'optimize'}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <RefreshCw className="h-6 w-6 mb-2" />
              <span>Optimize Database</span>
              {actionLoading === 'optimize' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mt-1"></div>
              )}
            </Button>
            
            <Button
              onClick={handleCleanup}
              disabled={actionLoading === 'cleanup'}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <Trash2 className="h-6 w-6 mb-2" />
              <span>Clean Old Data</span>
              {actionLoading === 'cleanup' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mt-1"></div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table Information */}
      <Card>
        <CardHeader>
          <CardTitle>Database Tables</CardTitle>
          <CardDescription>Detailed information about database tables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Table Name</th>
                  <th className="text-left py-3 px-4">Rows</th>
                  <th className="text-left py-3 px-4">Size</th>
                  <th className="text-left py-3 px-4">Last Modified</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tables.map((table) => (
                  <tr key={table.name} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Database className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-mono text-sm">{table.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">{table.rows.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">{table.size}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(table.lastModified).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(table.status)}>
                        {table.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Backup Information */}
      <Card>
        <CardHeader>
          <CardTitle>Backup Information</CardTitle>
          <CardDescription>Recent backups and restore options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Latest Backup</p>
                  <p className="text-sm text-gray-600">
                    {new Date(stats?.lastBackup || '').toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button size="sm" variant="outline">
                  <Upload className="h-4 w-4 mr-1" />
                  Restore
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Backup Frequency</h4>
                <p className="text-sm text-gray-600">Daily at 2:00 AM</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Retention Period</h4>
                <p className="text-sm text-gray-600">30 days</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Storage Location</h4>
                <p className="text-sm text-gray-600">Supabase Cloud</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}