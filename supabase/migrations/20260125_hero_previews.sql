-- Hero Previews Table
-- Stores user input and generated hero preview URLs
CREATE TABLE IF NOT EXISTS hero_previews (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_hero_previews_user_id ON hero_previews(user_id);
CREATE INDEX IF NOT EXISTS idx_hero_previews_order_id ON hero_previews(order_id);
CREATE INDEX IF NOT EXISTS idx_hero_previews_created_at ON hero_previews(created_at);

-- Row Level Security
ALTER TABLE hero_previews ENABLE ROW LEVEL SECURITY;

-- Users can view their own previews
CREATE POLICY "Users can view own previews"
    ON hero_previews FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own previews
CREATE POLICY "Users can insert own previews"
    ON hero_previews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own previews
CREATE POLICY "Users can update own previews"
    ON hero_previews FOR UPDATE
    USING (auth.uid() = user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_hero_previews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hero_previews_updated_at
    BEFORE UPDATE ON hero_previews
    FOR EACH ROW
    EXECUTE FUNCTION update_hero_previews_updated_at();
