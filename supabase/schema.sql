-- ==============================================================================
-- LumaCV Complete Supabase Database Setup
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Enable Required Extensions
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 2. User Profiles Table
-- Automatically creates a user profile row whenever someone signs up via Email
-- ==============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  username text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Backfill for pre-existing installs that ran this script before `username` existed
alter table public.profiles add column if not exists username text;

-- Backfill for pre-existing installs that ran this script before `avatar_id`
-- existed. Stores one of lib/avatar-options.ts's fixed ids (e.g.
-- "avatar-07"), never a full URL, so the underlying asset can move without
-- a data migration. Null means "no avatar chosen, show initials."
alter table public.profiles add column if not exists avatar_id text;

-- Case-insensitive uniqueness so "Alex" and "alex" can't collide
create unique index if not exists idx_profiles_username_lower
  on public.profiles (lower(username))
  where username is not null;

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Profiles RLS Policies: Each user can only view & edit their own profile
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger: Automatically populate public.profiles on new signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'username', '')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, profiles.full_name),
    username = coalesce(excluded.username, profiles.username);
  return new;
end;
$$;

-- SECURITY DEFINER functions run with the definer's (elevated) privileges
-- and, unless revoked, Postgres grants EXECUTE to PUBLIC by default,
-- meaning Supabase's auto-generated PostgREST API exposes them at
-- /rest/v1/rpc/<function_name> to any anon or authenticated caller, not
-- just to the trigger that's meant to invoke them. handle_new_user only
-- needs to run as a trigger (Postgres invokes triggers directly, this
-- grant has no effect on that), so there's no legitimate reason for a
-- client to call it directly.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Also sync on updateUser() calls (e.g. changing username/full_name from
-- Settings), without this, public.profiles silently goes stale after the
-- first sign-up and username login stops resolving the current username.
drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- 3. User Resumes Table (CV Storage)
-- Stores the complete resume data (JSON) and generated Typst code
-- ==============================================================================
create table if not exists public.user_resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Untitled Resume',
  template_id text not null default 'classic',
  resume_data jsonb not null default '{}'::jsonb,
  typst_code text,
  ats_score integer default 0,
  target_job_title text,
  target_job_company text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes for ultra-fast queries per user
create index if not exists idx_user_resumes_user_id on public.user_resumes(user_id);
create index if not exists idx_user_resumes_updated_at on public.user_resumes(updated_at desc);

-- Enable Row Level Security (RLS)
alter table public.user_resumes enable row level security;

-- Strict User Isolation Policies:
-- Users can only SELECT, INSERT, UPDATE, and DELETE their own resumes
drop policy if exists "Users can view their own resumes" on public.user_resumes;
create policy "Users can view their own resumes"
  on public.user_resumes for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own resumes" on public.user_resumes;
create policy "Users can create their own resumes"
  on public.user_resumes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own resumes" on public.user_resumes;
create policy "Users can update their own resumes"
  on public.user_resumes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own resumes" on public.user_resumes;
create policy "Users can delete their own resumes"
  on public.user_resumes for delete
  using (auth.uid() = user_id);

-- Automatic updated_at timestamp trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

drop trigger if exists tr_user_resumes_updated_at on public.user_resumes;
create trigger tr_user_resumes_updated_at
  before update on public.user_resumes
  for each row execute procedure public.set_updated_at();

-- ==============================================================================
-- 3b. User Applications Table (Job Application Tracker)
-- This table was referenced by app/api/v1/applications/route.ts and
-- app/api/v1/applications/[id]/route.ts but was never actually defined here,
-- it did not exist in the live database. Every read/write against it was
-- silently swallowed by those routes' `catch` blocks (logged via
-- console.warn, falling back to an empty list), so the Applications tracker
-- looked like it worked but never persisted anything.
-- ==============================================================================
create table if not exists public.user_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  company text not null,
  position text not null,
  location text default '',
  remote_type text default 'unspecified',
  status text not null default 'applied',
  applied_date timestamptz default now(),
  deadline timestamptz,
  salary text default '',
  url text default '',
  job_description text default '',
  notes text default '',
  contacts jsonb not null default '[]'::jsonb,
  resume_id uuid references public.user_resumes(id) on delete set null,
  tags text[] not null default '{}'::text[],
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Matches the GET route's `.eq('user_id', ...).order('updated_at')` query exactly
create index if not exists idx_user_applications_user_updated
  on public.user_applications (user_id, updated_at desc);

alter table public.user_applications enable row level security;

drop policy if exists "Users can view their own applications" on public.user_applications;
create policy "Users can view their own applications"
  on public.user_applications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own applications" on public.user_applications;
create policy "Users can create their own applications"
  on public.user_applications for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own applications" on public.user_applications;
create policy "Users can update their own applications"
  on public.user_applications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own applications" on public.user_applications;
create policy "Users can delete their own applications"
  on public.user_applications for delete
  using (auth.uid() = user_id);

drop trigger if exists tr_user_applications_updated_at on public.user_applications;
create trigger tr_user_applications_updated_at
  before update on public.user_applications
  for each row execute procedure public.set_updated_at();

-- ==============================================================================
-- 4. PDF Compile Cache Table (Optional async render cache)
-- ==============================================================================
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  content_hash text unique not null,
  typst text,
  pdf_url text,
  status text check (status in ('queued', 'compiling', 'ready', 'failed')),
  attempts int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


create index if not exists idx_resumes_content_hash on public.resumes(content_hash);

alter table public.resumes enable row level security;

drop policy if exists "Allow read on compiled resumes" on public.resumes;
create policy "Allow read on compiled resumes"
  on public.resumes for select
  using (true);

-- ==============================================================================
-- 5. Storage Bucket (resumes)
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- ==============================================================================
-- 6. Platform Telemetry & Live Global Metrics
-- ==============================================================================
create table if not exists public.platform_stats (
  key text primary key,
  value bigint not null default 0,
  updated_at timestamptz default now() not null
);

alter table public.platform_stats enable row level security;

drop policy if exists "Allow public read on platform stats" on public.platform_stats;
create policy "Allow public read on platform stats"
  on public.platform_stats for select
  using (true);

-- Atomic increment helper function. Called server-side only (see
-- lib/stats-service.ts, via the service-role client) with a fixed,
-- code-controlled stat_key, never with a value a browser sent directly.
create or replace function public.increment_platform_stat(stat_key text, amount bigint default 1)
returns bigint
language plpgsql
security definer set search_path = public
as $$
declare
  new_value bigint;
begin
  insert into public.platform_stats (key, value, updated_at)
  values (stat_key, amount, now())
  on conflict (key) do update
    set value = public.platform_stats.value + excluded.value,
        updated_at = now()
  returning value into new_value;
  return new_value;
end;
$$;

-- Without this, Postgres's default PUBLIC execute grant means Supabase's
-- auto-generated PostgREST API exposes this at
-- /rest/v1/rpc/increment_platform_stat to any anon or authenticated
-- caller, since it's SECURITY DEFINER, anyone could call it directly
-- with an arbitrary stat_key/amount and corrupt the public homepage
-- stats, entirely bypassing the app's own code path.
revoke execute on function public.increment_platform_stat(text, bigint) from public, anon, authenticated;


-- ==============================================================================
-- 7. User Feedback Table
-- ==============================================================================
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  company text,
  rating integer default 5,
  type text default 'general',
  message text not null,
  created_at timestamptz default now() not null
);

alter table public.feedback enable row level security;

drop policy if exists "Allow insert on feedback" on public.feedback;
create policy "Allow insert on feedback"
  on public.feedback for insert
  with check (true);

-- ==============================================================================
-- 8. Supabase-Managed Event Trigger Lockdown
-- rls_auto_enable() is not defined by this script, it's an event_trigger
-- function some Supabase project templates install to auto-enable RLS on
-- newly created tables. Same default-PUBLIC-execute exposure as the
-- functions above applies, so close it the same way even though it isn't
-- ours to create or replace here.
-- ==============================================================================
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

