'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Briefcase, Users, Calendar, ChevronRight, Plus, TrendingUp, TrendingDown, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'
import { useProjects } from '@/hooks/useProjects'
import { supabase } from '@/lib/supabase'
import { getRelativeTime, getProjectStatuses } from '@/lib/utils'
import type { Project } from '@/lib/types'

const CONFIRMATION_LABELS: Record<string, { label: string; color: string }> = {
    negotiating: { label: '협상 중', color: 'bg-yellow-500/10 text-yellow-400' },
    confirmed: { label: '진행 확정', color: 'bg-green-500/10 text-green-400' },
    declined: { label: '거절됨', color: 'bg-red-500/10 text-red-400' },
    cancelled: { label: '취소됨', color: 'bg-red-500/10 text-red-400' },
    completed: { label: '완료', color: 'bg-white/5 text-white/40' },
}

const PROGRESS_LABELS: Record<string, { label: string; color: string }> = {
    idle: { label: '대기', color: 'bg-white/5 text-white/30' },
    recruiting: { label: '모집 중', color: 'bg-blue-500/10 text-blue-400' },
    in_progress: { label: '진행 중', color: 'bg-green-500/10 text-green-400' },
    completed: { label: '진행 완료', color: 'bg-white/5 text-white/40' },
    cancelled: { label: '취소됨', color: 'bg-red-500/10 text-red-400' },
}

const CATEGORY_LABELS: Record<string, string> = {
    choreo: '안무', broadcast: '방송', performance: '공연', workshop: '워크샵', judge: '심사',
}

function isActiveProject(p: Project): boolean {
    const { confirmation, progress } = getProjectStatuses(p)
    if (confirmation === 'completed' || confirmation === 'declined' || confirmation === 'cancelled') return false
    if (progress === 'completed' || progress === 'cancelled') return false
    return true
}

export default function ProjectsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const { projects, loading } = useProjects()
    const [myDancerIds, setMyDancerIds] = useState<string[]>([])

    useEffect(() => {
        if (!authLoading && !user) router.push('/auth/signin')
    }, [user, authLoading, router])

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

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    const activeProjects = projects.filter(isActiveProject)
    const pastProjects = projects.filter(p => !isActiveProject(p))

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-10">
                <div className="px-6 py-4 flex items-center gap-4">
                    <Link href="/my"><ArrowLeft className="w-6 h-6 text-white" /></Link>
                    <h1 className="text-xl font-bold text-white">프로젝트 관리</h1>
                </div>
            </div>

            <div className="p-4 space-y-6">
                <Link
                    href="/my/projects/new"
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary/10 border border-primary/30 text-primary font-bold rounded-xl hover:bg-primary/20 transition"
                >
                    <Plus className="w-5 h-5" />
                    새 프로젝트 만들기
                </Link>

                <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-white/50 px-1">진행 중 ({activeProjects.length})</h2>
                    {activeProjects.length === 0 ? (
                        <div className="text-center py-12">
                            <Briefcase className="w-12 h-12 text-white/10 mx-auto mb-3" />
                            <p className="text-white/40 text-sm">진행 중인 프로젝트가 없습니다</p>
                            <p className="text-white/25 text-xs mt-1">제안을 수락하거나 새 프로젝트를 만들어 보세요</p>
                        </div>
                    ) : (
                        activeProjects.map(project => (
                            <ProjectCard key={project.id} project={project} userId={user!.id} myDancerIds={myDancerIds} />
                        ))
                    )}
                </section>

                {pastProjects.length > 0 && (
                    <section className="space-y-3">
                        <h2 className="text-sm font-semibold text-white/50 px-1">지난 프로젝트 ({pastProjects.length})</h2>
                        {pastProjects.map(project => (
                            <ProjectCard key={project.id} project={project} userId={user!.id} myDancerIds={myDancerIds} />
                        ))}
                    </section>
                )}
            </div>
        </div>
    )
}

function ProjectCard({ project, userId, myDancerIds }: { project: Project; userId: string; myDancerIds: string[] }) {
    const { confirmation, progress } = getProjectStatuses(project)
    const confirmLabel = CONFIRMATION_LABELS[confirmation] || CONFIRMATION_LABELS.negotiating
    const progressLabel = PROGRESS_LABELS[progress] || PROGRESS_LABELS.idle
    const isOwner = project.owner_id === userId

    const uniqueDancerMap = new Map<string, string>()
    for (const p of project.proposals || []) {
        const existing = uniqueDancerMap.get(p.dancer_id)
        if (!existing || p.status === 'accepted') {
            uniqueDancerMap.set(p.dancer_id, p.status)
        }
    }
    const acceptedCount = Array.from(uniqueDancerMap.values()).filter(s => s === 'accepted').length
    const totalCount = uniqueDancerMap.size

    return (
        <Link href={`/my/projects/${project.id}`} className="block">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:bg-neutral-800/50 transition active:scale-[0.98] space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${confirmLabel.color}`}>
                                {confirmLabel.label}
                            </span>
                            {confirmation === 'confirmed' && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${progressLabel.color}`}>
                                    {progressLabel.label}
                                </span>
                            )}
                            {project.category && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                                    {CATEGORY_LABELS[project.category] || project.category}
                                </span>
                            )}
                            {isOwner ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">내 프로젝트</span>
                            ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium">참여 중</span>
                            )}
                        </div>
                        <h3 className="text-white font-bold text-sm truncate">{project.title}</h3>
                        {project.clients?.company_name && (
                            <p className="text-xs text-white/40 truncate">{project.clients.company_name}</p>
                        )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 mt-1 flex-shrink-0" />
                </div>

                <div className="flex items-center gap-4 text-[11px] text-white/30">
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>참여 {acceptedCount}/{totalCount}명</span>
                    </div>
                    {project.start_date && (
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{project.start_date}{project.end_date ? ` ~ ${project.end_date}` : ''}</span>
                        </div>
                    )}
                    <span className="ml-auto">{getRelativeTime(project.created_at)}</span>
                </div>

                {/* 재무 미니 요약: 오너 / 참여자 관점 분리 */}
                {(() => {
                    if (isOwner) {
                        // 오너 시점: 매출(클라이언트 예산) - 지출(댄서 섭외비) = 순수익
                        const ownerFee = (project.proposals || [])
                            .find((p: any) => p.status === 'accepted' && myDancerIds.includes(p.dancer_id))?.fee || 0
                        const revenue = project.budget || ownerFee || 0
                        const expense = (project.proposals || [])
                            .filter((p: any, i: number, arr: any[]) => {
                                if (p.status !== 'accepted') return false
                                if (myDancerIds.includes(p.dancer_id)) return false
                                return arr.findIndex((x: any) => x.dancer_id === p.dancer_id && x.status === 'accepted') === i
                            })
                            .reduce((acc: number, p: any) => acc + (p.fee || 0), 0)
                        const net = revenue - expense
                        if (revenue === 0 && expense === 0) return null
                        return (
                            <div className="flex items-center gap-3 text-[11px] pt-1.5 mt-1 border-t border-neutral-800/40">
                                {revenue > 0 && (
                                    <span className="text-blue-400/60">내 매출 {revenue.toLocaleString()}</span>
                                )}
                                {expense > 0 && (
                                    <span className="text-red-400/60">내 지출 {expense.toLocaleString()}</span>
                                )}
                                {revenue > 0 && (
                                    <span className={`ml-auto flex items-center gap-0.5 font-semibold ${net >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                                        {net >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        순수익 {net.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        )
                    } else {
                        // 참여자 시점: 제안받은 금액 = 내 매출
                        const myProposal = (project.proposals || [])
                            .find((p: any) => p.status === 'accepted' && myDancerIds.includes(p.dancer_id))
                        if (!myProposal?.fee) return null
                        return (
                            <div className="flex items-center gap-3 text-[11px] pt-1.5 mt-1 border-t border-neutral-800/40">
                                <ArrowDownRight className="w-3 h-3 text-blue-400/60" />
                                <span className="text-blue-400/60 font-medium">내 매출</span>
                                <span className="ml-auto text-blue-400/80 font-semibold">{myProposal.fee.toLocaleString()}원</span>
                            </div>
                        )
                    }
                })()}
            </div>
        </Link>
    )
}
