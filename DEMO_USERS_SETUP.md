# Demo Users Setup Guide

This guide will help you create demo users for testing the College Code Hub application.

## Prerequisites

1. You must have a Supabase project set up
2. You must have run `supabase/schema.sql` in your Supabase SQL Editor
3. You must have configured your environment variables in `frontend/.env.local`

## Quick Setup Steps

### Option 1: Manual Setup (Recommended)

#### Step 1: Create Auth Users in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** → **"Create new user"**
4. Disable email confirmation (for demo purposes):
   - Email: `student@example.com`
   - Password: `password123`
   - Auto Confirm User: **YES** (check this box)
5. Repeat for these additional users:
   - Email: `admin@example.com`, Password: `password123`
   - Email: `superadmin@example.com`, Password: `password123`
   - Email: `pending@example.com`, Password: `password123`

#### Step 2: Create User Profiles in Database

1. After creating each auth user, copy their UUID from the Users list
2. Go to **SQL Editor** in Supabase
3. Run the following SQL, replacing the `auth_user_id` placeholders with actual UUIDs:

```sql
-- Demo College
INSERT INTO public.colleges (id, name, domain, city, state)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Demo University', 'demo.edu', 'Demo City', 'Demo State')
ON CONFLICT (name) DO NOTHING;

-- Student (replace AUTH_USER_UUID_1 with actual UUID)
INSERT INTO public.users (
  id, auth_user_id, name, email, username, role, 
  prn, batch, department, college_id, year_of_study, 
  verified, approval_status
)
VALUES (
  gen_random_uuid(),
  'AUTH_USER_UUID_1',
  'Test Student',
  'student@example.com',
  'student',
  'student',
  'STU001',
  '2023',
  'Computer Science',
  '11111111-1111-1111-1111-111111111111',
  3,
  true,
  'approved'
);

-- Admin (replace AUTH_USER_UUID_2 with actual UUID)
INSERT INTO public.users (
  id, auth_user_id, name, email, username, role, 
  verified, approval_status
)
VALUES (
  gen_random_uuid(),
  'AUTH_USER_UUID_2',
  'Test Admin',
  'admin@example.com',
  'admin',
  'admin',
  true,
  'approved'
);

-- Super Admin (replace AUTH_USER_UUID_3 with actual UUID)
INSERT INTO public.users (
  id, auth_user_id, name, email, username, role, 
  verified, approval_status
)
VALUES (
  gen_random_uuid(),
  'AUTH_USER_UUID_3',
  'Test Super Admin',
  'superadmin@example.com',
  'superadmin',
  'super-admin',
  true,
  'approved'
);

-- Pending Student (replace AUTH_USER_UUID_4 with actual UUID)
INSERT INTO public.users (
  id, auth_user_id, name, email, username, role, 
  prn, batch, department, college_id, year_of_study, 
  verified, approval_status
)
VALUES (
  gen_random_uuid(),
  'AUTH_USER_UUID_4',
  'Pending Student',
  'pending@example.com',
  'pending',
  'student',
  'STU002',
  '2024',
  'Computer Science',
  '11111111-1111-1111-1111-111111111111',
  2,
  true,
  'pending'
);
```

### Option 2: Using Supabase CLI (Advanced)

If you have the Supabase CLI installed, you can use the seed file:

```bash
supabase db push --file supabase/seed.sql
```

Note: You'll still need to create the auth users manually first.

## Verification

After setup, you should be able to log in with:

- **Student Account**
  - Email: `student@example.com`
  - Password: `password123`
  - Role: Student (approved)

- **Admin Account**
  - Email: `admin@example.com`
  - Password: `password123`
  - Role: Admin (approved)

- **Super Admin Account**
  - Email: `superadmin@example.com`
  - Password: `password123`
  - Role: Super Admin (approved)

- **Pending Student Account**
  - Email: `pending@example.com`
  - Password: `password123`
  - Role: Student (pending approval)

## Troubleshooting

### "Invalid login credentials" error

This means either:
1. The auth user wasn't created in Supabase Auth
2. The password doesn't match
3. Email confirmation is required but not completed

**Fix:** Go to Supabase Dashboard → Authentication → Users, and ensure:
- The user exists
- The email is confirmed (check the "Email Confirmed" column)
- If not confirmed, click on the user and manually confirm their email

### "User profile not found" error

This means the auth user exists, but there's no corresponding record in the `users` table.

**Fix:** Run the SQL insert statements from Step 2 above, making sure to use the correct `auth_user_id` from the auth.users table.

### How to find auth_user_id?

Run this query in Supabase SQL Editor:

```sql
SELECT id, email FROM auth.users;
```

Copy the `id` (UUID) for each email and use it in the INSERT statements.

## Security Note

⚠️ **Important:** These demo accounts are for development/testing only. 

**Before deploying to production:**
1. Delete all demo accounts
2. Use strong, unique passwords
3. Enable email confirmation
4. Set up proper security policies
5. Configure RLS (Row Level Security) policies

## Next Steps

Once demo users are created:
1. Test the login flow at `/auth/login`
2. Test different user roles and permissions
3. Test the approval flow with the pending student account
4. Test admin features with admin/super-admin accounts

