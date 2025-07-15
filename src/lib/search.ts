import { supabase } from './supabase'

export interface SearchResult {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  created_at: string;
  similarity: number;
}

export interface SmartSearchResponse {
  results: SearchResult[];
}

export const smartSearch = async (query: string): Promise<{ data: SearchResult[] | null; error: any }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/smart-search`;
    
    const headers = {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        query: query.trim(),
        userId: user.id 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: errorData };
    }

    const result: SmartSearchResponse = await response.json();
    return { data: result.results, error: null };
  } catch (error) {
    console.error('Error calling smart-search function:', error);
    return { data: null, error: { message: 'Failed to perform smart search' } };
  }
};