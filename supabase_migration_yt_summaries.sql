create table if not exists yt_summaries (
  id uuid primary key default gen_random_uuid(),
  video_id text not null,
  quality text not null, -- 'standard' | 'premium'
  language text not null, -- 'en', 'ar', etc., for future use
  summary_json jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_yt_summaries_video_quality
  on yt_summaries(video_id, quality);
