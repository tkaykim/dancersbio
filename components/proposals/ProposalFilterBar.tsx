'use client'

import { Search, X } from 'lucide-react'
import { getProjectStatuses } from '@/lib/utils'
import type { Proposal } from '@/lib/types'

/**
 * 제안의 "통합 상태"를 계산:
 * - 조율중: proposal이 pending/negotiating
 * - 진행확정: proposal이 accepted이고, 프로젝트가 cancelled/completed가 아님
 * - 거절됨: proposal이 declined
 * - 취소됨: 프로젝트가 cancelled
 * - 완료: 프로젝트가 completed
 */
export function getProposalDisplayStatus(proposal: Proposal): string {
    const { confirmation } = getProjectStatuses(proposal.projects)

    if (confirmation === 'cancelled') return 'cancelled'
    if (confirmation === 'completed') return 'completed'
    if (proposal.status === 'declined') return 'declined'
    if (proposal.status === 'accepted') return 'confirmed'
    return 'negotiating' // pending, negotiating
}

const STATUS_OPTIONS = [
    { value: null, label: '전체' },
    { value: 'negotiating', label: '조율 중' },
    { value: 'confirmed', label: '진행 확정' },
    { value: 'declined', label: '거절됨' },
    { value: 'cancelled', label: '취소됨' },
    { value: 'completed', label: '완료' },
] as const

const CATEGORY_OPTIONS = [
    { value: 'choreo', label: '안무' },
    { value: 'broadcast', label: '방송' },
    { value: 'performance', label: '공연' },
    { value: 'workshop', label: '워크샵' },
    { value: 'judge', label: '심사' },
]

interface ProposalFilterBarProps {
    proposals: Proposal[]
    searchQuery: string
    onSearchChange: (q: string) => void
    statusFilter: string | null
    onStatusChange: (s: string | null) => void
    categoryFilter: string | null
    onCategoryChange: (c: string | null) => void
}

export default function ProposalFilterBar({
    proposals,
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange,
    categoryFilter,
    onCategoryChange,
}: ProposalFilterBarProps) {
    const statusCounts: Record<string, number> = {
        negotiating: 0, confirmed: 0, declined: 0, cancelled: 0, completed: 0,
    }
    proposals.forEach(p => {
        const ds = getProposalDisplayStatus(p)
        statusCounts[ds] = (statusCounts[ds] || 0) + 1
    })

    return (
        <div className="px-4 pt-3 pb-1 space-y-2.5">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="프로젝트명, 이름, 회사 검색..."
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg pl-9 pr-8 py-2.5 focus:outline-none focus:border-primary placeholder-white/30"
                />
                {searchQuery && (
                    <button onClick={() => onSearchChange('')} className="absolute right-2.5 top-2.5 text-white/30 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Status Chips */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {STATUS_OPTIONS.map((opt) => {
                    const isActive = statusFilter === opt.value
                    const count = opt.value ? statusCounts[opt.value] || 0 : proposals.length
                    return (
                        <button
                            key={opt.value ?? 'all'}
                            onClick={() => onStatusChange(isActive && opt.value !== null ? null : opt.value)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${isActive
                                ? 'bg-primary text-black'
                                : 'bg-neutral-800 text-white/60 hover:text-white'
                                }`}
                        >
                            {opt.label}{count > 0 ? ` ${count}` : ''}
                        </button>
                    )
                })}
            </div>

            {/* Category Chips */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {CATEGORY_OPTIONS.map((opt) => {
                    const isActive = categoryFilter === opt.value
                    return (
                        <button
                            key={opt.value}
                            onClick={() => onCategoryChange(isActive ? null : opt.value)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-neutral-800/50 text-white/40 hover:text-white/70'
                                }`}
                        >
                            {opt.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
