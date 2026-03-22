import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_BASE = "http://13.212.249.5:8000";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const full = url.searchParams.get("full") === "true";

    const apiUrl = `${API_BASE}/v1/media-seed/latest${full ? "?full=true" : ""}`;
    
    let response: Response;
    try {
      response = await fetch(apiUrl, {
        method: "GET",
        headers: { "Accept": "application/json" },
      });
    } catch (fetchErr) {
      // External API unreachable — return empty routes so client resets
      console.error("External API unreachable:", fetchErr);
      return new Response(
        JSON.stringify({ routes: [], crawled_at: null, source_url: null, export: null, _warning: "External API unreachable" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("External API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ routes: [], crawled_at: null, source_url: null, export: null, _warning: `External API error: ${response.status}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("media-seed-latest error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
