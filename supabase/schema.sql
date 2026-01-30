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

-- HERO PREVIEWS TABLE
-- Stores user input and generated hero preview URLs
CREATE TABLE IF NOT EXISTS public.hero_previews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    
    -- User Input Data
    business_name TEXT NOT NULL,
    business_description TEXT,
    industry TEXT NOT NULL,
    logo_url TEXT,
    color_primary TEXT,
    color_secondary TEXT,
    
    -- Generated Preview URLs
    preview_urls JSONB NOT NULL,
    -- Example: {"split": "url1", "centered": "url2", "minimal": "url3"}
    
    -- Selected Hero Style
    selected_style TEXT,
    -- Values: 'split', 'centered', 'minimal'
    
    -- Payment & Generation Status
    payment_status TEXT DEFAULT 'pending',
    -- Values: 'pending', 'paid', 'failed'
    
    final_theme_url TEXT,
    order_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '7 days')
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_hero_previews_user_id ON public.hero_previews(user_id);
CREATE INDEX IF NOT EXISTS idx_hero_previews_order_id ON public.hero_previews(order_id);
CREATE INDEX IF NOT EXISTS idx_hero_previews_created_at ON public.hero_previews(created_at);

-- Row Level Security
ALTER TABLE public.hero_previews ENABLE ROW LEVEL SECURITY;

-- Users can view their own previews (or anyone if not authenticated - for demo)
CREATE POLICY "Anyone can view previews" ON public.hero_previews
    FOR SELECT USING (true);

-- Anyone can insert previews (for demo - tighten in production)
CREATE POLICY "Anyone can insert previews" ON public.hero_previews
    FOR INSERT WITH CHECK (true);

-- Users can update their own previews
CREATE POLICY "Anyone can update previews" ON public.hero_previews
    FOR UPDATE USING (true);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_hero_previews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hero_previews_updated_at
    BEFORE UPDATE ON public.hero_previews
    FOR EACH ROW
    EXECUTE FUNCTION update_hero_previews_updated_at();
