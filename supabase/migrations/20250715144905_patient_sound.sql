/*
  # Add parent task support for subtasks

  1. Schema Changes
    - Add `parent_task_id` column to tasks table to create parent-child relationships
    - Add foreign key constraint to ensure data integrity
    - Add index for better query performance

  2. Security
    - Update RLS policies to handle subtask access
    - Ensure users can only access their own tasks and subtasks
*/

-- Add parent_task_id column to support subtasks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'parent_task_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN parent_task_id uuid REFERENCES tasks(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add index for better performance when querying subtasks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'tasks' AND indexname = 'tasks_parent_task_id_idx'
  ) THEN
    CREATE INDEX tasks_parent_task_id_idx ON tasks(parent_task_id);
  END IF;
END $$;

-- Update RLS policy to handle subtasks (users can access their own tasks and subtasks)
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;

CREATE POLICY "Users can manage their own tasks and subtasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM tasks parent_task 
      WHERE parent_task.id = tasks.parent_task_id 
      AND parent_task.user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM tasks parent_task 
      WHERE parent_task.id = tasks.parent_task_id 
      AND parent_task.user_id = auth.uid()
    )
  );