import { supabase } from './supabase'

export interface Task {
  id: string;
  user_id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export const getTasks = async (): Promise<{ data: Task[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const createTask = async (
  title: string, 
  priority: 'high' | 'medium' | 'low', 
  status: 'pending' | 'in-progress' | 'completed'
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
        title,
        priority,
        status,
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