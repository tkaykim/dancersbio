export const ACTIVE_PROPOSAL_STATUSES = ['accepted', 'pending', 'negotiating'] as const

export type ActiveProposalStatus = typeof ACTIVE_PROPOSAL_STATUSES[number]

export interface SettlementProposalLike {
    dancer_id: string
    status: string
    fee: number | null
}

export function isActiveProposalStatus(status: string): status is ActiveProposalStatus {
    return ACTIVE_PROPOSAL_STATUSES.includes(status as ActiveProposalStatus)
}

export function isIncomeForProfile(
    proposal: Pick<SettlementProposalLike, 'dancer_id' | 'status'>,
    profileId: string
): boolean {
    return proposal.dancer_id === profileId && isActiveProposalStatus(proposal.status)
}

export function isExpenseForProfileInProject(
    proposal: Pick<SettlementProposalLike, 'dancer_id' | 'status'>,
    profileId: string,
    projectPmDancerId: string | null | undefined
): boolean {
    if (!projectPmDancerId || projectPmDancerId !== profileId) return false
    return proposal.dancer_id !== profileId && isActiveProposalStatus(proposal.status)
}

export function toSettlementItemStatus(status: string): 'pending' | 'completed' {
    return status === 'accepted' ? 'completed' : 'pending'
}

/* ─── 정산 status (proposal_settlements 테이블) ─────────────────────────────── */

export type SettlementStatus =
    | 'scheduled'
    | 'in_progress'
    | 'paid'
    | 'on_hold'
    | 'cancelled'

export const SETTLEMENT_STATUS_LABELS: Record<SettlementStatus, string> = {
    scheduled: '정산 예정',
    in_progress: '처리 중',
    paid: '지급 완료',
    on_hold: '보류',
    cancelled: '취소',
}

export const SETTLEMENT_STATUS_COLORS: Record<SettlementStatus, string> = {
    scheduled: 'text-yellow-400 bg-yellow-400/10',
    in_progress: 'text-blue-400 bg-blue-400/10',
    paid: 'text-green-500 bg-green-500/10',
    on_hold: 'text-orange-400 bg-orange-400/10',
    cancelled: 'text-white/40 bg-white/5',
}

/** 한 항목의 정산 진행 정도. UI 합산용 단순화 */
export function summarizeSettlementStatus(s: SettlementStatus): 'pending' | 'completed' {
    return s === 'paid' ? 'completed' : 'pending'
}

export interface ProposalSettlementRow {
    id: string
    proposal_id: string
    amount: number
    status: SettlementStatus
    scheduled_due_date: string | null
    paid_at: string | null
    paid_by: string | null
    reference_no: string | null
    payer_note: string | null
    payee_note: string | null
    created_at: string
    updated_at: string
}

