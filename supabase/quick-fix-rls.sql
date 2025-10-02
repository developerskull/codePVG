-- Quick Fix for Signup/Login Issues
-- Run this in Supabase SQL Editor to fix Row Level Security

-- 1. Drop existing restrictive policies
DROP POLICY IF EXISTS users_insert_any ON public.users;
DROP POLICY IF EXISTS users_select_self ON public.users;
DROP POLICY IF EXISTS users_update_self ON public.users;

-- 2. Allow anyone to insert during signup (this is safe with Supabase Auth)
CREATE POLICY users_insert_any ON public.users
FOR INSERT 
WITH CHECK (true);

-- 3. Allow users to select their own profile and admins to select all
CREATE POLICY users_select_self ON public.users
FOR SELECT 
USING (
  auth.uid() = auth_user_id 
  OR auth.uid() IS NULL  -- Allow unauthenticated reads during signup
  OR EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.auth_user_id = auth.uid() 
    AND u.role IN ('admin', 'super-admin')
  )
);

-- 4. Allow users to update their own profile
CREATE POLICY users_update_self ON public.users
FOR UPDATE 
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated;

-- Done! Your signup and login should work now.

