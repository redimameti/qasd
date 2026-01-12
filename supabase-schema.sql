-- Drop existing tables if they exist (careful - this deletes data!)
DROP TABLE IF EXISTS public.measurements CASCADE;
DROP TABLE IF EXISTS public.tactics CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.vision CASCADE;
DROP TABLE IF EXISTS public.cycles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop the trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create goals table
CREATE TABLE public.goals (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  measurement_configs JSONB DEFAULT '[]'::jsonb,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create tactics table
CREATE TABLE public.tactics (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  goal_id TEXT REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('daily', 'weekly')) NOT NULL,
  assigned_weeks INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7,8,9,10,11,12],
  completions JSONB DEFAULT '{}'::jsonb,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create measurements table
CREATE TABLE public.measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  goal_id TEXT REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  config_id TEXT NOT NULL,
  week_num INTEGER NOT NULL CHECK (week_num >= 1 AND week_num <= 12),
  value NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, config_id, week_num)
);

-- Create vision table
CREATE TABLE public.vision (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  long_term TEXT DEFAULT '',
  short_term TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create cycle table
CREATE TABLE public.cycles (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  current_week INTEGER DEFAULT 1 CHECK (current_week >= 1 AND current_week <= 12),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tactics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vision ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for goals
CREATE POLICY "Users can view their own goals" ON public.goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON public.goals
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for tactics
CREATE POLICY "Users can view their own tactics" ON public.tactics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tactics" ON public.tactics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tactics" ON public.tactics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tactics" ON public.tactics
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for measurements
CREATE POLICY "Users can view their own measurements" ON public.measurements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own measurements" ON public.measurements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own measurements" ON public.measurements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own measurements" ON public.measurements
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for vision
CREATE POLICY "Users can view their own vision" ON public.vision
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vision" ON public.vision
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vision" ON public.vision
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for cycles
CREATE POLICY "Users can view their own cycle" ON public.cycles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cycle" ON public.cycles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cycle" ON public.cycles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_tactics_user_id ON public.tactics(user_id);
CREATE INDEX idx_tactics_goal_id ON public.tactics(goal_id);
CREATE INDEX idx_measurements_user_id ON public.measurements(user_id);
CREATE INDEX idx_measurements_goal_id ON public.measurements(goal_id);
CREATE INDEX idx_vision_user_id ON public.vision(user_id);
CREATE INDEX idx_cycles_user_id ON public.cycles(user_id);

-- Create a trigger to automatically create a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
