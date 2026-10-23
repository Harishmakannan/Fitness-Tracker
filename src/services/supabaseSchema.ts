/**
 * Complete Supabase SQL Schema for FitTrack
 * Includes full DDL, primary/foreign keys, indices, and Row Level Security (RLS) policies.
 */

export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- FitTrack Fitness & Wellness Platform - Production Supabase Schema
-- Tables: Hydration, Daily Checkups, Health Measurements, Habits, Summaries
-- Security: Strict Row Level Security (RLS) enforced via auth.uid()
-- =========================================================================

-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'America/Los_Angeles',
  unit_system TEXT CHECK (unit_system IN ('metric', 'imperial')) DEFAULT 'metric',
  weight_kg NUMERIC(5,2),
  height_cm NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and update their own profile"
  ON public.user_profiles
  FOR ALL
  USING (auth.uid() = id);

-- 2. Daily Hydration Goals Table
CREATE TABLE IF NOT EXISTS public.daily_hydration_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  daily_goal_ml INTEGER NOT NULL DEFAULT 2000 CHECK (daily_goal_ml >= 500 AND daily_goal_ml <= 10000),
  reminders_enabled BOOLEAN DEFAULT true,
  reminder_interval_mins INTEGER DEFAULT 120,
  personalization_note TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_hydration_goal UNIQUE (user_id)
);

ALTER TABLE public.daily_hydration_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their hydration goals"
  ON public.daily_hydration_goals
  FOR ALL
  USING (auth.uid() = user_id);

-- 3. Hydration Entries Table
CREATE TABLE IF NOT EXISTS public.hydration_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  amount_ml INTEGER NOT NULL CHECK (amount_ml > 0 AND amount_ml <= 3000),
  container_type TEXT NOT NULL CHECK (container_type IN ('small_glass', 'glass', 'bottle', 'custom')),
  note TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'quick-add', 'smart-bottle')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hydration_entries_user_date ON public.hydration_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_hydration_entries_timestamp ON public.hydration_entries(user_id, timestamp DESC);

ALTER TABLE public.hydration_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select, insert, update, delete their hydration entries"
  ON public.hydration_entries
  FOR ALL
  USING (auth.uid() = user_id);

-- 4. Daily Checkups Table
CREATE TABLE IF NOT EXISTS public.daily_checkups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  energy_level SMALLINT CHECK (energy_level BETWEEN 0 AND 5) DEFAULT 0,
  mood_level SMALLINT CHECK (mood_level BETWEEN 0 AND 5) DEFAULT 0,
  stress_level SMALLINT CHECK (stress_level BETWEEN 0 AND 5) DEFAULT 0,
  symptoms_notes TEXT,
  medication_status TEXT CHECK (medication_status IN ('all_taken', 'partially_taken', 'none_needed', 'skipped')) DEFAULT 'none_needed',
  is_completed BOOLEAN DEFAULT false,
  saved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_daily_checkup UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_checkups_user_date ON public.daily_checkups(user_id, date DESC);

ALTER TABLE public.daily_checkups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their daily checkups"
  ON public.daily_checkups
  FOR ALL
  USING (auth.uid() = user_id);

-- 5. Individual Health Measurements Table
CREATE TABLE IF NOT EXISTS public.health_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'resting_heart_rate',
    'blood_pressure',
    'body_temperature',
    'spo2',
    'body_weight',
    'sleep_duration'
  )),
  status TEXT NOT NULL CHECK (status IN ('recorded', 'not_measured', 'skipped')) DEFAULT 'not_measured',
  value_number NUMERIC(7,2),
  value_secondary NUMERIC(7,2), -- e.g. diastolic blood pressure
  unit TEXT NOT NULL CHECK (unit IN ('bpm', 'mmHg', 'degC', 'degF', 'percent', 'kg', 'lb', 'hours')),
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'wearable_sync', 'apple_health', 'health_connect')),
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_measurement_per_day UNIQUE (user_id, date, type)
);

CREATE INDEX IF NOT EXISTS idx_health_measurements_user_date ON public.health_measurements(user_id, date, type);

ALTER TABLE public.health_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their health measurements"
  ON public.health_measurements
  FOR ALL
  USING (auth.uid() = user_id);

-- 6. Daily Wellness Habits Table
CREATE TABLE IF NOT EXISTS public.daily_wellness_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('activity', 'mindfulness', 'nutrition', 'recovery')),
  icon TEXT NOT NULL DEFAULT 'check',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.daily_wellness_habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their habits"
  ON public.daily_wellness_habits
  FOR ALL
  USING (auth.uid() = user_id);

-- 7. Habit Completions Table
CREATE TABLE IF NOT EXISTS public.habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES public.daily_wellness_habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_habit_user_date UNIQUE (user_id, habit_id, date)
);

CREATE INDEX IF NOT EXISTS idx_habit_completions_user_date ON public.habit_completions(user_id, date);

ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their habit completions"
  ON public.habit_completions
  FOR ALL
  USING (auth.uid() = user_id);

-- 8. Checkup Completion Summaries Table
CREATE TABLE IF NOT EXISTS public.checkup_completion_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  letter_grade TEXT NOT NULL CHECK (letter_grade IN ('A', 'B', 'C', 'D', 'N/A')),
  grade_label TEXT NOT NULL,
  score_percent INTEGER NOT NULL CHECK (score_percent BETWEEN 0 AND 100),
  goals_met_count INTEGER NOT NULL,
  total_goals_tracked INTEGER NOT NULL,
  summary_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  calculated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_summary_user_date UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_summaries_user_date ON public.checkup_completion_summaries(user_id, date DESC);

ALTER TABLE public.checkup_completion_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage their completion summaries"
  ON public.checkup_completion_summaries
  FOR ALL
  USING (auth.uid() = user_id);

-- 9. User Reminders Table
CREATE TABLE IF NOT EXISTS public.user_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('water', 'checkup', 'sleep', 'workout')),
  label TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  scheduled_time TIME NOT NULL,
  repeat_days TEXT[] DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their reminders"
  ON public.user_reminders
  FOR ALL
  USING (auth.uid() = user_id);
`;
