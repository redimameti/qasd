-- Fix for foreign key constraint issue
-- Run this in your Supabase SQL Editor

-- Option 1: Remove the foreign key constraints (simpler, recommended for now)
-- This removes the constraint that requires users to exist in a separate users table

ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_user_id_fkey;
ALTER TABLE tactics DROP CONSTRAINT IF EXISTS tactics_user_id_fkey;
ALTER TABLE measurements DROP CONSTRAINT IF EXISTS measurements_user_id_fkey;
ALTER TABLE vision DROP CONSTRAINT IF EXISTS vision_user_id_fkey;
ALTER TABLE cycles DROP CONSTRAINT IF EXISTS cycles_user_id_fkey;

-- The tables will still have user_id columns, but won't require a users table
-- RLS policies will still protect the data using auth.uid()
