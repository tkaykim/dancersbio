import type { SupabaseClient } from '@supabase/supabase-js'

const CATEGORY_ROLE_MAP: Record<string, string> = {
    choreo: '안무가',
    broadcast: '출연',
    performance: '공연',
    workshop: '워크샵 강사',
    judge: '심사위원',
}

export interface ProjectForCareer {
    id: string
    title: string
    category: string | null
    start_date: string | null
    description: string | null
}

/**
 * 제안 수락 시 PM이 된 댄서에게 경력 1건을 생성한다.
 * details.project_id가 있으므로 공개 프로필에서는 엠바고 해제/공개 시점에만 노출된다.
 * 이미 해당 프로젝트로 경력이 있으면 건너뛴다.
 */
export async function ensurePmCareer(
    supabase: SupabaseClient,
    project: ProjectForCareer,
    dancerId: string
): Promise<void> {
    const { data: existing } = await supabase
        .from('careers')
        .select('id')
        .eq('dancer_id', dancerId)
        .contains('details', { project_id: project.id })
        .limit(1)
        .maybeSingle()

    if (existing) return

    const careerDate = project.start_date || new Date().toISOString().split('T')[0]
    const year = careerDate.substring(0, 4)
    const month = careerDate.substring(5, 7) || ''
    const careerType = project.category || 'other'
    const pmRoleLabel = CATEGORY_ROLE_MAP[project.category || ''] || 'PM'

    await supabase.from('careers').insert({
        dancer_id: dancerId,
        type: careerType,
        title: project.title,
        date: careerDate,
        details: {
            year,
            month,
            role: `${pmRoleLabel} (PM)`,
            description: project.description || '',
            project_id: project.id,
        },
    })
}
