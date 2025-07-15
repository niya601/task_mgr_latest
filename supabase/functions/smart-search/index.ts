const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface SearchRequest {
  query: string;
  userId: string;
}

interface TaskResult {
  id: string;
  text: string;
  priority: string;
  status: string;
  created_at: string;
  similarity: number;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { query, userId }: SearchRequest = await req.json();

    if (!query || typeof query !== 'string' || !userId) {
      return new Response(
        JSON.stringify({ error: "Query and userId are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate embedding for the search query using Supabase AI
    const model = new Supabase.ai.Session('gte-small');
    const queryEmbedding = await model.run(query, { mean_pool: true, normalize: true });

    if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
      return new Response(
        JSON.stringify({ error: "Failed to generate query embedding" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase configuration missing" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, let's check if we have embeddings for tasks, if not we'll do text similarity
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, text, priority, status, created_at, user_id')
      .eq('user_id', userId)
      .is('parent_task_id', null) // Only search parent tasks
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch tasks" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ results: [] }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate embeddings for all tasks and calculate similarity
    const taskResults: TaskResult[] = [];

    for (const task of tasks) {
      try {
        // Generate embedding for task text
        const taskEmbedding = await model.run(task.text, { mean_pool: true, normalize: true });
        
        if (taskEmbedding && Array.isArray(taskEmbedding)) {
          // Calculate cosine similarity
          const similarity = calculateCosineSimilarity(queryEmbedding, taskEmbedding);
          
          taskResults.push({
            id: task.id,
            text: task.text,
            priority: task.priority,
            status: task.status,
            created_at: task.created_at,
            similarity: similarity
          });
        }
      } catch (error) {
        console.error(`Error processing task ${task.id}:`, error);
        // Continue with other tasks
      }
    }

    // Sort by similarity (highest first) and take top 5
    const topResults = taskResults
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .filter(result => result.similarity > 0.1); // Filter out very low similarity results

    return new Response(
      JSON.stringify({ results: topResults }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in smart-search function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Helper function to calculate cosine similarity between two vectors
function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}