'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Wallet } from 'lucide-react'
import Link from 'next/link'
import { useMyProfiles } from '@/hooks/useMyProfiles'
import BalanceSummaryCard from '@/components/settlements/BalanceSummaryCard'
import ProjectSettlementAccordion, { type ProjectSettlementData, type SettlementItemDetail } from '@/components/settlements/ProjectSettlementAccordion'
import ProjectSettlementDetailModal from '@/components/settlements/ProjectSettlementDetailModal'
import { ACTIVE_PROPOSAL_STATUSES, toSettlementItemStatus } from '@/lib/settlement-logic'

interface SettlementItem {
    id: string
    projectId: string
    projectTitle: string
    category: string
    companyName: string | null
    dancerName: string | null
    fee: number | null
    type: 'income' | 'expense'
    label: string
    status: 'pending' | 'completed'
    date: string
    startDate: string | null
    endDate: string | null
    contractAmount: number | null
    progressStatus: string | null
}

type SettlementFilter = 'all' | 'income' | 'expense'

export default function SettlementsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const { allProfiles, loading: profilesLoading } = useMyProfiles()
    const [selectedProfileId, setSelectedProfileId] = useState<string>('')
    const [projectSettlements, setProjectSettlements] = useState<ProjectSettlementData[]>([])
    const [selectedProject, setSelectedProject] = useState<ProjectSettlementData | null>(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<SettlementFilter>('all')

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (!profilesLoading && allProfiles.length > 0 && !selectedProfileId) {
            setSelectedProfileId(allProfiles[0].id)
        }
    }, [allProfiles, profilesLoading, selectedProfileId])

    useEffect(() => {
        if (user && !profilesLoading && selectedProfileId) {
            fetchSettlements()
        }
    }, [user, profilesLoading, selectedProfileId])

    const fetchSettlements = async () => {
        if (!user || !selectedProfileId) return
        setLoading(true)
        try {
            const selectedProfile = allProfiles.find(p => p.id === selectedProfileId)
            if (!selectedProfile) {
                setProjectSettlements([])
                return
            }
            const items: SettlementItem[] = []

            // [매출] 선택 프로필이 받은 제안
            const { data: incomeProposals } = await supabase
                .from('proposals')
                .select(`
                    id, fee, status, dancer_id, created_at,
                    projects!inner (
                        id, title, category, contract_amount, pm_dancer_id,
                        start_date, end_date, progress_status,
                        clients (company_name)
                    ),
                    dancers (id, stage_name)
                `)
                .eq('dancer_id', selectedProfileId)
                .in('status', [...ACTIVE_PROPOSAL_STATUSES])

            for (const p of incomeProposals || []) {
                const proj = p.projects as any
                const dancer = p.dancers as any
                const isPmIncome = proj.pm_dancer_id === selectedProfileId
                items.push({
                    id: `income-${p.id}`,
                    projectId: proj.id,
                    projectTitle: proj.title,
                    category: proj.category || '',
                    companyName: proj.clients?.company_name || null,
                    dancerName: dancer?.stage_name || selectedProfile.stage_name,
                    fee: p.fee,
                    type: 'income',
                    label: isPmIncome
                        ? `PM 수입 (${p.status === 'accepted' ? '확정' : '대기'})`
                        : `참여 수입 (${p.status === 'accepted' ? '확정' : '대기'})`,
                    status: toSettlementItemStatus(p.status),
                    date: p.created_at,
                    startDate: proj.start_date,
                    endDate: proj.end_date,
                    contractAmount: proj.contract_amount,
                    progressStatus: proj.progress_status,
                })
            }

            // [지출] 선택 프로필이 PM인 프로젝트에서, 다른 프로필에게 보낸 제안
            const { data: pmProjects } = await supabase
                .from('projects')
                .select('id')
                .eq('pm_dancer_id', selectedProfileId)

            const pmProjectIds = (pmProjects || []).map((p: any) => p.id)
            if (pmProjectIds.length > 0) {
                const { data: expenseProposals } = await supabase
                    .from('proposals')
                    .select(`
                        id, fee, status, dancer_id, created_at,
                        projects!inner (
                            id, title, category, contract_amount, pm_dancer_id,
                            start_date, end_date, progress_status,
                            clients (company_name)
                        ),
                        dancers (id, stage_name)
                    `)
                    .in('project_id', pmProjectIds)
                    .neq('dancer_id', selectedProfileId)
                    .in('status', [...ACTIVE_PROPOSAL_STATUSES])

                for (const p of expenseProposals || []) {
                    const proj = p.projects as any
                    const dancer = p.dancers as any
                    items.push({
                        id: `expense-${p.id}`,
                        projectId: proj.id,
                        projectTitle: proj.title,
                        category: proj.category || '',
                        companyName: proj.clients?.company_name || null,
                        dancerName: dancer?.stage_name || null,
                        fee: p.fee,
                        type: 'expense',
                        label: `섭외 지출 (${p.status === 'accepted' ? '확정' : '대기'})`,
                        status: toSettlementItemStatus(p.status),
                        date: p.created_at,
                        startDate: proj.start_date,
                        endDate: proj.end_date,
                        contractAmount: proj.contract_amount,
                        progressStatus: proj.progress_status,
                    })
                }
            }

            items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

            // === 3. 프로젝트 단위로 그룹화 ===
            const projectMap = new Map<string, SettlementItem[]>()
            for (const item of items) {
                if (!projectMap.has(item.projectId)) {
                    projectMap.set(item.projectId, [])
                }
                projectMap.get(item.projectId)!.push(item)
            }

            const projectSettlementList: ProjectSettlementData[] = []
            for (const [projectId, projectItems] of projectMap) {
                const incomeDetails: SettlementItemDetail[] = []
                const expenseDetails: SettlementItemDetail[] = []

                let totalIncome = 0
                let totalExpense = 0
                let hasUndecided = false

                for (const item of projectItems) {
                    const detail: SettlementItemDetail = {
                        id: item.id,
                        dancerName: item.dancerName,
                        fee: item.fee,
                        label: item.label,
                        status: item.status,
                        date: item.date,
                    }

                    if (item.type === 'income') {
                        incomeDetails.push(detail)
                        if (item.fee) totalIncome += item.fee
                        else hasUndecided = true
                    } else {
                        expenseDetails.push(detail)
                        if (item.fee) totalExpense += item.fee
                        else hasUndecided = true
                    }
                }

                const allCompleted = projectItems.every(i => i.status === 'completed')
                const someCompleted = projectItems.some(i => i.status === 'completed')
                const settlementStatus: 'pending' | 'partial' | 'completed' =
                    allCompleted && !hasUndecided ? 'completed' : someCompleted ? 'partial' : 'pending'

                const firstItem = projectItems[0]
                projectSettlementList.push({
                    projectId,
                    projectTitle: firstItem.projectTitle,
                    category: firstItem.category,
                    companyName: firstItem.companyName,
                    startDate: firstItem.startDate,
                    endDate: firstItem.endDate,
                    contractAmount: firstItem.contractAmount,
                    incomeItems: incomeDetails,
                    expenseItems: expenseDetails,
                    totalIncome,
                    totalExpense,
                    netProfit: totalIncome - totalExpense,
                    hasUndecided,
                    settlementStatus,
                    perspectiveProfileName: selectedProfile.stage_name,
                })
            }

            // 최신 프로젝트 순으로 정렬
            projectSettlementList.sort((a, b) => {
                const aDate = a.incomeItems[0]?.date || a.expenseItems[0]?.date || ''
                const bDate = b.incomeItems[0]?.date || b.expenseItems[0]?.date || ''
                return new Date(bDate).getTime() - new Date(aDate).getTime()
            })

            setProjectSettlements(projectSettlementList)
        } catch (err) {
            console.error('Error fetching settlements:', err)
            setProjectSettlements([])
        } finally {
            setLoading(false)
        }
    }

    const filteredProjectSettlements = filter === 'all'
        ? projectSettlements
        : projectSettlements.filter(p => {
            if (filter === 'income') return p.incomeItems.length > 0
            if (filter === 'expense') return p.expenseItems.length > 0
            return true
        })

    const selectedProfile = allProfiles.find(p => p.id === selectedProfileId)
    const totalIncome = projectSettlements.reduce((acc, p) => acc + p.totalIncome, 0)
    const totalExpense = projectSettlements.reduce((acc, p) => acc + p.totalExpense, 0)
    const undecidedCount = projectSettlements.filter(p => p.hasUndecided).length

    const projectCount = projectSettlements.length
    const incomeProjectCount = projectSettlements.filter(p => p.incomeItems.length > 0).length
    const expenseProjectCount = projectSettlements.filter(p => p.expenseItems.length > 0).length

    if (authLoading || profilesLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-10">
                <div className="px-6 py-4 flex items-center gap-4">
                    <Link href="/my">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </Link>
                    <h1 className="text-xl font-bold text-white">정산 관리</h1>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {allProfiles.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs text-white/40">정산 기준 프로필</p>
                        <select
                            value={selectedProfileId}
                            onChange={(e) => setSelectedProfileId(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary"
                        >
                            {allProfiles.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.stage_name} {p.role === 'manager' ? '(매니저 권한)' : '(본인)'}
                                </option>
                            ))}
                        </select>
                        {selectedProfile && (
                            <p className="text-[11px] text-white/30">
                                현재 {selectedProfile.stage_name} 프로필 관점으로 매출/지출을 계산합니다.
                            </p>
                        )}
                    </div>
                )}

                {/* Balance Summary */}
                <BalanceSummaryCard
                    totalIncome={totalIncome}
                    totalExpense={totalExpense}
                />

                {/* Undecided Warning */}
                {undecidedCount > 0 && (
                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 flex items-center gap-2">
                        <span className="text-yellow-400 text-xs font-medium">
                            {undecidedCount}개 프로젝트에 금액 미정 항목이 있습니다. 금액이 확정되면 합계에 반영됩니다.
                        </span>
                    </div>
                )}

                {/* Filter */}
                <div className="flex gap-2">
                    {([
                        { value: 'all' as const, label: `전체 (${projectCount})` },
                        { value: 'income' as const, label: `매출 (${incomeProjectCount})` },
                        { value: 'expense' as const, label: `지출 (${expenseProjectCount})` },
                    ]).map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setFilter(opt.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === opt.value
                                ? opt.value === 'income' ? 'bg-blue-500/20 text-blue-400'
                                    : opt.value === 'expense' ? 'bg-red-500/20 text-red-400'
                                        : 'bg-primary text-black'
                                : 'bg-neutral-800 text-white/60 hover:text-white'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Project Settlement List */}
                {loading ? (
                    <div className="text-white/60 text-center py-12">로딩 중...</div>
                ) : filteredProjectSettlements.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="w-8 h-8 text-white/20" />
                        </div>
                        <p className="text-white/60 text-sm">
                            {filter === 'all' ? '아직 정산 내역이 없습니다.' : `${filter === 'income' ? '매출' : '지출'} 프로젝트가 없습니다.`}
                        </p>
                        <p className="text-white/30 text-xs mt-2">
                            프로젝트에 참여하면 매출이 기록됩니다.<br />
                            외부 댄서를 섭외하면 지출이 기록됩니다.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredProjectSettlements.map(projectData => (
                            <ProjectSettlementAccordion
                                key={projectData.projectId}
                                data={projectData}
                                onViewDetail={() => setSelectedProject(projectData)}
                            />
                        ))}
                    </div>
                )}

                {/* Detail Modal */}
                {selectedProject && (
                    <ProjectSettlementDetailModal
                        data={selectedProject}
                        onClose={() => setSelectedProject(null)}
                    />
                )}
            </div>
        </div>
    )
}
