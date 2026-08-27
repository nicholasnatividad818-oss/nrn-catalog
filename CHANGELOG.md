# Changelog

All notable changes to the NRN Music Catalog are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.0] - 2026-08-22

### Fixed
- Correct `pgcrypto` extension migration in `supabase/migrations/001_initial_schema.sql` — `b28f15b`

### Added
- Support Supabase publishable-key model (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) with `NEXT_PUBLIC_SUPABASE_ANON_KEY` fallback — `082a330`
  - Updated `.env.example`, `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`, `src/app/auth/callback/route.ts`
- Deno workflow for linting and testing (`.github/workflows/deno.yml`) — `42b5ca9`

### Changed
- Ignore TypeScript build cache (`tsconfig.tsbuildinfo`) via `.gitignore` — `1687e81`
- Stable build checkpoint before dependency upgrades — `8711c83`

### Notes
- Branch: `fix/auth-rls` (up to date with `origin/fix/auth-rls`)
- Version remains `0.1.0` (no tag yet)
