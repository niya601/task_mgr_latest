import { supabase } from './supabase'

export interface GenerateSubtasksResponse {
  subtasks: string[];
}

export const generateSubtasks = async (taskTitle: string): Promise<{ data: string[] | null; error: any }> => {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-subtasks`;
    
    const headers = {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ taskTitle }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: errorData };
    }

    const result: GenerateSubtasksResponse = await response.json();
    return { data: result.subtasks, error: null };
  } catch (error) {
    console.error('Error calling generate-subtasks function:', error);
    return { data: null, error: { message: 'Failed to generate subtasks' } };
  }
};