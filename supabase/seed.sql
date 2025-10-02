-- Seed data for College Code Hub Demo Users
-- Run this in Supabase SQL Editor AFTER running schema.sql
-- Note: You'll need to create auth users through Supabase Auth UI or API first

-- Important: This seed script assumes you've already created the auth users in Supabase Auth
-- The auth_user_id values below are placeholders - you'll need to replace them with actual UUIDs
-- from your Supabase Auth users after creating them

-- Demo College
INSERT INTO public.colleges (id, name, domain, city, state)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Demo University', 'demo.edu', 'Demo City', 'Demo State')
ON CONFLICT (name) DO NOTHING;

-- Instructions for creating demo users:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. Create these users manually with email verification disabled:
--    - student@example.com (password: password123)
--    - admin@example.com (password: password123)
--    - superadmin@example.com (password: password123)
--    - pending@example.com (password: password123)
-- 4. Copy their UUID from the auth.users table
-- 5. Replace the auth_user_id placeholders below with the actual UUIDs
-- 6. Run this script

-- After creating auth users, uncomment and run this:
/*
-- Demo Student (approved, verified)
INSERT INTO public.users (
  id,
  auth_user_id,
  name,
  email,
  username,
  role,
  prn,
  batch,
  department,
  college_id,
  year_of_study,
  bio,
  verified,
  approval_status,
  created_at,
  updated_at
)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'REPLACE_WITH_STUDENT_AUTH_USER_ID', -- Replace this with actual auth user UUID
  'Test Student',
  'student@example.com',
  'student',
  'student',
  'STU001',
  '2023',
  'Computer Science',
  '11111111-1111-1111-1111-111111111111',
  3,
  'Demo student account for testing',
  true,
  'approved',
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  approval_status = EXCLUDED.approval_status,
  verified = EXCLUDED.verified;

-- Demo Admin (approved, verified)
INSERT INTO public.users (
  id,
  auth_user_id,
  name,
  email,
  username,
  role,
  verified,
  approval_status,
  created_at,
  updated_at
)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'REPLACE_WITH_ADMIN_AUTH_USER_ID', -- Replace this with actual auth user UUID
  'Test Admin',
  'admin@example.com',
  'admin',
  'admin',
  true,
  'approved',
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  approval_status = EXCLUDED.approval_status,
  verified = EXCLUDED.verified;

-- Demo Super Admin (approved, verified)
INSERT INTO public.users (
  id,
  auth_user_id,
  name,
  email,
  username,
  role,
  verified,
  approval_status,
  created_at,
  updated_at
)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'REPLACE_WITH_SUPERADMIN_AUTH_USER_ID', -- Replace this with actual auth user UUID
  'Test Super Admin',
  'superadmin@example.com',
  'superadmin',
  'super-admin',
  true,
  'approved',
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  approval_status = EXCLUDED.approval_status,
  verified = EXCLUDED.verified;

-- Demo Pending Student (pending approval, verified email)
INSERT INTO public.users (
  id,
  auth_user_id,
  name,
  email,
  username,
  role,
  prn,
  batch,
  department,
  college_id,
  year_of_study,
  bio,
  verified,
  approval_status,
  created_at,
  updated_at
)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'REPLACE_WITH_PENDING_AUTH_USER_ID', -- Replace this with actual auth user UUID
  'Pending Student',
  'pending@example.com',
  'pending',
  'student',
  'STU002',
  '2024',
  'Computer Science',
  '11111111-1111-1111-1111-111111111111',
  2,
  'Demo account with pending approval status',
  true,
  'pending',
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  approval_status = EXCLUDED.approval_status,
  verified = EXCLUDED.verified;
*/

