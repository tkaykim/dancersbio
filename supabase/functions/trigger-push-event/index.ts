// 이벤트 타입별 수신자 결정 후 send-push 호출
// 시크릿: APP_URL (선택, 딥링크 기본 경로용)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const APP_URL = Deno.env.get("APP_URL") ?? "";

type EventType =
  | "proposal_created"
  | "proposal_accepted"
  | "proposal_declined"
  | "negotiation_message"
  | "project_status_changed";

interface TriggerPayload {
  event_type: EventType;
  payload: {
    proposal_id?: string;
    project_id?: string;
    /** 협상 메시지일 때 누가 보냈는지: 'sender' | 'dancer' */
    from_side?: "sender" | "dancer";
  };
}

interface NotificationItem {
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

async function callSendPush(item: NotificationItem): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      user_id: item.user_id,
      title: item.title,
      body: item.body,
      data: item.data,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok) return { ok: true };
  return { ok: false, error: (data as { error?: string }).error ?? res.statusText };
}

function link(path: string): string {
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

  let body: TriggerPayload;
  try {
    body = (await req.json()) as TriggerPayload;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { event_type, payload } = body;
  if (!event_type || !payload) {
    return new Response(JSON.stringify({ error: "event_type and payload required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const notifications: NotificationItem[] = [];

  try {
    if (event_type === "proposal_created" && payload.proposal_id) {
      const { data: proposal, error: pe } = await supabase
        .from("proposals")
        .select("id, project_id, dancers(id, owner_id), projects(title)")
        .eq("id", payload.proposal_id)
        .single();
      if (pe || !proposal) {
        return new Response(JSON.stringify({ error: "Proposal not found", sent: 0 }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const ownerId = (proposal as any).dancers?.owner_id;
      if (ownerId) {
        const title = "새 제안이 도착했습니다";
        const body = `${(proposal as any).projects?.title ?? "프로젝트"}에 대한 제안이 있습니다.`;
        notifications.push({
          user_id: ownerId,
          title,
          body,
          data: { link: link("/my/proposals?tab=inbox") },
        });
      }
    } else if (
      (event_type === "proposal_accepted" || event_type === "proposal_declined") &&
      payload.proposal_id
    ) {
      const { data: proposal, error: pe } = await supabase
        .from("proposals")
        .select("id, sender_id, projects(title)")
        .eq("id", payload.proposal_id)
        .single();
      if (pe || !proposal) {
        return new Response(JSON.stringify({ error: "Proposal not found", sent: 0 }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const senderId = (proposal as any).sender_id;
      const projectTitle = (proposal as any).projects?.title ?? "프로젝트";
      if (senderId) {
        const isAccept = event_type === "proposal_accepted";
        notifications.push({
          user_id: senderId,
          title: isAccept ? "제안이 수락되었습니다" : "제안이 거절되었습니다",
          body: isAccept
            ? `${projectTitle} 제안이 수락되었습니다.`
            : `${projectTitle} 제안이 거절되었습니다.`,
          data: { link: link("/my/proposals?tab=outbox") },
        });
      }
    } else if (event_type === "negotiation_message" && payload.proposal_id) {
      const fromSide = payload.from_side;
      const { data: proposal, error: pe } = await supabase
        .from("proposals")
        .select("id, sender_id, dancer_id, dancers(owner_id), projects(title)")
        .eq("id", payload.proposal_id)
        .single();
      if (pe || !proposal) {
        return new Response(JSON.stringify({ error: "Proposal not found", sent: 0 }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const p = proposal as any;
      const recipientId =
        fromSide === "sender" ? p.dancers?.owner_id : fromSide === "dancer" ? p.sender_id : null;
      if (recipientId) {
        notifications.push({
          user_id: recipientId,
          title: "협상 메시지가 도착했습니다",
          body: `${p.projects?.title ?? "프로젝트"} 제안에서 새 메시지가 있습니다.`,
          data: { link: link("/my/proposals?tab=inbox") },
        });
      }
    } else if (event_type === "project_status_changed" && payload.project_id) {
      const { data: project, error: projErr } = await supabase
        .from("projects")
        .select(
          "id, owner_id, pm_dancer_id, client_profile_id, title, confirmation_status, progress_status, dancers(owner_id), clients(owner_id)"
        )
        .eq("id", payload.project_id)
        .single();
      if (projErr || !project) {
        return new Response(JSON.stringify({ error: "Project not found", sent: 0 }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const p = project as any;
      const userIds = new Set<string>();
      if (p.owner_id) userIds.add(p.owner_id);
      if (p.pm_dancer_id && p.dancers?.owner_id) userIds.add(p.dancers.owner_id);
      if (p.client_profile_id && p.clients?.owner_id) userIds.add(p.clients.owner_id);

      const statusLabel =
        p.confirmation_status === "confirmed"
          ? "진행 확정"
          : p.confirmation_status === "declined"
            ? "거절"
            : p.confirmation_status === "cancelled"
              ? "취소"
              : p.confirmation_status === "completed"
                ? "완료"
                : p.progress_status === "in_progress"
                  ? "진행 중"
                  : p.progress_status === "completed"
                    ? "완료"
                    : "상태 변경";
      const title = "프로젝트 상태가 변경되었습니다";
      const body = `${p.title ?? "프로젝트"}: ${statusLabel}`;
      const dataLink = { link: link(`/my/projects/${p.id}`) };
      for (const uid of userIds) {
        notifications.push({ user_id: uid, title, body, data: dataLink });
      }
    } else {
      return new Response(JSON.stringify({ error: "Unknown or incomplete payload", sent: 0 }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    for (const item of notifications) {
      const result = await callSendPush(item);
      if (result.ok) sent += 1;
    }
    return new Response(
      JSON.stringify({ sent, total: notifications.length, event_type }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e), sent: 0 }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
