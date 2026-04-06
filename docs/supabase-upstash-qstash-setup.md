# Supabase + Upstash + QStash Setup

This project now supports an async PDF pipeline designed for Vercel Free.

## 1. Supabase project

### Create the project

1. Open the Supabase dashboard.
2. Create a new project.
3. Copy these values from Project Settings:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Create the storage bucket

Create a private bucket:

- name: `resumes`
- public: `false`

### Create the SQL table

Run this in the SQL editor:

```sql
create extension if not exists pgcrypto;

create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  content_hash text unique not null,
  latex text,
  pdf_url text,
  status text check (status in ('queued', 'compiling', 'ready', 'failed')),
  attempts int default 0,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index if not exists idx_hash on resumes(content_hash);
```

### Signed URL policy

Use server-side signed URLs for PDF access.

- bucket stays private
- signed URL expiry: `3600` to `86400` seconds
- app currently defaults to 6 hours

## 2. Upstash Redis

Create a Redis database and copy:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Redis keys used:

- `pdf:{hash}`
- `job:{hash}`
- `lock:{hash}`
- `circuit:{provider}`

## 3. QStash

Create a QStash project and copy:

- `QSTASH_TOKEN`
- `QSTASH_URL` (optional, only if your console shows a regional URL like `https://qstash-eu-central-1.upstash.io`)
- `QSTASH_CURRENT_SIGNING_KEY`
- `QSTASH_NEXT_SIGNING_KEY`

Create an app secret used between QStash and the compile worker:

- `COMPILE_WORKER_SECRET`

Set the base URL used by QStash to call the worker:

- `APP_BASE_URL=https://your-app.vercel.app`

Note: when using the shared secret fallback, the publisher must forward the header to the destination using `Upstash-Forward-X-Worker-Secret`, so the worker receives it as `x-worker-secret`.

## 4. Environment variables

```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

QSTASH_TOKEN=
QSTASH_URL=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=
COMPILE_WORKER_SECRET=
APP_BASE_URL=https://your-app.vercel.app

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_RESUMES_BUCKET=resumes
```

## 5. Flow after setup

1. Frontend sends LaTeX to `/api/v1/resume/render`
2. API hashes content and checks Redis
3. If cached PDF exists, return signed URL
4. If not, create job state and enqueue QStash message
5. Worker compiles via provider fallback chain
6. Worker uploads PDF to Supabase Storage
7. Worker writes signed URL and ready state to Redis + Supabase
8. Frontend polls job status and renders the signed URL

## 6. Local development behavior

If async infra variables are missing:

- preview route returns `unsupported`
- UI falls back to direct compile via `/api/v1/resume/compile`

That keeps local development usable while production uses async infrastructure.

## 7. Signature verification

The worker route supports:

- preferred: QStash signature verification with
  - `QSTASH_CURRENT_SIGNING_KEY`
  - `QSTASH_NEXT_SIGNING_KEY`
- fallback: shared secret header with `COMPILE_WORKER_SECRET`

Production should use the QStash signing keys.
