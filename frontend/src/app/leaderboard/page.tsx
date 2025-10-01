'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { LeaderboardResponse, UserRank } from '@/types';
import { Trophy, Medal, Award, Crown, Calendar, Users } from 'lucide-react';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { get } = useApi();
  
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const leaderboardResponse = await get<{ leaderboard: any[] }>(`/api/leaderboard`);
      
      setLeaderboard(leaderboardResponse.leaderboard || []);
      setUserRank(null); // Mock API doesn't have user rank endpoint
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <Trophy className="h-5 w-5 text-muted-foreground" />;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800';
    if (rank === 2) return 'bg-gray-100 text-gray-800';
    if (rank === 3) return 'bg-amber-100 text-amber-800';
    if (rank <= 10) return 'bg-blue-100 text-blue-800';
    return 'bg-muted text-muted-foreground';
  };

  const timeFilters = [
    { value: 'all', label: 'All Time' },
    { value: 'monthly', label: 'This Month' },
    { value: 'weekly', label: 'This Week' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold">Leaderboard</h1>
              <p className="text-muted-foreground">
                See how you rank against other computer science students
              </p>
            </div>
          </div>
        </div>

        {/* Time Filter */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Time Period:</span>
          <div className="flex space-x-2">
            {timeFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={timeFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* User's Rank */}
        {user && userRank && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span>Your Rank</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-2xl font-bold">#{userRank.rank}</div>
                  <div className="text-sm text-muted-foreground">
                    {userRank.total_solved} problems solved
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    Last submission: {new Date(userRank.last_submission_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-8 w-8 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <Card 
                key={entry.rank} 
                className={`${
                  user && entry.name === user.name 
                    ? 'border-primary/50 bg-primary/5' 
                    : ''
                } hover:shadow-md transition-shadow`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="flex items-center space-x-2">
                      {getRankIcon(entry.rank)}
                      <span className="text-lg font-bold">#{entry.rank}</span>
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{entry.name}</h3>
                        {user && entry.name === user.name && (
                          <Badge variant="secondary" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.email}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right space-y-1">
                      <div className="text-lg font-bold">{entry.total_solved}</div>
                      <div className="text-sm text-muted-foreground">problems solved</div>
                    </div>

                    {/* Last Activity */}
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(entry.last_submission_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination - Simplified for mock data */}
            {leaderboard.length > 10 && (
              <div className="flex justify-center space-x-2">
                <Button variant="outline" disabled>
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Showing all {leaderboard.length} users
                </span>
                <Button variant="outline" disabled>
                  Next
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No leaderboard data</h3>
              <p className="text-muted-foreground">
                Start solving problems to appear on the leaderboard!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats Summary */}
        {leaderboard && (
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {leaderboard.pagination?.total || leaderboard.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {leaderboard.length > 0 
                      ? leaderboard[0].total_solved 
                      : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Highest Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {timeFilter === 'all' ? 'All Time' : 
                     timeFilter === 'monthly' ? 'This Month' : 'This Week'}
                  </div>
                  <div className="text-sm text-muted-foreground">Time Period</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}