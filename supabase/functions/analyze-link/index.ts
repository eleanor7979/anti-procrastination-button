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
    const { url } = await req.json();
    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try to fetch the page content for context
    let pageContent = "";
    try {
      const pageResp = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ProjectAnalyzer/1.0)" },
        redirect: "follow",
      });
      if (pageResp.ok) {
        const html = await pageResp.text();
        // Extract title and meta description, plus some text content
        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
        const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/is);
        const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/is);
        const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/is);
        
        // Strip HTML tags and get text content (first 3000 chars)
        const textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 3000);

        pageContent = [
          titleMatch?.[1] ? `Page Title: ${titleMatch[1]}` : "",
          ogTitleMatch?.[1] ? `OG Title: ${ogTitleMatch[1]}` : "",
          metaDescMatch?.[1] ? `Meta Description: ${metaDescMatch[1]}` : "",
          ogDescMatch?.[1] ? `OG Description: ${ogDescMatch[1]}` : "",
          `Text Content: ${textContent}`,
        ].filter(Boolean).join("\n");
      }
    } catch (e) {
      console.log("Could not fetch page, will analyze URL only:", e);
    }

    const prompt = `Analyze this URL and any page content provided to identify what DIY/creative/coding project it refers to.

URL: ${url}
${pageContent ? `\nPage Content:\n${pageContent}` : ""}

If there are multiple projects mentioned, pick the single most interesting/doable one.

You MUST respond using the provided tool.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a project identification assistant. Given a URL and optional page content, identify the project being shown or described. If multiple projects exist, choose the most interesting one. Always use the provided tool to respond.",
          },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "identify_project",
              description: "Return the identified project details",
              parameters: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "A clear, concise project title (e.g. 'Macramé Plant Hanger', 'React Todo App')",
                  },
                  description: {
                    type: "string",
                    description: "A 1-2 sentence description of what the project is",
                  },
                  firstStep: {
                    type: "string",
                    description: "A specific, actionable first step to get started on this project (e.g. 'Buy 3mm macramé cord and a wooden ring from a craft store')",
                  },
                  category: {
                    type: "string",
                    enum: ["craft", "coding", "cooking", "home", "art", "fitness", "other"],
                    description: "The category of this project",
                  },
                },
                required: ["title", "description", "firstStep", "category"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "identify_project" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to analyze link" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(aiData));
      return new Response(
        JSON.stringify({ error: "AI could not identify a project from this link" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const project = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ success: true, project }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze-link error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
