-- NRN Music Catalog — Initial schema
-- Run with: supabase db push  (or psql)
-- Requires Supabase project URL and service_role key set in .env

create extension if not exists "pgcrypto";

-- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- tracks
create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  version text,
  artist text not null,
  featured_artists text,
  album text,
  release_date date,
  isrc text,
  upc text,
  distributor text,
  bpm integer check (bpm between 20 and 300),
  key text,
  duration_seconds integer,
  duration_display text,
  genre text,
  lyrics text,
  songwriters text,
  producers text,
  engineers text,
  ownership_pct numeric(5,2),
  publishing_pct numeric(5,2),
  master_pct numeric(5,2),
  spotify_id text,
  apple_music_id text,
  soundcloud_id text,
  cover_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create unique index if not exists tracks_user_isrc_uidx on public.tracks(user_id, isrc) where isrc is not null and isrc <> '';
create unique index if not exists tracks_user_upc_uidx on public.tracks(user_id, upc) where upc is not null and upc <> '';
create index if not exists tracks_user_id_idx on public.tracks(user_id);

-- releases
create table if not exists public.releases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  release_type text check (release_type in ('single','ep','album','compilation')),
  upc text,
  distributor text,
  release_date date,
  cover_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create unique index if not exists releases_user_upc_uidx on public.releases(user_id, upc) where upc is not null and upc <> '';

-- release_tracks
create table if not exists public.release_tracks (
  release_id uuid references public.releases(id) on delete cascade,
  track_id uuid references public.tracks(id) on delete cascade,
  disc_number smallint default 1,
  track_number smallint,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (release_id, track_id)
);

-- contributors
create table if not exists public.contributors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  created_at timestamptz default now()
);

-- track_credits
create table if not exists public.track_credits (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks(id) on delete cascade,
  contributor_id uuid references public.contributors(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('songwriter','producer','engineer','featured_artist','mixer','mastering','other')),
  credit_name text,
  sort_order smallint default 0
);

-- ownership_splits
create table if not exists public.ownership_splits (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks(id) on delete cascade,
  contributor_id uuid references public.contributors(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  split_type text not null check (split_type in ('ownership','publishing','master')),
  percentage numeric(5,2) not null check (percentage >= 0 and percentage <= 100)
);

-- updated_at trigger
create or replace function public.handle_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists tracks_updated_at on public.tracks;
create trigger tracks_updated_at before update on public.tracks for each row execute function public.handle_updated_at();
drop trigger if exists releases_updated_at on public.releases;
create trigger releases_updated_at before update on public.releases for each row execute function public.handle_updated_at();

-- catalog health view
create or replace view public.catalog_health as
select t.*,
  (case when t.isrc is null or t.isrc='' then 1 else 0 end
   + case when t.upc is null or t.upc='' then 1 else 0 end
   + case when t.bpm is null then 1 else 0 end
   + case when t.key is null or t.key='' then 1 else 0 end
   + case when t.duration_display is null or t.duration_display='' then 1 else 0 end
   + case when t.genre is null or t.genre='' then 1 else 0 end
   + case when t.lyrics is null or t.lyrics='' then 1 else 0 end
   + case when t.distributor is null or t.distributor='' then 1 else 0 end
   + case when t.songwriters is null or t.songwriters='' then 1 else 0 end
   + case when t.ownership_pct is null then 1 else 0 end
   + case when (t.spotify_id is null or t.spotify_id='') and (t.apple_music_id is null or t.apple_music_id='') and (t.soundcloud_id is null or t.soundcloud_id='') then 1 else 0 end
  ) as missing_count
from public.tracks t;

-- handle new user -> profile
create or replace function public.handle_new_user() returns trigger as $$
begin insert into public.profiles (id, email, display_name) values (new.id, new.email, new.raw_user_meta_data->>'display_name'); return new; end; $$ language plpgsql security definer;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
