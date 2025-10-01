'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { CodeEditor } from '@/components/coding/CodeEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Problem, Submission } from '@/types';
import { ArrowLeft, Code, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProblemPage() {
  const params = useParams();
  const { user } = useAuth();
  const { get } = useApi();
  
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'java' | 'cpp' | 'c'>('python');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState('problem');

  useEffect(() => {
    if (params.id) {
      fetchProblem();
      if (user) {
        fetchSubmissions();
      }
    }
  }, [params.id, user]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const response = await get<{ problem: Problem }>(`/api/problems/${params.id}`);
      setProblem(response.problem);
    } catch (error) {
      console.error('Error fetching problem:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await get<{ submissions: Submission[] }>(`/api/submissions?problem_id=${params.id}`);
      setSubmissions(response.submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleSubmissionResult = (result: Submission) => {
    setSubmissions(prev => [result, ...prev]);
  };

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
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Problem not found</h1>
          <Link href="/problems">
            <Button>Back to Problems</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold">{problem.title}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className={getDifficultyColor(problem.difficulty)}>
                  {problem.difficulty}
                </Badge>
                <span className="text-muted-foreground">{problem.topic}</span>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{problem.submission_count || 0} submissions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Problem Description */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="problem">Problem</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="problem" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap">{problem.description}</p>
                    </div>
                  </CardContent>
                </Card>

                {problem.constraints && problem.constraints.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Constraints</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-1">
                        {problem.constraints.map((constraint, index) => (
                          <li key={index} className="text-sm">{constraint}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="examples" className="space-y-4">
                {problem.examples.map((example, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>Example {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Input:</h4>
                        <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                          {example.input}
                        </pre>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Output:</h4>
                        <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                          {example.output}
                        </pre>
                      </div>
                      {example.explanation && (
                        <div>
                          <h4 className="font-medium mb-2">Explanation:</h4>
                          <p className="text-sm text-muted-foreground">{example.explanation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="submissions" className="space-y-4">
                {!user ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">
                        Please log in to view your submissions
                      </p>
                    </CardContent>
                  </Card>
                ) : submissions.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">
                        No submissions yet. Start coding to see your submissions here!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <Card key={submission.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(submission.status)}
                              <div>
                                <div className="font-medium">
                                  {submission.status.replace('_', ' ').toUpperCase()}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {submission.language} • {new Date(submission.created_at).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              {submission.runtime && (
                                <div>Runtime: {submission.runtime}ms</div>
                              )}
                              {submission.memory && (
                                <div>Memory: {submission.memory}KB</div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Code Editor */}
          <div className="space-y-4">
            {!user ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <h3 className="text-lg font-semibold mb-2">Login Required</h3>
                  <p className="text-muted-foreground mb-4">
                    Please log in to start coding and submit solutions
                  </p>
                  <Link href="/auth/login">
                    <Button>Login</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <CodeEditor
                problemId={problem.id}
                language={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
                onSubmissionResult={handleSubmissionResult}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
