# Supabase Setup Guide

This guide walks you through setting up Supabase for LumaCV to support Email/Password authentication and persistent CV storage.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and log in.
2. Click **New Project**.
3. Choose an organization, project name (e.g. `LumaCV`), and database password.
4. Select your preferred deployment region and click **Create new project**.

---

## 2. Configure Email Authentication

1. In your Supabase Dashboard, navigate to **Authentication** $\rightarrow$ **Providers** $\rightarrow$ **Email**.
2. Ensure **Enable Email provider** is toggled **ON**.
3. For local development or instant signups without an SMTP email server:
   - Toggle **Confirm email** to **OFF** (this allows users to log in immediately upon signup without waiting for an email confirmation link).
4. Click **Save**.

---

## 3. Run Database Migrations

Navigate to the **SQL Editor** in your Supabase dashboard, paste the contents of `supabase/schema.sql`, and click **Run**.

### Schema Summary:

```sql
-- 1. Profiles Table (synced with auth.users via trigger)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. User Resumes Table (stores tailored CVs)
create table public.user_resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Untitled Resume',
  template_id text not null default 'modern',
  resume_data jsonb not null,
  typst_code text,
  ats_score numeric(5,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. PDF Compile Cache Table (stores generated PDFs)
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  content_hash text unique not null,
  typst text,
  pdf_url text,
  status text check (status in ('queued', 'compiling', 'ready', 'failed')),
  attempts int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Security & Row Level Security (RLS)
The migration script automatically configures strict RLS policies:
- Users can **only** read, update, and delete their own profiles (`auth.uid() = id`).
- Users can **only** access their own saved resumes (`auth.uid() = user_id`).
- Compiled PDF cache entries are protected and accessible only to their owners or public preview tokens.

---

## 4. Setup Storage Bucket (Optional)

If you plan to store generated PDFs in Supabase Storage:
1. In the Supabase Dashboard, go to **Storage** $\rightarrow$ **Buckets**.
2. Click **New Bucket**.
3. Name it `resumes`.
4. Ensure the bucket is set to **Private**.
5. Click **Create Bucket**.

---

## 5. Configure Local Environment Variables

In your Supabase project dashboard, navigate to **Project Settings** $\rightarrow$ **API**:
- Copy **Project URL**
- Copy **anon public key**
- Copy **service_role key** (keep this secret)

Add them to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret_key
SUPABASE_RESUMES_BUCKET=resumes
```

Restart your local dev server:
```bash
npm run dev
```

Your authentication and CV storage are now fully active!
