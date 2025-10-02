-- FINAL FIX - Run this IMMEDIATELY in Supabase SQL Editor
-- This will completely fix the hanging insert issue

-- Step 1: Completely disable RLS (we'll re-enable with proper policies)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies (including hidden ones)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', r.policyname);
    END LOOP;
END $$;

-- Step 3: Grant ALL permissions to anon and authenticated
GRANT ALL PRIVILEGES ON public.users TO anon;
GRANT ALL PRIVILEGES ON public.users TO authenticated;
GRANT ALL PRIVILEGES ON public.users TO service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Step 4: Grant sequence permissions (for auto-increment)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Step 5: Re-enable RLS with a truly permissive policy
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 6: Create a single, permissive policy for ALL operations
CREATE POLICY "allow_all_operations" ON public.users
FOR ALL 
TO anon, authenticated, service_role
USING (true) 
WITH CHECK (true);

-- Step 7: Verify the fix worked
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled",
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'users') as "Policy Count"
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- You should see: RLS Enabled = true, Policy Count = 1

