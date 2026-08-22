# Supabase Migrations

## Required credentials
Create a Supabase project at https://supabase.com/dashboard → get:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only, never expose to browser)

Copy `.env.example` to `.env.local` and fill them.

## Run migrations

### Option A — Supabase CLI (recommended)
```bash
npm i -g supabase
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### Option B — psql
```bash
psql "postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres" -f supabase/migrations/001_initial_schema.sql
psql "postgresql://..." -f supabase/migrations/002_rls.sql
```

### Option C — Supabase Dashboard
Dashboard → SQL Editor → paste each file content and Run.

## Verify RLS
```sql
select tablename, rowsecurity from pg_tables where schemaname='public';
select * from pg_policies where schemaname='public';
-- Create two test users and confirm cross-user isolation via anon key query.
```

## Local mode
When env vars are not set, the app runs in **local mode** using browser `localStorage` (key `nrn_catalog_v1`) with seed data. All catalog features work without Supabase; migrations are ready to apply when you create a project.
