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
    password_hash: string;
    role: 'student' | 'admin' | 'super-admin';
    github_link?: string;
    linkedin_url?: string;
    bio?: string;
    resume_link?: string;
    portfolio_link?: string;
    privacy_settings?: PrivacySettings;
    prn?: string;
    batch?: string;
    department?: string;
    college_id?: string;
    year_of_study?: number;
    avatar_url?: string;
    verified: boolean;
    linkedin_id?: string;
    approval_status: string;
    created_at: Date;
    updated_at?: Date;
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
    created_at: Date;
    updated_at?: Date;
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
    status: 'pending' | 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'runtime_error' | 'compilation_error';
    runtime?: number;
    memory?: number;
    created_at: Date;
}
export interface LeaderboardEntry {
    user_id: string;
    total_solved: number;
    rank: number;
    last_submission_at: Date;
}
export interface Badge {
    id: string;
    name: string;
    description: string;
    criteria: string;
    icon?: string;
}
export interface UserBadge {
    user_id: string;
    badge_id: string;
    earned_at: Date;
}
export interface AuthRequest extends Request {
    user?: User;
}
export interface Judge0Submission {
    source_code: string;
    language_id: number;
    stdin?: string;
    expected_output?: string;
}
export interface Judge0Result {
    token?: string;
    stdout?: string;
    stderr?: string;
    compile_output?: string;
    message?: string;
    time?: string;
    memory?: number;
    status?: {
        id: number;
        description: string;
    };
}
//# sourceMappingURL=index.d.ts.map