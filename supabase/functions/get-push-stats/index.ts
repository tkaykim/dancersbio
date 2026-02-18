import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Authorization required" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { data: tokens, error: tokensError } = await supabase
    .from("push_tokens")
    .select("user_id, platform, updated_at")
    .order("updated_at", { ascending: false });

  if (tokensError) {
    return new Response(
      JSON.stringify({ error: tokensError.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const userIds = [...new Set((tokens ?? []).map((r: any) => r.user_id))];
  let userMap: Record<string, { email: string | null; name: string | null }> = {};
  if (userIds.length > 0) {
    const { data: users } = await supabase.from("users").select("id, email, name").in("id", userIds);
    userMap = (users ?? []).reduce((acc: any, u: any) => {
      acc[u.id] = { email: u.email ?? null, name: u.name ?? null };
      return acc;
    }, {});
  }

  const list = (tokens ?? []).map((r: any) => ({
    user_id: r.user_id,
    email: userMap[r.user_id]?.email ?? null,
    name: userMap[r.user_id]?.name ?? null,
    platform: r.platform,
    updated_at: r.updated_at,
  }));

  const memberCount = userIds.length;

  return new Response(
    JSON.stringify({ memberCount, totalTokens: list.length, tokens: list }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
