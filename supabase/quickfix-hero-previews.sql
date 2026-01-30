-- Quick Fix: Create hero_previews table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

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
    preview_urls JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Selected Hero Style
    selected_style TEXT,
    
    -- Payment & Generation Status
    payment_status TEXT DEFAULT 'pending',
    
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

-- Permissive policies for demo (tighten in production)
DROP POLICY IF EXISTS "Anyone can view previews" ON public.hero_previews;
CREATE POLICY "Anyone can view previews" ON public.hero_previews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert previews" ON public.hero_previews;
CREATE POLICY "Anyone can insert previews" ON public.hero_previews
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update previews" ON public.hero_previews;
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

DROP TRIGGER IF EXISTS hero_previews_updated_at ON public.hero_previews;
CREATE TRIGGER hero_previews_updated_at
    BEFORE UPDATE ON public.hero_previews
    FOR EACH ROW
    EXECUTE FUNCTION update_hero_previews_updated_at();
