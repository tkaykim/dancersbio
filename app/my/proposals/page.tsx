'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Inbox, Send, Plus, Filter, ChevronDown, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useBackWithFallback } from '@/lib/useBackWithFallback'
import { useMyProfiles } from '@/hooks/useMyProfiles'
import { useProposals } from '@/hooks/useProposals'
import ProposalCard from '@/components/proposals/ProposalCard'
import ProposalDetailModal from '@/components/proposals/ProposalDetailModal'
import ProposalFilterBar, { getProposalDisplayStatus } from '@/components/proposals/ProposalFilterBar'
import type { Proposal, ProposalTab } from '@/lib/types'

export default function ProposalsPageWrapper() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        }>
            <ProposalsPage />
        </Suspense>
    )
}

function ProposalsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const handleBack = useBackWithFallback('/my')

    const initialTab = (searchParams.get('tab') as ProposalTab) || 'inbox'
    const [activeTab, setActiveTab] = useState<ProposalTab>(initialTab)
    const [selectedProfileId, setSelectedProfileId] = useState<string>('all')
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)

    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string | null>(null)
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

    const { allProfiles, loading: profilesLoading } = useMyProfiles()
    const { proposals, loading, getUnreadCount, markAsRead, refetch } = useProposals(allProfiles, activeTab, selectedProfileId)

    const filteredProposals = useMemo(() => {
        let result = proposals

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            result = result.filter(p =>
                p.projects.title.toLowerCase().includes(q) ||
                (p.sender?.name?.toLowerCase().includes(q)) ||
                (p.projects.clients?.company_name?.toLowerCase().includes(q)) ||
                p.dancers.stage_name.toLowerCase().includes(q)
            )
        }

        if (statusFilter) {
            result = result.filter(p => getProposalDisplayStatus(p) === statusFilter)
        }

        if (categoryFilter) {
            result = result.filter(p => p.projects.category?.toLowerCase() === categoryFilter)
        }

        return result
    }, [proposals, searchQuery, statusFilter, categoryFilter])

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (selectedProposal && user) {
            markAsRead(selectedProposal)
        }
    }, [selectedProposal?.id])

    const handleSelectProposal = (proposal: Proposal) => {
        setSelectedProposal(proposal)
    }

    const handleTabChange = (tab: ProposalTab) => {
        setActiveTab(tab)
        setSelectedProfileId('all')
        setSearchQuery('')
        setStatusFilter(null)
        setCategoryFilter(null)
        router.replace(`/my/proposals?tab=${tab}`, { scroll: false })
    }

    if (authLoading || profilesLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white">로딩 중...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-20" style={{ background: 'var(--cue-bg)', color: 'var(--cue-ink)' }}>
            {/* Header */}
            <div
                className="sticky top-0 z-10 pt-header-safe"
                style={{
                    background: 'color-mix(in srgb, var(--cue-bg) 92%, transparent)',
                    backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)',
                    borderBottom: '1px solid var(--cue-hairline)',
                }}
            >
                <div className="px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={handleBack} className="p-1 -ml-1 touch-manipulation" aria-label="뒤로 가기" style={{ color: 'var(--cue-ink)' }}>
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <div
                                style={{
                                    fontSize: 10,
                                    letterSpacing: 1.4,
                                    textTransform: 'uppercase',
                                    color: 'var(--cue-ink-3)',
                                    fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                                }}
                            >
                                INBOX · 제안
                            </div>
                            <h1
                                style={{
                                    fontFamily: 'var(--font-cue-serif), serif',
                                    fontStyle: 'italic',
                                    fontSize: 22,
                                    letterSpacing: -0.4,
                                    color: 'var(--cue-ink)',
                                }}
                            >
                                Proposals<span style={{ color: 'var(--cue-accent)' }}>.</span>
                            </h1>
                        </div>
                    </div>
                    {activeTab === 'outbox' && (
                        <Link
                            href="/my/proposals/new"
                            className="p-2 rounded-full transition"
                            style={{
                                background: 'var(--cue-surface-2)',
                                color: 'var(--cue-accent)',
                                border: '1px solid var(--cue-hairline)',
                            }}
                        >
                            <Plus className="w-5 h-5" />
                        </Link>
                    )}
                </div>

                {activeTab === 'inbox' && allProfiles.length > 0 && (
                    <div className="px-6 pb-2">
                        <div className="relative">
                            <select
                                value={selectedProfileId}
                                onChange={(e) => setSelectedProfileId(e.target.value)}
                                className="w-full appearance-none text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none"
                                style={{
                                    background: 'var(--cue-surface)',
                                    border: '1px solid var(--cue-hairline)',
                                    color: 'var(--cue-ink)',
                                }}
                            >
                                <option value="all">모든 프로필 ({allProfiles.length})</option>
                                {allProfiles.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.stage_name} {p.role === 'manager' ? '(매니저 권한)' : ''}
                                    </option>
                                ))}
                            </select>
                            <Filter className="absolute left-3 top-2.5 w-4 h-4" style={{ color: 'var(--cue-ink-3)' }} />
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 pointer-events-none" style={{ color: 'var(--cue-ink-3)' }} />
                        </div>
                    </div>
                )}

                <div className="flex mt-2" style={{ borderTop: '1px solid var(--cue-hairline)' }}>
                    <button
                        onClick={() => handleTabChange('inbox')}
                        className="flex-1 py-3 text-sm font-medium transition-colors relative"
                        style={{ color: activeTab === 'inbox' ? 'var(--cue-accent)' : 'var(--cue-ink-3)' }}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Inbox className="w-4 h-4" />
                            받은 제안
                        </div>
                        {activeTab === 'inbox' && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--cue-accent)' }} />}
                    </button>
                    <button
                        onClick={() => handleTabChange('outbox')}
                        className="flex-1 py-3 text-sm font-medium transition-colors relative"
                        style={{ color: activeTab === 'outbox' ? 'var(--cue-accent)' : 'var(--cue-ink-3)' }}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Send className="w-4 h-4" />
                            보낸 제안
                        </div>
                        {activeTab === 'outbox' && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--cue-accent)' }} />}
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            {!loading && proposals.length > 0 && (
                <ProposalFilterBar
                    proposals={proposals}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    categoryFilter={categoryFilter}
                    onCategoryChange={setCategoryFilter}
                />
            )}

            {/* Proposal List */}
            <div className="p-4 space-y-3">
                {loading ? (
                    <div className="text-white/60 text-center py-12">로딩 중...</div>
                ) : filteredProposals.length === 0 ? (
                    <div className="text-center py-12">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                            style={{ background: 'var(--cue-surface)', border: '1px solid var(--cue-hairline)' }}
                        >
                            {activeTab === 'inbox' ? <Inbox className="w-8 h-8" style={{ color: 'var(--cue-ink-4)' }} /> : <Send className="w-8 h-8" style={{ color: 'var(--cue-ink-4)' }} />}
                        </div>
                        <p className="text-white/60">
                            {proposals.length > 0 && (searchQuery || statusFilter || categoryFilter)
                                ? '검색 조건에 맞는 제안이 없습니다.'
                                : activeTab === 'inbox'
                                    ? (allProfiles.length === 0
                                        ? '댄서 프로필이 없어 받은 제안을 확인할 수 없습니다.'
                                        : '받은 제안이 없습니다.')
                                    : '보낸 제안이 없습니다.'
                            }
                        </p>
                        {proposals.length > 0 && (searchQuery || statusFilter || categoryFilter) && (
                            <button
                                onClick={() => { setSearchQuery(''); setStatusFilter(null); setCategoryFilter(null) }}
                                className="mt-3 text-sm text-primary hover:underline"
                            >
                                필터 초기화
                            </button>
                        )}
                        {activeTab === 'inbox' && allProfiles.length === 0 && (
                            <p className="text-white/40 text-xs mt-2">
                                받은 제안은 댄서 프로필에 대해 수신됩니다.
                            </p>
                        )}
                        {activeTab === 'outbox' && proposals.length === 0 && (
                            <Link href="/my/proposals/new" className="inline-block mt-4 px-6 py-2 bg-primary text-black font-bold rounded-full text-sm">
                                댄서에게 제안 보내기
                            </Link>
                        )}
                    </div>
                ) : (
                    filteredProposals.map((proposal) => (
                        <ProposalCard
                            key={proposal.id}
                            proposal={proposal}
                            activeTab={activeTab}
                            unreadCount={getUnreadCount(proposal)}
                            onSelect={handleSelectProposal}
                        />
                    ))
                )}
            </div>

            {/* Proposal Detail Modal */}
            {selectedProposal && (
                <ProposalDetailModal
                    proposal={selectedProposal}
                    activeTab={activeTab}
                    onClose={() => setSelectedProposal(null)}
                    onUpdate={(updated) => setSelectedProposal(updated)}
                    onRefresh={refetch}
                />
            )}
        </div>
    )
}
