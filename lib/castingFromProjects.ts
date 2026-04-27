import type { CastingCategory, CastingMock, CastingPay } from './castingMockData'
import { isEmbargoActive } from './utils'

/** Supabase에서 캐스팅 노출용으로 가져온 프로젝트 행 */
export interface CastingProjectRow {
    id: string
    title: string
    category: string | null
    visibility: string | null
    progress_status: string | null
    embargo_date: string | null
    budget: number | null
    start_date: string | null
    end_date: string | null
    due_date: string | null
    created_at: string
    clients?: { company_name: string | null } | null
    owner?: { name: string | null } | null
    event_dates?: {
        event_date: string
        event_time: string | null
        label: string | null
        sort_order: number
    }[] | null
}

const CATEGORY_MAP: Record<string, CastingCategory> = {
    choreo: '안무제작',
    broadcast: '광고',
    performance: '댄서참여',
    workshop: '강사구인',
    judge: '오디션',
    other: '기타',
}

function toCategory(raw: string | null | undefined): CastingCategory {
    if (!raw) return '기타'
    return CATEGORY_MAP[raw] ?? '기타'
}

function toPay(budget: number | null): CastingPay {
    if (budget && budget > 0) return { type: 'fixed', fixed: budget }
    return { type: 'negotiable' }
}

function toScheduleLabel(row: CastingProjectRow): string {
    const events = (row.event_dates ?? []).slice().sort((a, b) => a.sort_order - b.sort_order)
    if (events.length > 0) {
        const first = events[0]
        const date = first.event_date.replace(/^\d{4}-/, '').replace('-', '/')
        if (events.length === 1) {
            return first.event_time ? `${date} ${first.event_time.slice(0, 5)}` : date
        }
        return `${date} 외 ${events.length - 1}회`
    }
    if (row.start_date) {
        const start = row.start_date.replace(/^\d{4}-/, '').replace('-', '/')
        if (row.end_date) {
            const end = row.end_date.replace(/^\d{4}-/, '').replace('-', '/')
            return `${start} ~ ${end}`
        }
        return start
    }
    return '일정 협의'
}

function toDeadlineLabel(row: CastingProjectRow): string | undefined {
    const target = row.due_date ?? row.embargo_date ?? null
    if (!target) return undefined
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueParts = target.split('-').map(Number)
    if (dueParts.length !== 3) return undefined
    const [y, m, d] = dueParts
    const due = new Date(y, m - 1, d)
    const diff = Math.round((due.getTime() - today.getTime()) / 86400000)
    if (diff < 0) return '마감 임박'
    if (diff === 0) return 'D-DAY'
    return `D-${diff}`
}

function toPosterLabel(row: CastingProjectRow): string {
    return (
        row.clients?.company_name ||
        row.owner?.name ||
        '클라이언트'
    )
}

/**
 * /casting 노출 가능 여부:
 * - visibility = 'public'
 * - progress_status = 'recruiting'
 * - 엠바고 활성 아님
 */
export function isCastableProject(row: CastingProjectRow): boolean {
    if (row.visibility !== 'public') return false
    if (row.progress_status !== 'recruiting') return false
    if (isEmbargoActive(row.embargo_date)) return false
    return true
}

export function projectToCastingMock(row: CastingProjectRow): CastingMock {
    return {
        id: `proj-${row.id}`,
        category: toCategory(row.category),
        offerModel: 'public',
        title: row.title,
        poster: toPosterLabel(row),
        posterRole: '클라이언트',
        deadlineLabel: toDeadlineLabel(row),
        schedule: toScheduleLabel(row),
        tags: [],
        pay: toPay(row.budget),
    }
}
