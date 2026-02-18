// FCM 푸시 알림 전송 Edge Function
// 시크릿: FIREBASE_SERVICE_ACCOUNT_JSON (서비스 계정 JSON 전체 문자열)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: sa.client_email,
    sub: sa.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  };
  const header = { alg: "RS256", typ: "JWT" };
  const b64 = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const message = `${b64(header)}.${b64(payload)}`;
  const pem = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binary = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    binary,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(message)
  );
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const jwt = `${message}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OAuth2 token failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function sendFCM(
  accessToken: string,
  projectId: string,
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  const dataMap = data
    ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
    : undefined;
  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          notification: { title, body },
          ...(dataMap && Object.keys(dataMap).length > 0 ? { data: dataMap } : {}),
        },
      }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FCM send failed: ${res.status} ${text}`);
  }
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

  const jsonRaw = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
  if (!jsonRaw || jsonRaw.trim() === "") {
    return new Response(
      JSON.stringify({ error: "FIREBASE_SERVICE_ACCOUNT_JSON secret not set" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let sa: ServiceAccount;
  try {
    let parsed: unknown;
    const trimmed = jsonRaw.trim();
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      try {
        parsed = JSON.parse(atob(trimmed));
      } catch {
        return new Response(
          JSON.stringify({
            error: "Invalid FIREBASE_SERVICE_ACCOUNT_JSON: not valid JSON. Paste the full Firebase service account JSON (or base64 of it) in Supabase Dashboard → Project Settings → Edge Functions → Secrets.",
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    sa = parsed as ServiceAccount;
    if (!sa.project_id || !sa.private_key || !sa.client_email) {
      return new Response(
        JSON.stringify({
          error: "Invalid FIREBASE_SERVICE_ACCOUNT_JSON: missing project_id, private_key, or client_email. Use the full JSON from Firebase Console → Project Settings → Service accounts → Generate new private key.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Invalid FIREBASE_SERVICE_ACCOUNT_JSON: " + String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let body: { user_id?: string; token?: string; title: string; body: string; data?: Record<string, string> };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { user_id, token: singleToken, title: title_ = "", body: body_ = "", data: data_ } = body;
  if (!title_ && !body_) {
    return new Response(
      JSON.stringify({ error: "title or body required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  if (!user_id && !singleToken) {
    // 전체 발송: user_id 없이 호출 시 모든 등록 토큰으로 발송
  }

  let tokens: string[] = [];
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  if (singleToken) {
    tokens = [singleToken];
  } else {
    const query = supabase.from("push_tokens").select("token");
    const q = user_id ? query.eq("user_id", user_id) : query;
    const { data: rows, error } = await q;
    if (error) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch push_tokens: " + error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    tokens = (rows ?? []).map((r: { token: string }) => r.token);
    if (tokens.length === 0) {
      return new Response(
        JSON.stringify({ error: user_id ? "No FCM tokens for user" : "No FCM tokens registered", sent: 0, total: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  const accessToken = await getAccessToken(sa);
  const results: { token: string; ok: boolean; error?: string }[] = [];

  for (const t of tokens) {
    try {
      await sendFCM(accessToken, sa.project_id, t, title_ || "(알림)", body_, data_);
      results.push({ token: t.slice(0, 20) + "...", ok: true });
    } catch (e) {
      results.push({ token: t.slice(0, 20) + "...", ok: false, error: String(e) });
    }
  }

  const sent = results.filter((r) => r.ok).length;
  return new Response(
    JSON.stringify({ sent, total: tokens.length, results }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
