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
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

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
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, profiles.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
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
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tr_user_resumes_updated_at on public.user_resumes;
create trigger tr_user_resumes_updated_at
  before update on public.user_resumes
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

-- Atomic increment helper function
create or replace function public.increment_platform_stat(stat_key text, amount bigint default 1)
returns bigint
language plpgsql
security definer
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

