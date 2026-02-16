import type { SupabaseClient } from '@supabase/supabase-js'

const ACTIVE_PROPOSAL_STATUSES = ['accepted', 'pending', 'negotiating']

/**
 * 제안이 거절/취소된 뒤 호출.
 * 해당 프로젝트에 활성 제안(수락·대기·협상중)이 하나도 없으면
 * 프로젝트를 declined / cancelled 로 맞춘다.
 */
export async function syncProjectStatusIfNoActiveProposals(
    supabase: SupabaseClient,
    projectId: string,
    proposalStatus: 'declined' | 'cancelled'
): Promise<void> {
    const { count } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .in('status', ACTIVE_PROPOSAL_STATUSES)

    if ((count ?? 0) > 0) return

    await supabase
        .from('projects')
        .update({
            confirmation_status: proposalStatus === 'cancelled' ? 'cancelled' : 'declined',
            progress_status: 'cancelled',
        })
        .eq('id', projectId)
}
