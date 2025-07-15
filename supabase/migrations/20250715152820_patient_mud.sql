/*
  # Add Vector Search Function

  1. Database Function
    - Create search_tasks_by_similarity function for efficient vector search
    - Uses cosine similarity with stored embeddings
    - Returns top matching tasks with similarity scores

  2. Performance
    - Leverages vector index for fast similarity search
    - Filters by user and similarity threshold
    - Orders by similarity score
*/

-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION search_tasks_by_similarity(
  query_embedding vector(384),
  user_id uuid,
  similarity_threshold float DEFAULT 0.1,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  text text,
  priority text,
  status text,
  created_at timestamptz,
  similarity float
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    t.id,
    t.text,
    t.priority,
    t.status,
    t.created_at,
    1 - (t.embedding <=> query_embedding) as similarity
  FROM tasks t
  WHERE 
    t.user_id = search_tasks_by_similarity.user_id
    AND t.parent_task_id IS NULL
    AND t.embedding IS NOT NULL
    AND 1 - (t.embedding <=> query_embedding) > similarity_threshold
  ORDER BY t.embedding <=> query_embedding
  LIMIT match_count;
$$;