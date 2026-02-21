-- ============================================================
-- PeerPath — Supabase Database Schema
-- Run this entire file in the Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  year_of_study text,
  faculty      text,
  bio          text,
  avatar_url   text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Posts ───────────────────────────────────────────────────
create table if not exists posts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references profiles(id) on delete cascade not null,
  course_code text not null,
  topic       text not null,
  body        text not null,
  created_at  timestamptz default now()
);

-- ─── Volunteers ──────────────────────────────────────────────
create table if not exists volunteers (
  id         uuid primary key default uuid_generate_v4(),
  post_id    uuid references posts(id) on delete cascade not null,
  user_id    uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- ─── Sessions ────────────────────────────────────────────────
create table if not exists sessions (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid references posts(id) on delete cascade not null,
  tutor_id    uuid references profiles(id) on delete set null,
  tutor_name  text,
  notes       text,
  summary     text not null,
  created_at  timestamptz default now()
);

-- ─── Row Level Security ──────────────────────────────────────

alter table profiles   enable row level security;
alter table posts      enable row level security;
alter table volunteers enable row level security;
alter table sessions   enable row level security;

-- Profiles: users can read all, update own
create policy "Public profiles are viewable" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Posts: anyone can read, auth users can insert/delete own
create policy "Posts viewable by all" on posts for select using (true);
create policy "Authenticated users can create posts" on posts for insert with check (auth.uid() = user_id);
create policy "Users can delete own posts" on posts for delete using (auth.uid() = user_id);

-- Volunteers: anyone can read, auth users can manage own
create policy "Volunteers viewable by all" on volunteers for select using (true);
create policy "Auth users can volunteer" on volunteers for insert with check (auth.uid() = user_id);
create policy "Auth users can unvolunteer" on volunteers for delete using (auth.uid() = user_id);

-- Sessions: anyone can read, auth users can insert
create policy "Sessions viewable by all" on sessions for select using (true);
create policy "Auth users can add sessions" on sessions for insert with check (auth.uid() = tutor_id);
