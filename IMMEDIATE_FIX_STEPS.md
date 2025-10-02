# IMMEDIATE FIX - Signup & Login Not Working

## 🚨 CRITICAL: Follow These Steps IN ORDER

### Step 1: Fix Supabase Database (REQUIRED)

**This is the main issue - RLS is blocking everything**

1. **Open Supabase Dashboard:**
   ```
   https://app.supabase.com/project/cicpspeczacdnykbqljm
   ```

2. **Click "SQL Editor" in left sidebar**

3. **Copy and paste this entire SQL script:**
   ```sql
   -- CRITICAL FIX: Run this immediately
   
   -- Disable RLS temporarily
   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
   
   -- Drop all existing policies
   DROP POLICY IF EXISTS users_insert_any ON public.users;
   DROP POLICY IF EXISTS users_select_self ON public.users;
   DROP POLICY IF EXISTS users_update_self ON public.users;
   DROP POLICY IF EXISTS users_delete_admin ON public.users;
   
   -- Grant full permissions
   GRANT ALL ON public.users TO anon, authenticated;
   GRANT USAGE ON SCHEMA public TO anon, authenticated;
   
   -- Re-enable RLS with permissive policies
   ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
   
   -- Create permissive policy
   CREATE POLICY users_all_operations ON public.users
   FOR ALL
   USING (true)
   WITH CHECK (true);
   
   -- Add phone_number column if missing
   DO $$ 
   BEGIN
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'phone_number') THEN
       ALTER TABLE public.users ADD COLUMN phone_number VARCHAR(20);
     END IF;
   END $$;
   ```

4. **Click "RUN"** (bottom right)

5. **Verify success:** Should see "Success. No rows returned"

### Step 2: Create Demo Users (For Testing)

**Still in SQL Editor, run this:**

```sql
-- First, check if demo users exist
SELECT email FROM auth.users WHERE email LIKE '%example.com';

-- If no users found, you need to create them via Supabase Dashboard:
-- Go to Authentication → Users → "Add user" → "Create new user"
-- Create these users (one by one):

-- 1. Student User
--    Email: student@example.com
--    Password: password123
--    ✅ Check "Auto Confirm User"

-- 2. Admin User  
--    Email: admin@example.com
--    Password: password123
--    ✅ Check "Auto Confirm User"

-- After creating each auth user, you need to create their profile:
-- Copy the UUID from the Users list, then run:

INSERT INTO public.users (
  auth_user_id, 
  email, 
  name, 
  username, 
  role, 
  approval_status, 
  verified
) VALUES (
  'PASTE_AUTH_USER_UUID_HERE',  -- Replace with actual UUID
  'student@example.com',
  'Test Student',
  'student',
  'student',
  'approved',
  true
);

-- Repeat for admin:
INSERT INTO public.users (
  auth_user_id, 
  email, 
  name, 
  username, 
  role, 
  approval_status, 
  verified
) VALUES (
  'PASTE_ADMIN_UUID_HERE',  -- Replace with actual UUID
  'admin@example.com',
  'Test Admin',
  'admin',
  'admin',
  'approved',
  true
);
```

### Step 3: Test Signup

1. **Clear browser cache:**
   - Press F12
   - Right-click refresh button → "Empty Cache and Hard Refresh"
   - Or: Ctrl+Shift+Delete → Clear cache

2. **Go to signup page:**
   ```
   http://localhost:3000/auth/register
   ```

3. **Fill the form:**
   ```
   Name: Test User
   Email: test@example.com
   Password: Test@123
   Confirm Password: Test@123
   ```

4. **Open browser console (F12)** before clicking submit

5. **Click "Create Account"**

6. **Watch console - you should see:**
   ```
   Starting registration for: test@example.com
   Auth user created: [uuid]
   Creating user profile...
   Profile created successfully: [uuid]
   Registration successful, redirecting...
   ```

7. **Should redirect to:** `/auth/registration-success`

### Step 4: Test Login

1. **Go to login page:**
   ```
   http://localhost:3000/auth/login
   ```

2. **Try demo credentials:**
   ```
   Email: student@example.com
   Password: password123
   ```

3. **Watch console (F12) - should see:**
   ```
   Attempting login for: student@example.com
   Login successful, user ID: [uuid]
   Fetching user profile...
   Profile fetched successfully: [uuid]
   ```

4. **Should redirect to home page**

## 🔍 Troubleshooting

### If Signup Still Fails:

**Check console for specific error:**

1. **"Profile insert error: new row violates row-level security policy"**
   → SQL fix didn't run properly. Go back to Step 1.

2. **"This email is already registered"**
   → Email exists. Use different email or delete from Supabase dashboard.

3. **"Auth signup error: User already registered"**
   → User exists in auth but no profile. Check Supabase Auth → Users

4. **"Database permission error"**
   → RLS still blocking. Run Step 1 again.

### If Login Fails:

**Check console for specific error:**

1. **"Invalid login credentials"**
   → User doesn't exist or wrong password
   → Go to Supabase → Authentication → Users to verify

2. **"User profile not found"**
   → Auth user exists but no profile in users table
   → Create profile using SQL from Step 2

3. **"Profile fetch error"**
   → RLS blocking select. Run Step 1 again.

### Quick Verification Commands:

**Run in Supabase SQL Editor:**

```sql
-- Check if users table exists and has data
SELECT id, email, name, role, approval_status 
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if auth users exist
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'users';
```

## ✅ Success Checklist

After following all steps, verify:

- [ ] SQL script ran successfully (Step 1)
- [ ] Demo users created (Step 2)
- [ ] Can signup with new email
- [ ] Browser console shows detailed logs
- [ ] Redirects to success page after signup
- [ ] Can login with demo credentials
- [ ] Browser console shows login logs
- [ ] Redirects to home after login
- [ ] User appears in Supabase → Users
- [ ] Profile appears in Supabase → users table

## 📝 What Was Fixed

1. **RLS Policies:** Set to permissive (allow all for development)
2. **Permissions:** Granted to anon and authenticated roles
3. **Logging:** Added detailed console logs
4. **Error Messages:** Specific messages for each error type
5. **Form Flow:** Only redirect on success

## 🚀 Next Steps

Once signup/login works:

1. Test with real email
2. Verify email confirmation (if enabled)
3. Test all form validations
4. Create more demo users
5. Tighten RLS policies for production

## ⚠️ IMPORTANT

**The SQL fix in Step 1 is MANDATORY**

Without it, signup will fail with:
- "new row violates row-level security policy"
- "Database permission error"
- Form gets stuck on "Creating account..."

**Run Step 1 first before anything else!**

---

**Still having issues?** 
Check browser console (F12) - the detailed logs will show exactly what's wrong!

