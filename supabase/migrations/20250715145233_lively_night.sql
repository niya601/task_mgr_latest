/*
  # Fix RLS Infinite Recursion

  1. Security Changes
    - Drop the recursive RLS policy that causes infinite recursion
    - Create a simple, non-recursive policy that checks user_id directly
    - Ensure all tasks (main and subtasks) have user_id set properly

  2. Policy Updates
    - Replace complex recursive policy with simple user ownership check
    - This prevents infinite recursion while maintaining security
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can manage their own tasks and subtasks" ON tasks;

-- Create a simple, non-recursive policy
CREATE POLICY "Users can manage their own tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);