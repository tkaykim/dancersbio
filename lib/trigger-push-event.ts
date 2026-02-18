/**
 * 이벤트 발생 시 푸시 알림 트리거 (Edge Function 호출)
 * 제안 생성/수락·거절·협상 메시지, 프로젝트 상태 변경 시 사용.
 */
import { supabase } from '@/lib/supabase'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export type PushEventType =
  | 'proposal_created'
  | 'proposal_accepted'
  | 'proposal_declined'
  | 'negotiation_message'
  | 'project_status_changed'

export interface TriggerPushPayload {
  proposal_id?: string
  project_id?: string
  /** 협상 메시지일 때 누가 보냈는지 */
  from_side?: 'sender' | 'dancer'
}

/**
 * 푸시 이벤트 트리거. 실패해도 알림만 누락될 뿐이므로 에러 시 로그만 하고 무시해도 됨.
 */
export async function triggerPushEvent(
  event_type: PushEventType,
  payload: TriggerPushPayload
): Promise<{ sent?: number; error?: string }> {
  if (!SUPABASE_URL) return { error: 'SUPABASE_URL not set' }
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token ?? SUPABASE_ANON_KEY
    const res = await fetch(`${SUPABASE_URL}/functions/v1/trigger-push-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ event_type, payload }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok) return { sent: (data as { sent?: number }).sent }
    return { error: (data as { error?: string }).error ?? res.statusText }
  } catch (e) {
    console.warn('[triggerPushEvent]', event_type, e)
    return { error: e instanceof Error ? e.message : String(e) }
  }
}
