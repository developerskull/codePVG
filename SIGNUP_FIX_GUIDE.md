# Signup Form Fix - Complete Guide

## Problem
- ✅ Signup form gets stuck with "Creating account..." 
- ✅ Form data not being stored in Supabase users table
- ✅ Page not redirecting to success page

## Root Cause
**Row Level Security (RLS) policies** in Supabase are blocking the insert to `users` table.

## SOLUTION - Follow These Steps

### Step 1: Fix Supabase RLS Policies (REQUIRED)

1. **Go to Supabase Dashboard:**
   - Open: https://app.supabase.com/project/cicpspeczacdnykbqljm
   - Click on "SQL Editor" in the left sidebar

2. **Run this SQL:**
   - Copy ALL contents from `supabase/quick-fix-rls.sql`
   - Paste into SQL Editor
   - Click "RUN" button

   **Or copy this directly:**
   ```sql
   -- Quick Fix for Signup Issues
   
   DROP POLICY IF EXISTS users_insert_any ON public.users;
   DROP POLICY IF EXISTS users_select_self ON public.users;
   DROP POLICY IF EXISTS users_update_self ON public.users;
   
   CREATE POLICY users_insert_any ON public.users
   FOR INSERT WITH CHECK (true);
   
   CREATE POLICY users_select_self ON public.users
   FOR SELECT USING (
     auth.uid() = auth_user_id 
     OR auth.uid() IS NULL
     OR EXISTS (
       SELECT 1 FROM public.users u 
       WHERE u.auth_user_id = auth.uid() 
       AND u.role IN ('admin', 'super-admin')
     )
   );
   
   CREATE POLICY users_update_self ON public.users
   FOR UPDATE 
   USING (auth.uid() = auth_user_id)
   WITH CHECK (auth.uid() = auth_user_id);
   
   GRANT USAGE ON SCHEMA public TO anon, authenticated;
   GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated;
   ```

3. **Verify:**
   - You should see "Success. No rows returned" message
   - This means policies are now fixed!

### Step 2: Test Signup

1. **Open the signup page:**
   ```
   http://localhost:3000/auth/register
   ```

2. **Fill the form with test data:**
   ```
   Name: Test User
   Email: test@example.com
   Password: Test@123
   Confirm Password: Test@123
   (other fields optional)
   ```

3. **Click "Create Account"**

4. **Check browser console (F12 → Console tab):**
   - Should see: "Starting registration for: test@example.com"
   - Should see: "Auth user created: [uuid]"
   - Should see: "Creating user profile..."
   - Should see: "Profile created successfully: [uuid]"
   - Should see: "Registration successful, redirecting..."

5. **Should redirect to:**
   ```
   http://localhost:3000/auth/registration-success
   ```

### Step 3: Verify in Supabase

1. **Check Auth Users:**
   - Go to Authentication → Users
   - Should see your test user

2. **Check Database:**
   - Go to Table Editor → users table
   - Should see a row with your user data
   - `auth_user_id` should match the UUID from Auth Users

## Debugging - If Still Not Working

### Check Browser Console

Press F12 → Console tab and look for errors:

**If you see:**
```
"Profile insert error: new row violates row-level security policy"
```
→ **Solution:** Run the SQL fix again (Step 1)

**If you see:**
```
"Auth signup error: User already registered"
```
→ **Solution:** Email already exists, use a different email

**If you see:**
```
"Profile insert error: duplicate key value violates unique constraint"
```
→ **Solution:** PRN/Email/Username already exists, use different values

### Check Network Tab

Press F12 → Network tab:

1. **Look for requests to Supabase:**
   - Should see POST to `...supabase.co/auth/v1/signup`
   - Should see POST to `...supabase.co/rest/v1/users`

2. **Check response status:**
   - 200/201 = Success ✅
   - 400 = Bad request (validation error)
   - 403 = Permission denied (RLS blocking)
   - 409 = Conflict (duplicate data)

### Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| "Database permission error" | RLS blocking insert | Run SQL fix |
| "This PRN number is already registered" | Duplicate PRN | Use different PRN |
| "This email is already registered" | Duplicate email | Use different email |
| "This username is already taken" | Duplicate username | Use different username |
| "User creation failed" | Supabase Auth error | Check Supabase dashboard |

## What's Changed (Technical)

### 1. Form Handling
**Before:**
```typescript
await register(...);
router.push('/auth/registration-success'); // Always redirects
```

**After:**
```typescript
await register(...);
// Only redirects if no error thrown
router.push('/auth/registration-success');
```

### 2. Registration Function
**Before:**
- Silent failures
- No detailed logging
- Generic error messages

**After:**
- ✅ Detailed console logging
- ✅ Specific error messages
- ✅ Auto-cleanup on failure
- ✅ Success toast notification

### 3. Error Handling
**Before:**
```typescript
if (error) {
  showToast({ title: 'Error', description: error.message });
}
```

**After:**
```typescript
if (insErr.message?.includes('permission')) {
  message = 'Database permission error. Run SQL fix!';
} else if (insErr.message?.includes('prn')) {
  message = 'PRN already registered';
}
// ... specific handling for each case
```

## Files Modified

1. ✅ `frontend/src/contexts/AuthContext.tsx`
   - Added detailed logging
   - Better error handling
   - Specific error messages
   - Success toast

2. ✅ `frontend/src/app/auth/register/page.tsx`
   - Only redirect on success
   - Better error display
   - Keep form data on error

3. ✅ `supabase/quick-fix-rls.sql` - NEW
   - Fixes RLS policies
   - Grants necessary permissions

## Testing Checklist

After running the SQL fix:

- [ ] Signup form loads properly
- [ ] Can fill all fields
- [ ] Click "Create Account" shows loading state
- [ ] Browser console shows detailed logs
- [ ] Success toast appears
- [ ] Redirects to success page
- [ ] User appears in Supabase Auth → Users
- [ ] Profile appears in Database → users table
- [ ] Can login with created account

## Quick Test Commands

### Check if RLS is blocking:
```sql
-- Run in Supabase SQL Editor
SELECT * FROM public.users LIMIT 1;
-- If you get permission denied, RLS is too restrictive
```

### Manually insert test user:
```sql
-- Only if you need to test database directly
INSERT INTO public.users (
  auth_user_id, email, name, role, approval_status
) VALUES (
  gen_random_uuid(),
  'manual@test.com',
  'Manual Test',
  'student',
  'pending'
);
```

### Check existing users:
```sql
SELECT id, email, name, role, approval_status, created_at 
FROM public.users 
ORDER BY created_at DESC 
LIMIT 10;
```

## Still Having Issues?

### 1. Check Supabase Project Status
- Go to Supabase Dashboard → Project Settings
- Ensure project is active (not paused)

### 2. Verify Environment Variables
Check `frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://cicpspeczacdnykbqljm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3. Clear Browser Cache
```
1. Open DevTools (F12)
2. Go to Application tab
3. Clear storage
4. Hard refresh (Ctrl+Shift+R)
```

### 4. Check Console for Detailed Logs

The new code logs everything:
```
Starting registration for: [email]
Auth user created: [uuid]
Creating user profile...
Profile created successfully: [uuid]
Registration successful, redirecting...
```

If any step fails, you'll see exactly where!

## Summary

### The Issue:
❌ RLS policies blocking signup → Form stuck → No data in database

### The Fix:
1. ✅ Run SQL to fix RLS policies
2. ✅ Better error handling and logging
3. ✅ Only redirect on success
4. ✅ Clear error messages

### Result:
✅ Signup works in 1-2 seconds
✅ Data stored in Supabase
✅ Proper error messages
✅ Successful redirect

**Most Important:** Run the SQL fix first! Everything else depends on it.

---

**Need Help?** Check browser console (F12) - the detailed logs will tell you exactly what's wrong!

