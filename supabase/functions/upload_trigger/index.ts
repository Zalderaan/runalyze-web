// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/supabase/supabase-js@2";

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  const payload = await req.json();
  const filePath = payload.record.name;
  const bucket = payload.record.bucket_id;

  // Get the public/download URL from supabase storage
  const supabase = createClient(Deno.env.get(NEXT_PUBLIC_SUPABASE_URL), Deno.env.get(NEXT_PUBLIC_SUPABASE_ANON_KEY));
  const { data: { publicUrl }} = supabase.storage.from(bucket).getPublicUrl(filePath);
  
  // TODO: Call your external python script
  const pythonUrl = "http://localhost:54321/functions/v1/upload_trigger"
  const response = await fetch(pythonUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video_url: publicUrl }),
  });

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/upload_trigger' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

/**
 * TODO: trigger when a video is uploaded to supabase storage, in videos/user-uploads
 *  
 */
