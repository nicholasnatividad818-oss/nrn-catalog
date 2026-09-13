# NRN Music Catalog

[![CI](https://github.com/nicholasnatividad818-oss/nrn-catalog/actions/workflows/ci.yml/badge.svg)](https://github.com/nicholasnatividad818-oss/nrn-catalog/actions/workflows/ci.yml)

Central music catalog for independent artists — **Next.js 14 + TypeScript + Tailwind + Supabase + Zod**.

## Quick start
```bash
npm install
npm run dev
```
Local mode uses `localStorage` when Supabase env vars are unset.

## Deploy (Vercel + Supabase)
1. `npx supabase link --project-ref YOUR_REF && npx supabase db push`
2. Vercel env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Supabase Auth URL config: Site URL + `https://YOUR_DOMAIN/auth/callback`
4. Never put a service-role key in `NEXT_PUBLIC_` vars.

Signed-in catalogs persist to `tracks`, `releases`, and `release_tracks` under RLS.
