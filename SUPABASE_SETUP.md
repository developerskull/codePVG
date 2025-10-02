## Supabase Setup for College Code Hub

This guide connects the app to Supabase as a BaaS for auth, database, and storage.

### 1) Create a Supabase project
- Go to `https://supabase.com` and create a project.
- Copy the Project URL and the anon and service role keys from Project Settings → API.

### 2) Configure environment variables

Backend (`backend/.env`):
```
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Frontend (`frontend/.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

You can use the provided examples: `backend/env.example` and `frontend/env.local.example`.

### 3) Install dependencies
Run in both folders:
```bash
cd backend && npm install && cd ../frontend && npm install
```

### 4) Clients (already added)
- Frontend client: `frontend/src/lib/supabaseClient.ts`
- Backend admin client: `backend/src/utils/supabase.ts`

### 5) Using Supabase in the frontend
Example: read a public table named `profiles`.
```tsx
import { supabase } from '@/lib/supabaseClient'

export async function fetchProfiles() {
  const { data, error } = await supabase.from('profiles').select('*')
  if (error) throw error
  return data
}
```

### 6) Using Supabase in the backend
Example: insert a row with the service client.
```ts
import { supabaseAdmin } from '../utils/supabase'

export async function createProfile(profile: { id: string; full_name: string }) {
  const { data, error } = await supabaseAdmin.from('profiles').insert(profile).select().single()
  if (error) throw error
  return data
}
```

### 7) Database schema
Create tables either in the Supabase dashboard (SQL editor) or via migrations. Example `profiles` table:
```sql
create table if not exists public.profiles (
  id uuid primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default now()
);
```

### 8) Auth (optional quick start)
- Enable Email/Password in Auth Settings.
- In the frontend, you can sign in with:
```ts
import { supabase } from '@/lib/supabaseClient'

await supabase.auth.signInWithPassword({ email, password })
```
- Server-side validation/roles can use `supabaseAdmin.auth` APIs when needed.

### 9) Storage (optional)
Create a bucket in Storage → create an RLS policy if required, then use:
```ts
import { supabase } from '@/lib/supabaseClient'

await supabase.storage.from('avatars').upload(`public/${userId}.png`, file)
```

### 10) Create demo users (for testing)

To create demo user accounts for testing:

1. See the detailed guide: [DEMO_USERS_SETUP.md](DEMO_USERS_SETUP.md)
2. Quick summary:
   - Go to Supabase Dashboard → Authentication → Users
   - Create auth users for: `student@example.com`, `admin@example.com`, `superadmin@example.com`, `pending@example.com`
   - Password for all: `password123`
   - Enable "Auto Confirm User" when creating them
   - Run the SQL inserts from DEMO_USERS_SETUP.md to create their profiles in the `users` table

### 11) Local development
```bash
# in one terminal
cd backend && npm run dev

# in another
cd frontend && npm run dev
```

### Notes
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. Keep it only in backend envs.
- If you deploy, set these envs on your hosting providers accordingly.
- Demo users are for development only - delete them before production deployment.


