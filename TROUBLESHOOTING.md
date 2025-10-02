# Troubleshooting Guide

Common issues and their solutions for College Code Hub.

## Authentication Issues

### "Invalid login credentials" Error

**Problem**: When trying to log in with the demo accounts shown on the login page, you get an "Invalid login credentials" error.

**Cause**: The demo users don't exist in your Supabase database yet. The accounts shown on the login page are for reference only and need to be created.

**Solution**:

1. **Quick Fix** - Follow the [DEMO_USERS_SETUP.md](DEMO_USERS_SETUP.md) guide to create demo users in your Supabase project.

2. **Step-by-step**:
   - Go to your Supabase Dashboard → Authentication → Users
   - Click "Add user" → "Create new user"
   - Create a user with:
     - Email: `student@example.com`
     - Password: `password123`
     - **Enable "Auto Confirm User"** (important!)
   - After creating the auth user, copy their UUID
   - Go to SQL Editor and run:
     ```sql
     INSERT INTO public.users (
       auth_user_id, name, email, username, role, 
       verified, approval_status
     )
     VALUES (
       'PASTE_UUID_HERE',
       'Test Student',
       'student@example.com',
       'student',
       'student',
       true,
       'approved'
     );
     ```

### "User profile not found" Error

**Problem**: Login succeeds but then fails with "User profile not found".

**Cause**: The Supabase Auth user exists, but there's no corresponding profile in the `users` table.

**Solution**:

1. Find the auth user's UUID:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL';
   ```

2. Create the user profile:
   ```sql
   INSERT INTO public.users (
     auth_user_id, name, email, username, role, 
     verified, approval_status
   )
   VALUES (
     'USER_UUID_FROM_STEP_1',
     'Your Name',
     'YOUR_EMAIL',
     'your_username',
     'student',
     true,
     'approved'
   );
   ```

### Email Not Confirmed

**Problem**: User exists but login fails due to email not being confirmed.

**Solution**:

1. Go to Supabase Dashboard → Authentication → Users
2. Find the user in the list
3. Click on the user
4. Look for "Email Confirmed" status
5. If not confirmed, click the "..." menu and select "Confirm Email"

Alternatively, when creating new users, always check the "Auto Confirm User" option.

### Logout Not Working

**Problem**: Clicking the logout button doesn't log the user out or doesn't redirect to login page.

**Cause**: The logout function wasn't redirecting users after clearing the session.

**Solution**:

This has been fixed in the latest version. The logout function now:
1. Clears the Supabase session
2. Removes all authentication data from localStorage
3. Shows a success toast notification
4. Redirects to the login page after 500ms

If you're still experiencing issues:
1. **Hard refresh the page**: Ctrl+Shift+R (Cmd+Shift+R on Mac)
2. **Clear browser cache**: Settings → Privacy → Clear browsing data
3. **Check browser console**: Look for any JavaScript errors (F12 → Console)
4. **Manually clear localStorage**: F12 → Application → Local Storage → Clear All

## Database Issues

### "Supabase configuration missing" Error

**Problem**: The app shows "Supabase configuration missing" error.

**Cause**: Environment variables are not set correctly.

**Solution**:

1. Create `frontend/.env.local` file (copy from `frontend/env.local.example`)
2. Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Get these values from: Supabase Dashboard → Settings → API

### "relation 'users' does not exist" Error

**Problem**: Database queries fail because tables don't exist.

**Cause**: Database schema hasn't been created yet.

**Solution**:

1. Go to Supabase Dashboard → SQL Editor
2. Open the file `supabase/schema.sql` from this repository
3. Copy and paste the entire contents into the SQL Editor
4. Click "Run" to execute

## Frontend Issues

### White Screen / Page Won't Load

**Problem**: Frontend shows a blank screen or won't load.

**Solutions**:

1. **Check browser console** for errors (F12 → Console tab)
2. **Clear browser cache and localStorage**:
   - Open DevTools (F12)
   - Application tab → Storage → Clear site data
3. **Restart the dev server**:
   ```bash
   cd frontend
   npm run dev
   ```

### "Failed to fetch" Errors

**Problem**: API calls fail with "Failed to fetch" or network errors.

**Causes & Solutions**:

1. **Backend not running**:
   - Start the backend: `cd backend && npm run dev`
   - Check that it's running on the correct port (default: 5000)

2. **CORS issues**:
   - Make sure `NEXT_PUBLIC_API_URL` in `.env.local` matches your backend URL
   - Default should be: `http://localhost:5000`

3. **Supabase connection issues**:
   - Verify Supabase URL and anon key in `.env.local`
   - Check Supabase project status in dashboard

## Backend Issues

### "Cannot connect to database" Error

**Problem**: Backend can't connect to Supabase.

**Solution**:

1. Verify `backend/.env` has correct Supabase credentials
2. Check that your Supabase project is active
3. Verify network connectivity to Supabase

### Port Already in Use

**Problem**: Backend won't start - "Port 5000 already in use".

**Solutions**:

1. **Kill the process using port 5000**:
   - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
   - Mac/Linux: `lsof -ti:5000 | xargs kill -9`

2. **Use a different port**:
   - Edit `backend/.env`: `PORT=5001`
   - Update `frontend/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5001`

## Development Workflow Issues

### Changes Not Reflecting

**Problem**: Code changes don't appear in the running app.

**Solutions**:

1. **Hard refresh browser**: Ctrl+Shift+R (Cmd+Shift+R on Mac)
2. **Restart dev server**: Stop (Ctrl+C) and start again
3. **Clear Next.js cache**:
   ```bash
   cd frontend
   rm -rf .next
   npm run dev
   ```
4. **Check for TypeScript errors**: These can prevent hot reload

### Build Errors

**Problem**: Build fails or shows TypeScript errors.

**Solutions**:

1. **Update dependencies**:
   ```bash
   npm install
   ```

2. **Check TypeScript version**:
   ```bash
   npm ls typescript
   ```

3. **Clear node_modules and reinstall**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Environment Setup

### Missing Environment Variables

**Checklist**:

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Backend** (`backend/.env`):
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx...
PORT=5000
NODE_ENV=development
```

## Getting More Help

If you're still experiencing issues:

1. **Check the logs**:
   - Frontend: Browser console (F12)
   - Backend: Terminal where server is running

2. **Review documentation**:
   - [README.md](README.md) - Main setup guide
   - [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Supabase configuration
   - [DEMO_USERS_SETUP.md](DEMO_USERS_SETUP.md) - Demo users setup

3. **Common debugging steps**:
   - Restart both frontend and backend servers
   - Clear browser cache and localStorage
   - Verify all environment variables are set
   - Check Supabase dashboard for project status
   - Look for error messages in browser console and terminal

4. **Report an issue**:
   - Include error messages
   - Include steps to reproduce
   - Include environment details (OS, Node version, etc.)

