# LinkedIn OAuth Setup Guide

This guide explains how to configure LinkedIn OAuth authentication in your CodePVG application using Supabase.

## Overview

The application uses Supabase Auth for LinkedIn OAuth integration. Users can sign in/sign up using their LinkedIn accounts, and their profiles are automatically created in the database.

## Prerequisites

1. A Supabase project (you already have one at `https://cicpspeczacdnykbqljm.supabase.co`)
2. A LinkedIn Developer account
3. A LinkedIn OAuth 2.0 app

## Step 1: Create a LinkedIn OAuth App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click on "Create app"
3. Fill in the required details:
   - **App name**: CodePVG
   - **LinkedIn Page**: Your organization's LinkedIn page (or create one)
   - **App logo**: Upload your app logo
   - **Legal agreement**: Accept the terms

4. Once created, go to the **Auth** tab

## Step 2: Configure LinkedIn OAuth App

In your LinkedIn app's **Auth** settings:

### Redirect URLs
Add the following redirect URL:
```
https://cicpspeczacdnykbqljm.supabase.co/auth/v1/callback
```

### Scopes
Request the following OAuth 2.0 scopes:
- `openid`
- `profile`
- `email`

### Get Credentials
Note down your:
- **Client ID**
- **Client Secret**

## Step 3: Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/project/cicpspeczacdnykbqljm)
2. Navigate to **Authentication** → **Providers**
3. Find **LinkedIn (OIDC)** in the list
4. Enable the provider
5. Enter your LinkedIn credentials:
   - **Client ID**: (from LinkedIn app)
   - **Client Secret**: (from LinkedIn app)
6. Click **Save**

## Step 4: Configure Frontend Environment Variables

Update your `frontend/.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://cicpspeczacdnykbqljm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpY3BzcGVjemFjZG55a2JxbGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDQ2NTcsImV4cCI6MjA3NDg4MDY1N30.fp5PmQ3oyt1O5j7IqPJNIgS6G29e_-Hk6osjM979va4

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Step 5: Test the Integration

1. Start your frontend application:
```bash
cd frontend
npm run dev
```

2. Navigate to the register or login page
3. Click on "Sign in with LinkedIn"
4. You should be redirected to LinkedIn for authentication
5. After successful authentication, you'll be redirected back to your app
6. Your profile will be automatically created in the database

## How It Works

### Authentication Flow

1. **User clicks "Sign in with LinkedIn"**
   - Frontend calls `supabase.auth.signInWithOAuth()` with provider `linkedin_oidc`
   - User is redirected to LinkedIn

2. **LinkedIn authentication**
   - User logs in to LinkedIn (if not already logged in)
   - User authorizes the app
   - LinkedIn redirects back to Supabase callback URL

3. **Supabase handles the OAuth callback**
   - Supabase exchanges the authorization code for tokens
   - Creates/updates the auth user in `auth.users` table
   - Redirects to your app's callback page: `/auth/callback`

4. **App callback page processes the session**
   - Retrieves the Supabase session
   - Checks if user profile exists in `public.users` table
   - If not exists, creates a new profile with:
     - `auth_user_id`: Supabase Auth user ID
     - `email`: From LinkedIn
     - `name`: From LinkedIn profile
     - `approval_status`: 'pending'
     - `role`: 'student'
   - Stores session data in localStorage
   - Redirects based on approval status

5. **Subsequent visits**
   - AuthContext checks for existing Supabase session
   - Automatically logs in the user if session is valid

### File Structure

```
frontend/
├── src/
│   ├── app/
│   │   └── auth/
│   │       ├── callback/
│   │       │   └── page.tsx          # OAuth callback handler
│   │       ├── login/
│   │       │   └── page.tsx          # Login with LinkedIn button
│   │       └── register/
│   │           └── page.tsx          # Register with LinkedIn button
│   ├── contexts/
│   │   └── AuthContext.tsx           # Session management
│   └── lib/
│       └── supabaseClient.ts         # Supabase client setup
```

### Key Code Snippets

#### Initiating LinkedIn OAuth (Register/Login Page)
```typescript
const handleLinkedInSignIn = async () => {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'linkedin_oidc',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('LinkedIn sign-in error:', error);
  }
};
```

#### Handling OAuth Callback
```typescript
// In /auth/callback/page.tsx
const { data: { session } } = await supabase.auth.getSession();

if (session?.user) {
  // Check if profile exists, create if not
  // Store session in localStorage
  // Redirect to appropriate page
}
```

## Database Schema

The OAuth user profile is stored in the `public.users` table with the following structure:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  prn TEXT,
  batch TEXT,
  department TEXT,
  college_id TEXT,
  year_of_study INTEGER,
  bio TEXT,
  approval_status TEXT DEFAULT 'pending',
  role TEXT DEFAULT 'student',
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Approval Workflow

OAuth users follow the same approval workflow as regular users:

1. **Pending Status**: After registration, `approval_status` is set to 'pending'
2. **Admin Approval**: Admin reviews and approves/rejects the user
3. **Access Granted**: Once approved, user can access the platform

Users with pending approval are redirected to `/auth/pending-approval` page.

## Troubleshooting

### Common Issues

1. **Redirect URL Mismatch**
   - Error: "Redirect URI mismatch"
   - Solution: Ensure the redirect URL in LinkedIn app matches exactly:
     ```
     https://cicpspeczacdnykbqljm.supabase.co/auth/v1/callback
     ```

2. **Invalid Scopes**
   - Error: "Invalid scope"
   - Solution: Make sure your LinkedIn app has requested `openid`, `profile`, and `email` scopes

3. **Session Not Found**
   - Error: "No session found"
   - Solution: Check browser console for errors, ensure Supabase credentials are correct

4. **Profile Not Created**
   - Issue: User authenticated but no profile in database
   - Solution: Check browser console in `/auth/callback` page for errors
   - Verify Supabase RLS policies allow inserts to `users` table

### Debug Mode

To debug OAuth flow:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Initiate LinkedIn sign-in
4. Check the requests to:
   - LinkedIn OAuth endpoints
   - Supabase callback endpoint
   - Your app's callback page

## Security Considerations

1. **Client Secret**: Never expose your LinkedIn Client Secret in frontend code
2. **Redirect URL**: Only add trusted redirect URLs to your LinkedIn app
3. **Session Storage**: Tokens are stored in localStorage, ensure HTTPS in production
4. **RLS Policies**: Ensure proper Row Level Security policies in Supabase
5. **Approval Workflow**: OAuth users require admin approval before accessing the platform

## Additional Resources

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login)
- [LinkedIn OAuth 2.0 Documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [Supabase Dashboard](https://app.supabase.com/project/cicpspeczacdnykbqljm)

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check Supabase logs in the Dashboard
3. Verify all configuration steps are completed
4. Ensure environment variables are loaded correctly

