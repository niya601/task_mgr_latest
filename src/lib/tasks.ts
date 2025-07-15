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
  subtasks?: Task[];
}

export const getTasks = async (): Promise<{ data: Task[] | null; error: any }> => {
  // First get all main tasks (no parent)
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
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
        .select('*')
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

  const { data, error } = await supabase
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
  
  return { data, error }
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