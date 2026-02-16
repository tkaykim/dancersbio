'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import {
    ArrowLeft, Loader2, Users, Calendar, Wallet, Edit3, Plus,
    CheckCircle, Clock, XCircle, User as UserIcon, Save, Handshake, Play,
    Lock, Eye, EyeOff, TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight,
    CircleDollarSign, Hourglass,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getRelativeTime, getProjectStatuses } from '@/lib/utils'
import type { Project, ConfirmationStatus, ProgressStatus } from '@/lib/types'

const CONFIRMATION_OPTIONS: { value: ConfirmationStatus; label: string; color: string }[] = [
    { value: 'negotiating', label: '협상 중', color: 'text-yellow-400 bg-yellow-500/10' },
    { value: 'confirmed', label: '진행 확정', color: 'text-green-400 bg-green-500/10' },
    { value: 'declined', label: '거절됨', color: 'text-red-400 bg-red-500/10' },
    { value: 'cancelled', label: '취소됨', color: 'text-red-400 bg-red-500/10' },
    { value: 'completed', label: '완료', color: 'text-white/40 bg-white/5' },
]

const PROGRESS_OPTIONS: { value: ProgressStatus; label: string; color: string }[] = [
    { value: 'idle', label: '대기', color: 'text-white/40 bg-white/5' },
    { value: 'recruiting', label: '모집 중', color: 'text-blue-400 bg-blue-500/10' },
    { value: 'in_progress', label: '진행 중', color: 'text-green-400 bg-green-500/10' },
    { value: 'completed', label: '진행 완료', color: 'text-white/40 bg-white/5' },
    { value: 'cancelled', label: '취소됨', color: 'text-red-400 bg-red-500/10' },
]

const CATEGORY_LABELS: Record<string, string> = {
    choreo: '안무', broadcast: '방송', performance: '공연', workshop: '워크샵', judge: '심사',
}

const PROPOSAL_STATUS_ICON: Record<string, { icon: typeof CheckCircle; color: string }> = {
    accepted: { icon: CheckCircle, color: 'text-green-400' },
    pending: { icon: Clock, color: 'text-yellow-400' },
    negotiating: { icon: Clock, color: 'text-blue-400' },
    declined: { icon: XCircle, color: 'text-red-400' },
}

/** 오너 전용 정보 섹션 래퍼 */
function OwnerOnlySection({ children, label }: { children: React.ReactNode; label?: string }) {
    return (
        <div className="relative">
            <div className="absolute -top-2.5 right-2 z-10 flex items-center gap-1 bg-neutral-950 px-2 py-0.5 rounded-full">
                <EyeOff className="w-2.5 h-2.5 text-primary/60" />
                <span className="text-[9px] text-primary/60 font-medium">{label || '나만 보임'}</span>
            </div>
            {children}
        </div>
    )
}

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [project, setProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)
    const [notes, setNotes] = useState('')
    const [editingNotes, setEditingNotes] = useState(false)
    const [savingNotes, setSavingNotes] = useState(false)

    const fetchProject = useCallback(async () => {
        if (!id) return
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('projects')
                .select(`
                    *,
                    clients (company_name, contact_person),
                    owner:users!owner_id (name),
                    proposals (id, dancer_id, sender_id, fee, status, role, details, created_at, dancers (id, stage_name, profile_img, genres))
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            setProject(data as any)
            setNotes(data.notes || '')
        } catch {
            router.replace('/my/projects')
        } finally {
            setLoading(false)
        }
    }, [id, router])

    useEffect(() => {
        if (!authLoading && !user) router.push('/auth/signin')
    }, [user, authLoading, router])

    useEffect(() => {
        if (user && id) fetchProject()
    }, [user, id, fetchProject])

    const updateConfirmation = async (value: ConfirmationStatus) => {
        if (!project) return
        const updates: any = { confirmation_status: value }
        if (value === 'confirmed' && getProjectStatuses(project).progress === 'idle') {
            updates.progress_status = 'recruiting'
        }
        if (value === 'declined' || value === 'cancelled') {
            updates.progress_status = 'cancelled'
        }
        if (value === 'completed') {
            updates.progress_status = 'completed'
        }
        const statusMap: Record<string, string> = {
            negotiating: 'recruiting', confirmed: 'active',
            declined: 'cancelled', cancelled: 'cancelled', completed: 'done',
        }
        updates.status = statusMap[value] || 'recruiting'
        const { error } = await supabase.from('projects').update(updates).eq('id', project.id)
        if (!error) setProject({ ...project, ...updates })
    }

    const updateProgress = async (value: ProgressStatus) => {
        if (!project) return
        if (getProjectStatuses(project).confirmation !== 'confirmed') return
        const { error } = await supabase.from('projects').update({ progress_status: value }).eq('id', project.id)
        if (!error) setProject({ ...project, progress_status: value })
    }

    const saveNotes = async () => {
        if (!project) return
        setSavingNotes(true)
        const { error } = await supabase.from('projects').update({ notes }).eq('id', project.id)
        if (!error) {
            setProject({ ...project, notes })
            setEditingNotes(false)
        }
        setSavingNotes(false)
    }

    // 현재 유저의 dancer_ids (소유 + 매니저)
    const [myDancerIds, setMyDancerIds] = useState<string[]>([])
    useEffect(() => {
        if (!user) return
        supabase
            .from('dancers')
            .select('id')
            .or(`owner_id.eq.${user.id},manager_id.eq.${user.id}`)
            .then(({ data }) => {
                setMyDancerIds((data || []).map(d => d.id))
            })
    }, [user])

    // 내 제안 (참여자 시점에서 본인이 받은 제안)
    const myProposal = useMemo(() => {
        if (!project?.proposals) return null
        return project.proposals.find(p => myDancerIds.includes(p.dancer_id)) || null
    }, [project, myDancerIds])

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    if (!project || !user) return null

    const isOwner = project.owner_id === user.id
    const { confirmation, progress } = getProjectStatuses(project)
    const confirmInfo = CONFIRMATION_OPTIONS.find(o => o.value === confirmation) || CONFIRMATION_OPTIONS[0]
    const progressInfo = PROGRESS_OPTIONS.find(o => o.value === progress) || PROGRESS_OPTIONS[0]

    // dancer_id 기준 중복 제거
    const deduplicatedProposals = (() => {
        const map = new Map<string, any>()
        const statusPriority: Record<string, number> = { accepted: 0, negotiating: 1, pending: 2, declined: 3 }
        for (const p of project.proposals || []) {
            const existing = map.get(p.dancer_id)
            if (!existing || (statusPriority[p.status] ?? 9) < (statusPriority[existing.status] ?? 9)) {
                map.set(p.dancer_id, p)
            }
        }
        return Array.from(map.values())
    })()

    const acceptedProposals = deduplicatedProposals.filter(p => p.status === 'accepted')
    const pendingProposals = deduplicatedProposals.filter(p => p.status === 'pending' || p.status === 'negotiating')
    const declinedProposals = deduplicatedProposals.filter(p => p.status === 'declined')
    const canRecruit = confirmation === 'confirmed' && progress === 'recruiting'

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-10">
                <div className="px-6 py-4 flex items-center gap-4">
                    <Link href="/my/projects"><ArrowLeft className="w-6 h-6 text-white" /></Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold text-white truncate">{project.title}</h1>
                        {project.clients?.company_name && (
                            <p className="text-xs text-white/40">{project.clients.company_name}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-5">
                {/* Status Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${confirmInfo.color}`}>
                        {confirmInfo.label}
                    </span>
                    {confirmation === 'confirmed' && (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${progressInfo.color}`}>
                            {progressInfo.label}
                        </span>
                    )}
                    {project.category && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/50">
                            {CATEGORY_LABELS[project.category] || project.category}
                        </span>
                    )}
                    {isOwner && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">프로젝트 담당자</span>
                    )}
                </div>

                {/* Public Project Info — 모든 참여자 공개 */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
                    {project.description && (
                        <p className="text-sm text-white/60">{project.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-white/40">
                        {project.start_date && (
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {project.start_date}{project.end_date ? ` ~ ${project.end_date}` : ''}
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            참여 확정 {acceptedProposals.length}명
                        </div>
                    </div>
                </div>

                {/* ───── 참여 댄서(비오너) 시점: 본인 제안 정보 ───── */}
                {!isOwner && myProposal && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <Eye className="w-4 h-4 text-primary/70" />
                            <h3 className="text-sm font-bold text-white">나의 참여 정보</h3>
                        </div>
                        <div className="space-y-1.5 text-sm">
                            {myProposal.role && (
                                <div className="flex justify-between">
                                    <span className="text-white/40">역할</span>
                                    <span className="text-white font-medium">{myProposal.role}</span>
                                </div>
                            )}
                            {myProposal.fee && (
                                <div className="flex justify-between">
                                    <span className="text-white/40">제안 금액</span>
                                    <span className="text-primary font-bold">{myProposal.fee.toLocaleString()}원</span>
                                </div>
                            )}
                            {myProposal.details && (
                                <div className="pt-1.5 border-t border-white/5">
                                    <span className="text-white/40 text-xs">메시지</span>
                                    <p className="text-white/70 text-sm mt-0.5">{myProposal.details}</p>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-white/40">상태</span>
                                <span className={`text-xs font-semibold ${myProposal.status === 'accepted' ? 'text-green-400' : myProposal.status === 'declined' ? 'text-red-400' : 'text-yellow-400'}`}>
                                    {myProposal.status === 'accepted' ? '수락됨' : myProposal.status === 'declined' ? '거절됨' : '대기 중'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ───── 오너 전용: 재무 요약 (매출 / 지출 / 순수익) ───── */}
                {isOwner && (
                    <OwnerOnlySection label="담당자만 보임">
                        <ProjectFinanceSummary
                            budget={project.budget}
                            acceptedProposals={acceptedProposals}
                            pendingProposals={pendingProposals}
                        />
                    </OwnerOnlySection>
                )}

                {/* ───── 오너 전용: 상태 관리 ───── */}
                {isOwner && (
                    <OwnerOnlySection label="담당자만 보임">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4">
                            <div>
                                <p className="text-[11px] text-white/30 mb-2 flex items-center gap-1.5">
                                    <Handshake className="w-3 h-3" />
                                    확정 상태 (클라이언트 ↔ 오너)
                                </p>
                                <div className="flex gap-1.5 flex-wrap">
                                    {CONFIRMATION_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => updateConfirmation(opt.value)}
                                            className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition ${confirmation === opt.value
                                                ? 'bg-white/10 text-white ring-1 ring-white/20'
                                                : 'bg-neutral-800 text-white/30 hover:text-white/60'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {confirmation === 'confirmed' && (
                                <div className="pt-3 border-t border-neutral-800/50">
                                    <p className="text-[11px] text-white/30 mb-2 flex items-center gap-1.5">
                                        <Play className="w-3 h-3" />
                                        진행 상태 (내부 관리)
                                    </p>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {PROGRESS_OPTIONS.filter(o => o.value !== 'idle').map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => updateProgress(opt.value)}
                                                className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition ${progress === opt.value
                                                    ? 'bg-white/10 text-white ring-1 ring-white/20'
                                                    : 'bg-neutral-800 text-white/30 hover:text-white/60'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </OwnerOnlySection>
                )}

                {/* Invite */}
                {canRecruit && isOwner && (
                    <Link
                        href={`/my/projects/${project.id}/invite`}
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition"
                    >
                        <Plus className="w-5 h-5" />
                        댄서 초대하기
                    </Link>
                )}

                {isOwner && confirmation === 'confirmed' && progress !== 'recruiting' && progress !== 'completed' && progress !== 'cancelled' && (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-center">
                        <p className="text-xs text-white/30">진행 상태를 &apos;모집 중&apos;으로 변경하면 댄서를 초대할 수 있습니다</p>
                    </div>
                )}
                {isOwner && confirmation === 'negotiating' && (
                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 text-center">
                        <p className="text-sm text-yellow-400/80 font-medium">클라이언트와 협상 중</p>
                        <p className="text-xs text-white/30 mt-1">프로젝트가 확정되면 댄서 모집을 시작할 수 있습니다</p>
                    </div>
                )}

                {/* ───── 참여 댄서 목록 (공개: 이름/장르만, 금액은 오너만) ───── */}
                <section className="space-y-2.5">
                    <h2 className="text-sm font-semibold text-white/60 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        참여 확정 ({acceptedProposals.length})
                    </h2>
                    {acceptedProposals.length === 0 ? (
                        <p className="text-xs text-white/25 py-4 text-center">아직 참여 확정된 댄서가 없습니다</p>
                    ) : (
                        <div className="space-y-2">
                            {acceptedProposals.map(p => (
                                <DancerRow key={p.id} proposal={p} showFee={isOwner} />
                            ))}
                        </div>
                    )}
                </section>

                {/* ───── 오너 전용: 대기/거절 목록 ───── */}
                {isOwner && pendingProposals.length > 0 && (
                    <OwnerOnlySection>
                        <section className="space-y-2.5">
                            <h2 className="text-sm font-semibold text-white/60 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-yellow-400" />
                                응답 대기 ({pendingProposals.length})
                            </h2>
                            <div className="space-y-2">
                                {pendingProposals.map(p => (
                                    <DancerRow key={p.id} proposal={p} showFee={true} />
                                ))}
                            </div>
                        </section>
                    </OwnerOnlySection>
                )}

                {isOwner && declinedProposals.length > 0 && (
                    <OwnerOnlySection>
                        <section className="space-y-2.5">
                            <h2 className="text-sm font-semibold text-white/60 flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-400" />
                                거절 ({declinedProposals.length})
                            </h2>
                            <div className="space-y-2 opacity-50">
                                {declinedProposals.map(p => (
                                    <DancerRow key={p.id} proposal={p} showFee={true} />
                                ))}
                            </div>
                        </section>
                    </OwnerOnlySection>
                )}

                {/* ───── 오너 전용: 메모 ───── */}
                {isOwner && (
                    <OwnerOnlySection>
                        <section className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-white/60 flex items-center gap-2">
                                    <Edit3 className="w-4 h-4" />
                                    진행 메모 / 계획
                                </h2>
                                {!editingNotes ? (
                                    <button onClick={() => setEditingNotes(true)} className="text-xs text-primary hover:underline">편집</button>
                                ) : (
                                    <button
                                        onClick={saveNotes}
                                        disabled={savingNotes}
                                        className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                        {savingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                        저장
                                    </button>
                                )}
                            </div>
                            {editingNotes ? (
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={6}
                                    placeholder="리허설 일정, 의상, 동선 등 프로젝트 진행 관련 메모를 작성하세요..."
                                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm placeholder-white/25 focus:outline-none focus:border-primary resize-none"
                                />
                            ) : (
                                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 min-h-[80px]">
                                    {notes ? (
                                        <p className="text-sm text-white/60 whitespace-pre-wrap">{notes}</p>
                                    ) : (
                                        <p className="text-sm text-white/20">메모가 없습니다. 편집을 눌러 작성하세요.</p>
                                    )}
                                </div>
                            )}
                        </section>
                    </OwnerOnlySection>
                )}

                {/* 오너 전용 정보 안내 배너 */}
                {isOwner && (
                    <div className="flex items-start gap-2.5 p-3 bg-neutral-900/50 rounded-xl border border-neutral-800/30">
                        <Lock className="w-4 h-4 text-primary/50 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[11px] text-white/40 leading-relaxed">
                                <span className="inline-flex items-center gap-0.5 text-primary/60 font-medium"><EyeOff className="w-2.5 h-2.5" /> 나만 보임</span>
                                {' '}표시가 있는 항목은 프로젝트 담당자인 나만 볼 수 있습니다.
                                참여 댄서들은 전체 예산, 다른 댄서의 금액, 대기/거절 목록, 메모를 볼 수 없습니다.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function ProjectFinanceSummary({
    budget,
    acceptedProposals,
    pendingProposals,
}: {
    budget: number | null
    acceptedProposals: any[]
    pendingProposals: any[]
}) {
    const revenue = budget || 0
    const confirmedExpense = acceptedProposals.reduce((acc: number, p: any) => acc + (p.fee || 0), 0)
    const pendingExpense = pendingProposals.reduce((acc: number, p: any) => acc + (p.fee || 0), 0)
    const netProfit = revenue - confirmedExpense
    const projectedProfit = revenue - confirmedExpense - pendingExpense
    const hasRevenue = revenue > 0

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            {/* 헤더 */}
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                <CircleDollarSign className="w-4 h-4 text-primary/60" />
                <h3 className="text-sm font-bold text-white">프로젝트 재무</h3>
            </div>

            {/* 매출 / 지출 / 순수익 그리드 */}
            <div className="grid grid-cols-3 gap-px bg-neutral-800/50 mx-4 mb-3 rounded-lg overflow-hidden">
                <div className="bg-neutral-900 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <ArrowDownRight className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] text-white/35 font-medium">매출</span>
                    </div>
                    <p className={`text-sm font-bold ${hasRevenue ? 'text-blue-400' : 'text-white/20'}`}>
                        {hasRevenue ? `${revenue.toLocaleString()}` : '미설정'}
                    </p>
                </div>
                <div className="bg-neutral-900 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <ArrowUpRight className="w-3 h-3 text-red-400" />
                        <span className="text-[10px] text-white/35 font-medium">확정 지출</span>
                    </div>
                    <p className={`text-sm font-bold ${confirmedExpense > 0 ? 'text-red-400' : 'text-white/20'}`}>
                        {confirmedExpense > 0 ? `${confirmedExpense.toLocaleString()}` : '0'}
                    </p>
                </div>
                <div className="bg-neutral-900 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        {netProfit >= 0
                            ? <TrendingUp className="w-3 h-3 text-green-400" />
                            : <TrendingDown className="w-3 h-3 text-red-400" />
                        }
                        <span className="text-[10px] text-white/35 font-medium">순수익</span>
                    </div>
                    <p className={`text-sm font-bold ${
                        !hasRevenue ? 'text-white/20'
                        : netProfit > 0 ? 'text-green-400'
                        : netProfit < 0 ? 'text-red-400'
                        : 'text-white/50'
                    }`}>
                        {!hasRevenue ? '-' : `${netProfit.toLocaleString()}`}
                    </p>
                </div>
            </div>

            {/* 상세 내역 */}
            <div className="px-4 pb-4 space-y-1.5">
                {/* 대기 중 예상 지출 */}
                {pendingExpense > 0 && (
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-white/30">
                            <Hourglass className="w-3 h-3" />
                            대기 중 예상 지출
                        </div>
                        <span className="text-yellow-400/70 font-medium">{pendingExpense.toLocaleString()}원</span>
                    </div>
                )}
                {/* 대기 포함 예상 순수익 */}
                {pendingExpense > 0 && hasRevenue && (
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-800/50">
                        <span className="text-white/30">대기 포함 예상 순수익</span>
                        <span className={`font-semibold ${projectedProfit >= 0 ? 'text-green-400/60' : 'text-red-400/60'}`}>
                            {projectedProfit.toLocaleString()}원
                        </span>
                    </div>
                )}
                {/* 인원별 평균 */}
                {acceptedProposals.length > 0 && confirmedExpense > 0 && (
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-white/30">확정 인원 {acceptedProposals.length}명 평균</span>
                        <span className="text-white/40">
                            {Math.round(confirmedExpense / acceptedProposals.length).toLocaleString()}원/인
                        </span>
                    </div>
                )}
                {/* 예산 미설정 안내 */}
                {!hasRevenue && (
                    <p className="text-[11px] text-white/20 text-center py-1">
                        전체 예산(매출)을 설정하면 순수익을 자동으로 계산합니다
                    </p>
                )}
            </div>
        </div>
    )
}

function DancerRow({ proposal, showFee }: { proposal: any; showFee: boolean }) {
    const dancer = proposal.dancers
    const statusInfo = PROPOSAL_STATUS_ICON[proposal.status] || PROPOSAL_STATUS_ICON.pending
    const StatusIcon = statusInfo.icon

    return (
        <Link href={`/profile/${dancer.id}`} className="block">
            <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-lg p-3 flex items-center gap-3 hover:bg-neutral-800/30 transition">
                <div className="w-10 h-10 bg-neutral-800 rounded-full overflow-hidden flex-shrink-0 relative">
                    {dancer.profile_img ? (
                        <Image src={dancer.profile_img} alt={dancer.stage_name} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-white/20" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{dancer.stage_name}</p>
                    {dancer.genres && dancer.genres.length > 0 && (
                        <p className="text-[10px] text-white/30 truncate">{dancer.genres.slice(0, 3).join(', ')}</p>
                    )}
                </div>
                {proposal.role && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 flex-shrink-0">{proposal.role}</span>
                )}
                {showFee && proposal.fee && (
                    <span className="text-xs text-primary/70 flex-shrink-0">{proposal.fee.toLocaleString()}원</span>
                )}
                <StatusIcon className={`w-4 h-4 flex-shrink-0 ${statusInfo.color}`} />
            </div>
        </Link>
    )
}
