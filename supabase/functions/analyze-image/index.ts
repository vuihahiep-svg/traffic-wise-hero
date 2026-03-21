import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { type, imageBase64, textReport, roadNames, nodeNames, audioBase64, mimeType } = await req.json();

    let systemPrompt = "";
    let userContent: any[] = [];
    let toolSchema: any;

    if (type === "flood_detection") {
      systemPrompt = `You are an AI agent analyzing images for flood and water damage in Ho Chi Minh City, Vietnam.
Analyze the image and determine:
1. Is there flooding visible? (true/false)
2. Flood severity score (1-100, where 1 is minimal and 100 is catastrophic)
3. Which areas/intersections from this list might be affected: ${nodeNames?.join(", ")}
4. Brief description of what you see

Respond ONLY with valid JSON, no markdown.`;

      userContent = [
        { type: "text", text: "Analyze this image for flooding:" },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
      ];

      toolSchema = {
        type: "object",
        properties: {
          flooded: { type: "boolean" },
          floodScore: { type: "number", minimum: 1, maximum: 100 },
          affectedNodes: { type: "array", items: { type: "string" } },
          description: { type: "string" },
        },
        required: ["flooded", "floodScore", "affectedNodes", "description"],
      };
    } else if (type === "traffic_detection") {
      systemPrompt = `You are an AI agent analyzing images for traffic conditions in Ho Chi Minh City, Vietnam.
Analyze the image and determine:
1. Is there traffic congestion visible? (true/false)  
2. Congestion severity score (1-100, where 1 is free-flowing and 100 is completely blocked)
3. Which roads from this list might be shown or affected: ${roadNames?.join(", ")}
4. Brief description of traffic conditions

Respond ONLY with valid JSON, no markdown.`;

      userContent = [
        { type: "text", text: "Analyze this image for traffic conditions:" },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
      ];

      toolSchema = {
        type: "object",
        properties: {
          congested: { type: "boolean" },
          congestionScore: { type: "number", minimum: 1, maximum: 100 },
          affectedRoads: { type: "array", items: { type: "string" } },
          description: { type: "string" },
        },
        required: ["congested", "congestionScore", "affectedRoads", "description"],
      };
    } else if (type === "traffic_report") {
      systemPrompt = `You are an AI agent analyzing traffic reports for Ho Chi Minh City, Vietnam.
Given the text report, determine:
1. Which roads from this list are mentioned: ${roadNames?.join(", ")}
2. For each mentioned road, what is the condition? Use these values:
   - "congested" = heavy traffic, jammed, blocked
   - "clear" = free-flowing, smooth, thông thoáng, thông, hết kẹt, hết tắc
   - "accident" = accident reported
   - "construction" = road work
3. Severity score for each road (1-100):
   - For "clear" condition: score should be LOW (1-15) meaning the road is good now
   - For "congested": score should be HIGH (60-100) based on severity
   - For "accident": score 80-100
   - For "construction": score 50-80
4. Brief summary

IMPORTANT: If the report says a road is clear, smooth, or traffic is flowing well, the condition MUST be "clear" and severity MUST be low (1-15).

The report may be in Vietnamese or English. Match road names flexibly (partial matches ok).

Respond ONLY with valid JSON, no markdown.`;

      userContent = [
        { type: "text", text: `Traffic report: "${textReport}"` },
      ];

      toolSchema = {
        type: "object",
        properties: {
          roads: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                condition: { type: "string", enum: ["congested", "clear", "accident", "construction"] },
                severity: { type: "number", minimum: 1, maximum: 100 },
              },
              required: ["name", "condition", "severity"],
            },
          },
          summary: { type: "string" },
        },
        required: ["roads", "summary"],
      };
    } else if (type === "correct_speech_text") {
      systemPrompt = `You are a text correction assistant for Vietnamese and English traffic reports.
You receive raw speech-to-text output that may contain errors, wrong words, or garbled text.
Your job:
1. Fix spelling and grammar errors
2. Correct Vietnamese diacritics if missing or wrong
3. Make the text a clear, coherent traffic report
4. Keep the meaning intact — do NOT add information that wasn't there
5. If road names are mentioned but misspelled, correct them using this list: ${roadNames?.join(", ")}

Return ONLY the corrected text, nothing else.`;

      userContent = [
        { type: "text", text: `Correct this speech-to-text output: "${textReport}"` },
      ];

      // For text correction, we don't use tool calling — just return text
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const correctedText = data.choices?.[0]?.message?.content || textReport;

      return new Response(JSON.stringify({ type, result: { correctedText } }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_result",
              description: "Return the analysis result",
              parameters: toolSchema,
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_result" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let result;

    if (toolCall?.function?.arguments) {
      result = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } else {
      const content = data.choices?.[0]?.message?.content || "";
      try {
        result = JSON.parse(content);
      } catch {
        result = { error: "Could not parse AI response", raw: content };
      }
    }

    return new Response(JSON.stringify({ type, result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-image error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
