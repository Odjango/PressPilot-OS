-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROJECTS TABLE
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  site_type text not null check (site_type in ('general', 'ecommerce', 'restaurant')),
  language text not null check (language in ('en', 'es', 'fr', 'it', 'ar')),
  data jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- JOBS TABLE
create type job_status as enum ('pending', 'processing', 'completed', 'failed');
create type job_type as enum ('generate', 'regenerate', 'cleanup');

create table if not exists public.jobs (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) not null,
  status job_status not null default 'pending',
  type job_type not null default 'generate',
  result jsonb, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- GENERATED THEMES TABLE
create type theme_status as enum ('active', 'expired', 'deleted');

create table if not exists public.generated_themes (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) not null,
  file_path text not null,
  status theme_status not null default 'active',
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES
alter table public.projects enable row level security;
alter table public.jobs enable row level security;
alter table public.generated_themes enable row level security;

-- Projects: Users can only see their own projects
create policy "Users can view own projects" on public.projects
  for select using (auth.uid() = user_id);

create policy "Users can insert own projects" on public.projects
  for insert with check (auth.uid() = user_id);

-- Jobs: Users can view jobs for their projects
create policy "Users can view own jobs" on public.jobs
  for select using (
    exists (
      select 1 from public.projects
      where projects.id = jobs.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Generated Themes: Users can view themes for their jobs
create policy "Users can view own themes" on public.generated_themes
  for select using (
    exists (
      select 1 from public.jobs
      join public.projects on projects.id = jobs.project_id
      where jobs.id = generated_themes.job_id
      and projects.user_id = auth.uid()
    )
  );

-- BUCKET POLICIES (Conceptual - applied via Storage UI or separate script)
-- Bucket 'logos': Public Read, Authenticated Insert
-- Bucket 'generated-themes': Authenticated Read (Signed URL), Service Role Insert
