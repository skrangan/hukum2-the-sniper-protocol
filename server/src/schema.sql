-- HUKUM 2: Database Schema (PostgreSQL)

-- Enable pgcrypto for gen_random_uuid if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id VARCHAR(64) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  preferred_subtitle_mode TEXT DEFAULT 'tanglish_with_english',
  total_aura_score BIGINT DEFAULT 0,
  highest_level_unlocked INT DEFAULT 1 CHECK (highest_level_unlocked BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- Per-level user progress
CREATE TABLE IF NOT EXISTS public.level_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  level_number INT NOT NULL CHECK (level_number BETWEEN 1 AND 10),
  status TEXT DEFAULT 'unlocked',
  best_aura_score INT DEFAULT 0,
  stars_earned INT DEFAULT 0 CHECK (stars_earned BETWEEN 0 AND 3),
  fastest_clear_time_ms INT,
  spectacle_flips_used INT DEFAULT 0,
  cameos_used JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, level_number)
);

-- Cameo and cosmetics unlock tracking
CREATE TABLE IF NOT EXISTS public.player_unlocks (
  user_id VARCHAR(64) REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  unlocked_cameos JSONB DEFAULT '["vimal_taxi"]'::jsonb,
  unlocked_outfits JSONB DEFAULT '["driver_veshti"]'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_aura ON public.profiles(total_aura_score DESC);
CREATE INDEX IF NOT EXISTS idx_progress_user ON public.level_progress(user_id);
