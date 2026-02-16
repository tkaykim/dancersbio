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

