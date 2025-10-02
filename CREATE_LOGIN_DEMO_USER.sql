-- CREATE DEMO USER FOR LOGIN TESTING
-- Run this in Supabase SQL Editor

-- First, check if the auth user exists
SELECT id, email, created_at
FROM auth.users
WHERE email = 'sagar17datkhile@gmail.com';

-- If no user found, create one via Supabase Dashboard:
-- Go to Authentication → Users → "Add user" → "Create new user"
-- Email: sagar17datkhile@gmail.com
-- Password: Sagar@123
-- ✅ Check "Auto Confirm User"

-- After creating auth user, get the UUID and run:
-- (Replace 'PASTE_UUID_HERE' with the actual UUID from the users list)

INSERT INTO public.users (
  auth_user_id,
  email,
  name,
  username,
  role,
  approval_status,
  verified
) VALUES (
  'PASTE_UUID_HERE',  -- Get this from Authentication → Users list
  'sagar17datkhile@gmail.com',
  'Sagar Datkhile',
  'sagardatkhile',
  'student',
  'approved',
  true
);

-- Verify the profile was created
SELECT id, auth_user_id, email, name, role, approval_status
FROM public.users
WHERE email = 'sagar17datkhile@gmail.com';

