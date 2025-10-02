-- Fix Supabase Authentication Setup
-- Run this in Supabase SQL Editor to fix login/signup issues

-- 1. Update RLS policy to allow inserts with service role
-- The current policy allows inserts but we need to ensure it works properly
DROP POLICY IF EXISTS users_insert_any ON public.users;
CREATE POLICY users_insert_any ON public.users
FOR INSERT 
WITH CHECK (true);  -- Allow anyone to insert during signup

-- 2. Update select policy to allow users to see their own profile immediately
DROP POLICY IF EXISTS users_select_self ON public.users;
CREATE POLICY users_select_self ON public.users
FOR SELECT USING (
  auth.uid() = auth_user_id 
  OR public.jwt_role() IN ('admin','super-admin')
  OR auth.uid() IS NULL  -- Allow unauthenticated reads during signup
);

-- 3. Create a function to automatically create user profile after auth signup
-- This is the recommended Supabase pattern
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM public.users WHERE auth_user_id = NEW.id
  ) THEN
    INSERT INTO public.users (
      auth_user_id,
      email,
      name,
      username,
      role,
      approval_status,
      verified
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.raw_user_meta_data->>'username',
      'student',
      'pending',
      false
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 5. Create trigger to auto-create profile when auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;

-- 7. Ensure auth.users table is accessible (this might already be set)
-- This allows the trigger to work properly
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Note: After running this, you should also configure Supabase settings:
-- 1. Go to Authentication -> Settings
-- 2. Disable "Enable email confirmations" for faster signup (optional)
-- 3. Set "Site URL" to http://localhost:3000 for development
-- 4. Add http://localhost:3000/auth/callback to "Redirect URLs"

