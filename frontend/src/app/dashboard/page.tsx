'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Progress } from '@/components/ui/progress';
import { Stats, UserRank, ProblemsResponse } from '@/types';
import { 
  Trophy, 
  Code, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { get } = useApi();
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [recentProblems, setRecentProblems] = useState<ProblemsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, rankResponse, problemsResponse] = await Promise.all([
        get<Stats>('/api/leaderboard/stats'),
        get<{ user_rank: UserRank }>('/api/leaderboard/my-rank'),
        get<ProblemsResponse>('/api/problems?limit=5')
      ]);

      setStats(statsResponse);
      setUserRank(rankResponse.user_rank);
      setRecentProblems(problemsResponse);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h1>
          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'wrong_answer':
      case 'runtime_error':
      case 'compilation_error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
              <p className="text-muted-foreground">
                Continue your coding journey and track your progress
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            {user.role}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.current_rank.total_solved || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total accepted submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.current_rank.rank ? `#${stats.current_rank.rank}` : 'Unranked'}
              </div>
              <p className="text-xs text-muted-foreground">
                Global leaderboard position
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.submission_stats.total_submissions 
                  ? Math.round((stats.submission_stats.accepted_submissions / stats.submission_stats.total_submissions) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Accepted submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Code className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.submission_stats.total_submissions || 0}</div>
              <p className="text-xs text-muted-foreground">
                All time submissions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress by Difficulty */}
        {stats?.difficulty_stats && stats.difficulty_stats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Progress by Difficulty</CardTitle>
              <CardDescription>
                Problems solved across different difficulty levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.difficulty_stats.map((difficulty, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{difficulty.difficulty}</span>
                      <span className="text-sm text-muted-foreground">{difficulty.solved_count} solved</span>
                    </div>
                    <Progress 
                      value={(difficulty.solved_count / Math.max(...stats.difficulty_stats.map(d => d.solved_count))) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        {stats?.recent_activity && stats.recent_activity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your coding activity over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recent_activity.slice(0, 7).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(activity.submission_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{activity.submissions_count} submissions</span>
                      <span className="text-green-600">{activity.accepted_count} accepted</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Problems */}
        {recentProblems && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Problems</CardTitle>
              <CardDescription>
                Latest problems added to the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProblems.problems.map((problem) => (
                  <div key={problem.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{problem.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={getDifficultyColor(problem.difficulty)}>
                          {problem.difficulty}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{problem.topic}</span>
                      </div>
                    </div>
                    <Link href={`/problems/${problem.id}`}>
                      <Button size="sm">Solve</Button>
                    </Link>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link href="/problems">
                  <Button variant="outline">View All Problems</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Jump into coding or explore the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/problems">
                <Button className="w-full h-20 flex flex-col space-y-2">
                  <Code className="h-6 w-6" />
                  <span>Browse Problems</span>
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Trophy className="h-6 w-6" />
                  <span>View Leaderboard</span>
                </Button>
              </Link>
              <Link href="/problems?difficulty=easy">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Target className="h-6 w-6" />
                  <span>Easy Problems</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
