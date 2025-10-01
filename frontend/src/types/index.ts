export interface PrivacySettings {
  show_email: boolean;
  show_github: boolean;
  show_linkedin: boolean;
  show_bio: boolean;
  show_resume: boolean;
  show_portfolio: boolean;
}

export interface User {
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
  role: 'student' | 'admin' | 'super-admin';
  approval_status?: string;
  verified?: boolean;
  created_at: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  test_cases: TestCase[];
  examples: Example[];
  constraints: string[];
  created_by: string;
  created_by_name: string;
  created_at: string;
  submission_count?: number;
  accepted_count?: number;
}

export interface TestCase {
  input: string;
  expected_output: string;
  is_hidden: boolean;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Submission {
  id: string;
  user_id: string;
  problem_id: string;
  code: string;
  language: 'python' | 'java' | 'cpp' | 'c';
  status: 'pending' | 'processing' | 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'runtime_error' | 'compilation_error';
  runtime?: number;
  memory?: number;
  created_at: string;
  problem_title?: string;
}

export interface LeaderboardEntry {
  user_id: string;
  total_solved: number;
  rank: number;
  last_submission_at: string;
  name: string;
  email: string;
  joined_at: string;
}

export interface UserRank {
  user_id: string;
  total_solved: number;
  rank: number;
  last_submission_at: string;
  name: string;
  email: string;
}

export interface Stats {
  submission_stats: {
    total_submissions: number;
    accepted_submissions: number;
    wrong_answers: number;
    time_limit_exceeded: number;
    runtime_errors: number;
    compilation_errors: number;
  };
  difficulty_stats: Array<{
    difficulty: string;
    solved_count: number;
  }>;
  recent_activity: Array<{
    submission_date: string;
    submissions_count: number;
    accepted_count: number;
  }>;
  current_rank: {
    rank: number | null;
    total_solved: number;
  };
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProblemsResponse {
  problems: Problem[];
  pagination: PaginationInfo;
}

export interface SubmissionsResponse {
  submissions: Submission[];
  pagination: PaginationInfo;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  pagination: PaginationInfo;
  time_filter: string;
}
