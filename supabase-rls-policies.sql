-- CRITICAL SECURITY UPDATE: Row Level Security Policies
-- Run this in your Supabase SQL Editor to protect user data

-- Enable RLS on all tables
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tactics ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycles ENABLE ROW LEVEL SECURITY;

-- Policies for GOALS table
CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for TACTICS table
CREATE POLICY "Users can view own tactics"
  ON tactics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tactics"
  ON tactics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tactics"
  ON tactics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tactics"
  ON tactics FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for MEASUREMENTS table
CREATE POLICY "Users can view own measurements"
  ON measurements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own measurements"
  ON measurements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own measurements"
  ON measurements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own measurements"
  ON measurements FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for VISION table
CREATE POLICY "Users can view own vision"
  ON vision FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vision"
  ON vision FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vision"
  ON vision FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vision"
  ON vision FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for CYCLES table
CREATE POLICY "Users can view own cycles"
  ON cycles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycles"
  ON cycles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycles"
  ON cycles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cycles"
  ON cycles FOR DELETE
  USING (auth.uid() = user_id);
