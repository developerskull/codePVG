-- Supabase RLS Policies
-- Run after schema.sql. Adjust according to your auth model.

-- Enable RLS
alter table public.users enable row level security;
alter table public.problems enable row level security;
alter table public.submissions enable row level security;
alter table public.leaderboard enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.colleges enable row level security;
alter table public.approval_events enable row level security;

-- Helper: simple role check via JWT (expects a custom claim "role")
create or replace function public.jwt_role()
returns text language sql stable as $$
  select coalesce(current_setting('request.jwt.claims', true)::jsonb->>'role', 'student')
$$;

drop policy if exists colleges_select on public.colleges;
create policy colleges_select on public.colleges
for select using (true);
drop policy if exists colleges_write on public.colleges;
create policy colleges_write on public.colleges
for all using (public.jwt_role() in ('admin','super-admin')) with check (public.jwt_role() in ('admin','super-admin'));

drop policy if exists users_select_self on public.users;
create policy users_select_self on public.users
for select using (
  auth.uid() = auth_user_id or public.jwt_role() in ('admin','super-admin')
);
drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users
for update using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id);
drop policy if exists users_insert_any on public.users;
create policy users_insert_any on public.users
for insert with check (true);

drop policy if exists problems_select_all on public.problems;
create policy problems_select_all on public.problems
for select using (true);
drop policy if exists problems_write_admin on public.problems;
create policy problems_write_admin on public.problems
for all using (public.jwt_role() in ('admin','super-admin')) with check (public.jwt_role() in ('admin','super-admin'));

drop policy if exists submissions_select_own_or_admin on public.submissions;
create policy submissions_select_own_or_admin on public.submissions
for select using (
  public.jwt_role() in ('admin','super-admin')
  or exists (
    select 1 from public.users u
    where u.id = public.submissions.user_id
      and u.auth_user_id = auth.uid()
  )
);
drop policy if exists submissions_insert_self on public.submissions;
create policy submissions_insert_self on public.submissions
for insert with check (
  exists (
    select 1 from public.users u
    where u.id = public.submissions.user_id
      and u.auth_user_id = auth.uid()
  )
);
drop policy if exists submissions_update_self on public.submissions;
create policy submissions_update_self on public.submissions
for update using (
  exists (
    select 1 from public.users u
    where u.id = public.submissions.user_id
      and u.auth_user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.users u
    where u.id = public.submissions.user_id
      and u.auth_user_id = auth.uid()
  )
);

drop policy if exists leaderboard_select_all on public.leaderboard;
create policy leaderboard_select_all on public.leaderboard
for select using (true);
-- no public write policy – perform updates using service role key from backend

drop policy if exists badges_select_all on public.badges;
create policy badges_select_all on public.badges
for select using (true);
drop policy if exists badges_write_admin on public.badges;
create policy badges_write_admin on public.badges
for all using (public.jwt_role() in ('admin','super-admin')) with check (public.jwt_role() in ('admin','super-admin'));

drop policy if exists user_badges_select_self_or_admin on public.user_badges;
create policy user_badges_select_self_or_admin on public.user_badges
for select using (
  public.jwt_role() in ('admin','super-admin')
  or exists (
    select 1 from public.users u
    where u.id = public.user_badges.user_id
      and u.auth_user_id = auth.uid()
  )
);
drop policy if exists user_badges_insert_self on public.user_badges;
create policy user_badges_insert_self on public.user_badges
for insert with check (
  exists (
    select 1 from public.users u
    where u.id = public.user_badges.user_id
      and u.auth_user_id = auth.uid()
  )
);

drop policy if exists approval_events_select_admin on public.approval_events;
create policy approval_events_select_admin on public.approval_events
for select using (public.jwt_role() in ('admin','super-admin'));
drop policy if exists approval_events_write_admin on public.approval_events;
create policy approval_events_write_admin on public.approval_events
for all using (public.jwt_role() in ('admin','super-admin')) with check (public.jwt_role() in ('admin','super-admin'));


