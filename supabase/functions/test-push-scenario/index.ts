// 시나리오별 테스트 푸시 발송 (관리자용)
// body: { scenario: string, user_id?: string } — user_id 없으면 Authorization JWT의 sub 사용
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const APP_URL = Deno.env.get("APP_URL") ?? "";

const SCENARIOS: Record<
  string,
  { title: string; body: string; link: string }
> = {
  proposal_created: {
    title: "새 제안이 도착했습니다",
    body: "[테스트] 프로젝트에 대한 제안이 있습니다.",
    link: "/my/proposals?tab=inbox",
  },
  proposal_accepted: {
    title: "제안이 수락되었습니다",
    body: "[테스트] 프로젝트 제안이 수락되었습니다.",
    link: "/my/proposals?tab=outbox",
  },
  proposal_declined: {
    title: "제안이 거절되었습니다",
    body: "[테스트] 프로젝트 제안이 거절되었습니다.",
    link: "/my/proposals?tab=outbox",
  },
  negotiation_message: {
    title: "협상 메시지가 도착했습니다",
    body: "[테스트] 제안에서 새 메시지가 있습니다.",
    link: "/my/proposals?tab=inbox",
  },
  project_status_changed: {
    title: "프로젝트 상태가 변경되었습니다",
    body: "[테스트] 프로젝트: 진행 확정",
    link: "/my/projects",
  },
};

function fullLink(path: string): string {
  if (APP_URL) return `${APP_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  return path;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { scenario?: string; user_id?: string };
  try {
    body = (await req.json()) as { scenario?: string; user_id?: string };
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const scenario = body.scenario ?? "";
  const scenarioConfig = SCENARIOS[scenario];
  if (!scenarioConfig) {
    return new Response(
      JSON.stringify({
        error: "Unknown scenario",
        allowed: Object.keys(SCENARIOS),
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let userId = body.user_id;
  if (!userId) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      try {
        const parts = token.split(".");
        if (parts.length >= 2) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
          userId = payload.sub ?? undefined;
        }
      } catch {
        // ignore
      }
    }
  }
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "user_id required or provide Authorization Bearer token" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      user_id: userId,
      title: scenarioConfig.title,
      body: scenarioConfig.body,
      data: { link: fullLink(scenarioConfig.link) },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok) {
    return new Response(
      JSON.stringify({
        ok: true,
        scenario,
        sent: (data as { sent?: number }).sent ?? 0,
        total: (data as { total?: number }).total ?? 0,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  return new Response(
    JSON.stringify({
      ok: false,
      error: (data as { error?: string }).error ?? res.statusText,
    }),
    { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
