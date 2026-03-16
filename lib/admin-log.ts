import { supabase } from '@/lib/supabase'

export type AdminLogAction = 'create' | 'update' | 'delete'
export type AdminLogTargetType = 'profile' | 'career'

export interface AdminLogParams {
  action: AdminLogAction
  target_type: AdminLogTargetType
  target_id: string
  target_label?: string | null
  details?: Record<string, unknown> | null
}

/** 관리자 로그 기록 (프로필/커리어 등록·수정·삭제). 실패해도 UI는 차단하지 않음. */
export async function logAdminAction(params: AdminLogParams): Promise<void> {
  try {
    await supabase.from('admin_logs').insert({
      action: params.action,
      target_type: params.target_type,
      target_id: params.target_id,
      target_label: params.target_label ?? null,
      details: params.details ?? null,
    })
  } catch {
    // 로그 실패는 무시 (관리자 작업 자체는 유지)
  }
}
