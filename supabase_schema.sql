
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- USER PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  subscription_plan text default 'free' check (subscription_plan in ('free', 'basic', 'pro')),
  monthly_generations_used int default 0,
  total_credits int default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROJECTS
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  platform text check (platform in ('TikTok', 'Reels', 'Shorts')),
  logline text,
  status text default 'draft' check (status in ('draft', 'scripted', 'producing', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CHARACTERS
create table public.characters (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  description text,
  image_urls text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SCRIPTS
create table public.scripts (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  content jsonb not null, -- Array of ScriptScene
  version int default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- VIDEOS
create table public.videos (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  script_id uuid references public.scripts(id) on delete set null,
  url text not null,
  thumbnail_url text,
  status text default 'processing' check (status in ('processing', 'completed', 'failed')),
  has_audio boolean default false,
  voice_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- VOICES
create table public.voices (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  provider text check (provider in ('elevenlabs', 'kling', 'cloned')),
  gender text check (gender in ('male', 'female')),
  style text,
  preview_url text,
  is_custom boolean default false,
  project_id uuid references public.projects(id) on delete set null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) - Basic setup
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.characters enable row level security;
alter table public.scripts enable row level security;
alter table public.videos enable row level security;
alter table public.voices enable row level security;

-- Policies (Allow users to see only their own data)
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can manage own projects" on public.projects for all using (auth.uid() = user_id);
create policy "Users can manage own characters" on public.characters for all using (auth.uid() = user_id);
create policy "Users can manage own scripts" on public.scripts for all using (
  exists (select 1 from public.projects p where p.id = scripts.project_id and p.user_id = auth.uid())
);
create policy "Users can manage own videos" on public.videos for all using (
  exists (select 1 from public.projects p where p.id = videos.project_id and p.user_id = auth.uid())
);
create policy "Users can manage own voices" on public.voices for all using (auth.uid() = user_id);
