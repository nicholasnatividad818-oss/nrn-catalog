# NRN Music Catalog

Central music catalog for independent artists — **Next.js 14 + TypeScript + Tailwind + Supabase + Zod**.

## Features
- Dashboard, song catalog, manual song creation, track detail pages
- Releases, contributors/credits, ownership/publishing/master splits
- Lyrics, audio metadata (BPM/key/duration/genre), distributor, platform IDs (Spotify/Apple/SoundCloud)
- Catalog health / missing metadata tracking
- Search, sort, filtering (URL-persisted)
- CSV import (alias-tolerant) + export (streaming)
- Responsive editorial design: black / charcoal / off-white / purple

## Quick start (local mode — no Supabase needed)
```bash
cd nrn-catalog
npm install
npm run dev
# → http://localhost:3000
```
Seed data is in `localStorage` (`nrn_catalog_v1`). All features work without credentials.

## With Supabase (production persistence + RLS)
1. Create project at https://supabase.com/dashboard
2. Copy `.env.example` → `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only)
3. Run migrations (see `supabase/migrations/README.md`):
   ```bash
   npm i -g supabase
   supabase link --project-ref YOUR_REF
   supabase db push
   ```
4. Never expose service_role to browser — only server env.

## Scripts
```bash
npm run dev        # dev server
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## Design
Editorial, analog-studio inspired. Tailwind `nrn` palette: black `#0A0A0A`, charcoal `#1A1A1A`, paper `#F5F3EF`, purple `#6D28D9` / `#8B5CF6`. Minimal borders, mono IDs, serif headings.

## Security
- Every private row has `user_id = auth.uid()` via RLS (`(select auth.uid())` caching).
- All writes re-validate with Zod server-side; browser `user_id` is never trusted.
- Service-role key only in server env.
