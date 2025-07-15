import { supabase } from './supabase'

export interface Task {
  id: string;
  user_id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  parent_task_id: string | null;
  created_at: string;
  updated_at: string;
  embedding?: number[] | null;
  subtasks?: Task[];
}

// Function to generate embedding for task text
const generateEmbedding = async (text: string): Promise<number[] | null> => {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-embedding`;
    
    const headers = {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.error('Failed to generate embedding');
      return null;
    }

    const result = await response.json();
    return result.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
};

export const getTasks = async (): Promise<{ data: Task[] | null; error: any }> => {
  // First get all main tasks (no parent)
  const { data, error } = await supabase
    .from('tasks')
    .select('id, user_id, text, priority, status, parent_task_id, created_at, updated_at')
    .is('parent_task_id', null)
    .order('created_at', { ascending: false })
  
  if (error || !data) {
    return { data, error }
  }

  // Then get subtasks for each main task
  const tasksWithSubtasks = await Promise.all(
    data.map(async (task) => {
      const { data: subtasks, error: subtaskError } = await supabase
        .from('tasks')
        .select('id, user_id, text, priority, status, parent_task_id, created_at, updated_at')
        .eq('parent_task_id', task.id)
        .order('created_at', { ascending: true })
      
      return {
        ...task,
        subtasks: subtaskError ? [] : (subtasks || [])
      }
    })
  )

  return { data: tasksWithSubtasks, error: null }
}

export const createTask = async (
  text: string, 
  priority: 'high' | 'medium' | 'low', 
  status: 'pending' | 'in-progress' | 'completed',
  parentTaskId?: string
): Promise<{ data: Task | null; error: any }> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  // First create the task
  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .insert([
      {
        user_id: user.id,
        text,
        priority,
        status,
        parent_task_id: parentTaskId || null,
        updated_at: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (taskError || !taskData) {
    return { data: null, error: taskError }
  }

  // Generate and store embedding for the task
  const embedding = await generateEmbedding(text);
  
  if (embedding) {
    const { error: embeddingError } = await supabase
      .from('tasks')
      .update({ embedding })
      .eq('id', taskData.id)
    
    if (embeddingError) {
      console.error('Failed to store embedding:', embeddingError)
      // Don't fail the task creation if embedding fails
    }
  }

  return { data: taskData, error: null }
}

export const updateTaskStatus = async (
  id: string, 
  status: 'pending' | 'in-progress' | 'completed'
): Promise<{ data: Task | null; error: any }> => {
  const { data, error } = await supabase
    .from('tasks')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export const updateTaskPriority = async (
  id: string, 
  priority: 'high' | 'medium' | 'low'
): Promise<{ data: Task | null; error: any }> => {
  const { data, error } = await supabase
    .from('tasks')
    .update({ 
      priority,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export const deleteTask = async (id: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
  
  return { error }
}