-- Supabase Postgres Schema for College Code Hub
-- Run this in Supabase SQL Editor (project database)

-- 0) Extensions
create extension if not exists pgcrypto; -- for gen_random_uuid()

-- 1) Enums
do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('student', 'admin', 'super-admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'difficulty_level') then
    create type difficulty_level as enum ('easy', 'medium', 'hard');
  end if;
  if not exists (select 1 from pg_type where typname = 'submission_language') then
    create type submission_language as enum ('python', 'java', 'cpp', 'c');
  end if;
  if not exists (select 1 from pg_type where typname = 'submission_status') then
    create type submission_status as enum (
      'pending', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'approval_status') then
    create type approval_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

-- 2) Utility: touch updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 3) Colleges
create table if not exists public.colleges (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) unique not null,
  domain varchar(255),
  city varchar(100),
  state varchar(100),
  created_at timestamp with time zone default now()
);

create index if not exists idx_colleges_name on public.colleges (name);

-- 4) Users
-- Note: if you plan to use Supabase Auth users, keep this as a profile table and store auth user_id uuid
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique, -- optional link to Supabase Auth user
  name varchar(255) not null,
  email varchar(255) unique not null,
  password_hash varchar(255),
  username varchar(50) unique,
  role user_role not null default 'student',
  prn varchar(50) unique,
  batch varchar(20),
  department varchar(100),
  college_id uuid references public.colleges(id) on delete set null,
  year_of_study integer,
  bio text,
  avatar_url text,
  github_link text,
  linkedin_url text,
  resume_link text,
  portfolio_link text,
  privacy_settings jsonb default '{"show_email": false, "show_github": true, "show_linkedin": true, "show_bio": true, "show_resume": false, "show_portfolio": true}'::jsonb,
  verified boolean default false,
  linkedin_id varchar(255) unique,
  approval_status approval_status not null default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_users_email on public.users (email);
create index if not exists idx_users_username on public.users (username);
create index if not exists idx_users_college on public.users (college_id);
create index if not exists idx_users_auth_user_id on public.users (auth_user_id);
create trigger trg_users_set_updated
  before update on public.users
  for each row execute function set_updated_at();

-- 5) Problems
create table if not exists public.problems (
  id uuid primary key default gen_random_uuid(),
  title varchar(255) not null,
  description text not null,
  difficulty difficulty_level not null,
  topic varchar(100) not null,
  test_cases jsonb not null,
  examples jsonb not null,
  constraints text[] not null,
  created_by uuid not null references public.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_problems_difficulty on public.problems (difficulty);
create index if not exists idx_problems_topic on public.problems (topic);
create index if not exists idx_problems_created_by on public.problems (created_by);
create trigger trg_problems_set_updated
  before update on public.problems
  for each row execute function set_updated_at();

-- 6) Submissions
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  problem_id uuid not null references public.problems(id) on delete cascade,
  code text not null,
  language submission_language not null,
  status submission_status not null,
  runtime integer,
  memory integer,
  created_at timestamp with time zone default now()
);

create index if not exists idx_submissions_user on public.submissions (user_id);
create index if not exists idx_submissions_problem on public.submissions (problem_id);
create index if not exists idx_submissions_user_problem on public.submissions (user_id, problem_id);
create index if not exists idx_submissions_status on public.submissions (status);
create index if not exists idx_submissions_created_at on public.submissions (created_at desc);

-- Only count first accepted per (user, problem) in rankings/business logic
create unique index if not exists uq_submissions_first_accept
  on public.submissions (user_id, problem_id)
  where status = 'accepted';

-- 7) Leaderboard (maintained by app logic)
create table if not exists public.leaderboard (
  user_id uuid primary key references public.users(id) on delete cascade,
  total_solved integer default 0,
  rank integer default 0,
  last_submission_at timestamp with time zone default now()
);

create index if not exists idx_leaderboard_rank on public.leaderboard (rank asc);
create index if not exists idx_leaderboard_total_solved on public.leaderboard (total_solved desc);

-- 8) Badges
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  description text not null,
  criteria text not null,
  icon varchar(50),
  created_at timestamp with time zone default now()
);

create unique index if not exists uq_badges_name on public.badges (name);

-- 9) User Badges
create table if not exists public.user_badges (
  user_id uuid not null references public.users(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_at timestamp with time zone default now(),
  primary key (user_id, badge_id)
);

create index if not exists idx_user_badges_user on public.user_badges (user_id);
create index if not exists idx_user_badges_badge on public.user_badges (badge_id);

-- 10) Admin approvals audit (optional, supports approvals page)
create table if not exists public.approval_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  decided_by uuid not null references public.users(id) on delete set null,
  decision approval_status not null,
  reason text,
  created_at timestamp with time zone default now()
);

create index if not exists idx_approval_events_user on public.approval_events (user_id);
create index if not exists idx_approval_events_decided_by on public.approval_events (decided_by);

-- 11) Suggested Storage Buckets (create in Supabase UI)
-- avatars (public or authenticated)
-- submissions-attachments (private if ever used)


