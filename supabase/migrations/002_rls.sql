-- RLS — every table must be isolated to auth.uid() = user_id
-- Policies use (select auth.uid()) for plan caching

-- enable RLS
alter table public.profiles enable row level security;
alter table public.tracks enable row level security;
alter table public.releases enable row level security;
alter table public.release_tracks enable row level security;
alter table public.contributors enable row level security;
alter table public.track_credits enable row level security;
alter table public.ownership_splits enable row level security;

-- profiles
drop policy if exists "profiles_all_own" on public.profiles;
create policy "profiles_all_own" on public.profiles for all using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- tracks
drop policy if exists "tracks_select_own" on public.tracks;
create policy "tracks_select_own" on public.tracks for select using ((select auth.uid()) = user_id);
drop policy if exists "tracks_insert_own" on public.tracks;
create policy "tracks_insert_own" on public.tracks for insert with check ((select auth.uid()) = user_id);
drop policy if exists "tracks_update_own" on public.tracks;
create policy "tracks_update_own" on public.tracks for update using ((select auth.uid()) = user_id);
drop policy if exists "tracks_delete_own" on public.tracks;
create policy "tracks_delete_own" on public.tracks for delete using ((select auth.uid()) = user_id);

-- releases
drop policy if exists "releases_select_own" on public.releases;
create policy "releases_select_own" on public.releases for select using ((select auth.uid()) = user_id);
drop policy if exists "releases_insert_own" on public.releases;
create policy "releases_insert_own" on public.releases for insert with check ((select auth.uid()) = user_id);
drop policy if exists "releases_update_own" on public.releases;
create policy "releases_update_own" on public.releases for update using ((select auth.uid()) = user_id);
drop policy if exists "releases_delete_own" on public.releases;
create policy "releases_delete_own" on public.releases for delete using ((select auth.uid()) = user_id);

-- release_tracks (denormalized user_id)
drop policy if exists "release_tracks_all_own" on public.release_tracks;
create policy "release_tracks_all_own" on public.release_tracks for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- contributors
drop policy if exists "contributors_all_own" on public.contributors;
create policy "contributors_all_own" on public.contributors for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- track_credits
drop policy if exists "track_credits_all_own" on public.track_credits;
create policy "track_credits_all_own" on public.track_credits for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ownership_splits
drop policy if exists "ownership_splits_all_own" on public.ownership_splits;
create policy "ownership_splits_all_own" on public.ownership_splits for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
