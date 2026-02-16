'use client'

import { Suspense, useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2, Briefcase, Users, Calendar, ChevronRight, Plus, EyeOff, Archive } from 'lucide-react'
import Link from 'next/link'
import { useProjects } from '@/hooks/useProjects'
import { supabase } from '@/lib/supabase'
import { getRelativeTime, getProjectStatuses, isProjectPublic, isEmbargoActive } from '@/lib/utils'
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

function ProjectsPageInner() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const viewArchived = searchParams.get('view') === 'archived'
    const { projects, archivedProjectIds, loading } = useProjects()
    const [myDancerIds, setMyDancerIds] = useState<string[]>([])

    useEffect(() => {
        if (!authLoading && !user) router.push('/auth/signin')
    }, [user, authLoading, router])

    useEffect(() => {
        if (!user) return
        supabase.from('dancers').select('id').or(`owner_id.eq.${user.id},manager_id.eq.${user.id}`)
            .then(({ data }) => setMyDancerIds((data || []).map((d: { id: string }) => d.id)))
    }, [user])

    const notArchived = projects.filter((p: Project) => !archivedProjectIds.has(p.id))
    const archivedProjects = projects.filter((p: Project) => archivedProjectIds.has(p.id))
    const activeProjects = notArchived.filter(isActiveProject)
    const pastProjects = notArchived.filter(p => !isActiveProject(p))

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    if (viewArchived) {
        return (
            <div className="min-h-screen bg-background pb-20">
                <div className="sticky top-0 bg-background border-b border-neutral-800 z-10">
                    <div className="px-6 py-4 flex items-center gap-4">
                        <Link href="/my/projects"><ArrowLeft className="w-6 h-6 text-white" /></Link>
                        <h1 className="text-xl font-bold text-white">보관함</h1>
                    </div>
                </div>
                <div className="p-4 space-y-4">
                    <p className="text-xs text-white/40 px-1">보관한 프로젝트는 여기에서만 보입니다. 프로젝트 상세에서 보관 해제할 수 있습니다.</p>
                    {archivedProjects.length === 0 ? (
                        <div className="text-center py-16">
                            <Archive className="w-12 h-12 text-white/10 mx-auto mb-3" />
                            <p className="text-white/40 text-sm">보관한 프로젝트가 없습니다</p>
                            <Link href="/my/projects" className="text-primary text-xs mt-2 inline-block hover:underline">프로젝트 목록으로</Link>
                        </div>
                    ) : (
                        <section className="space-y-3">
                            {archivedProjects.map(project => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    userId={user!.id}
                                    myDancerIds={myDancerIds}
                                    isArchived
                                />
                            ))}
                        </section>
                    )}
                </div>
            </div>
        )
    }

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
                            <ProjectCard
                                key={project.id}
                                project={project}
                                userId={user!.id}
                                myDancerIds={myDancerIds}
                            />
                        ))
                    )}
                </section>

                {pastProjects.length > 0 && (
                    <section className="space-y-3">
                        <h2 className="text-sm font-semibold text-white/50 px-1">지난 프로젝트 ({pastProjects.length})</h2>
                        {pastProjects.map(project => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                userId={user!.id}
                                myDancerIds={myDancerIds}
                            />
                        ))}
                    </section>
                )}

                {archivedProjects.length > 0 && (
                    <section className="space-y-3 pt-2 border-t border-neutral-800/50">
                        <Link
                            href="/my/projects?view=archived"
                            className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800 text-white/60 hover:text-white hover:bg-neutral-800/50 transition"
                        >
                            <span className="flex items-center gap-2 text-sm font-medium">
                                <Archive className="w-4 h-4" />
                                보관함
                            </span>
                            <span className="text-xs text-white/40">{archivedProjects.length}개</span>
                        </Link>
                    </section>
                )}
            </div>
        </div>
    )
}

export default function ProjectsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        }>
            <ProjectsPageInner />
        </Suspense>
    )
}

function ProjectCard({ project, userId, myDancerIds, isArchived }: { project: Project; userId: string; myDancerIds: string[]; isArchived?: boolean }) {
    const { confirmation, progress } = getProjectStatuses(project)
    const confirmLabel = CONFIRMATION_LABELS[confirmation] || CONFIRMATION_LABELS.negotiating
    const progressLabel = PROGRESS_LABELS[progress] || PROGRESS_LABELS.idle
    const isOwner = project.owner_id === userId
    const isPm = project.pm_dancer_id != null && myDancerIds.includes(project.pm_dancer_id)
    const proposals = project.proposals || []
    const activeStatuses = ['accepted', 'pending', 'negotiating']

    const uniqueDancerMap = new Map<string, string>()
    for (const p of proposals) {
        const existing = uniqueDancerMap.get(p.dancer_id)
        if (!existing || p.status === 'accepted') {
            uniqueDancerMap.set(p.dancer_id, p.status)
        }
    }
    const acceptedCount = Array.from(uniqueDancerMap.values()).filter(s => s === 'accepted').length
    const totalCount = uniqueDancerMap.size
    const isClientOnly = isOwner && !isPm

    const myProposal = proposals.find((p: any) => myDancerIds.includes(p.dancer_id) && activeStatuses.includes(p.status))
    const pmRevenue = proposals.filter((p: any) => p.dancer_id === project.pm_dancer_id && activeStatuses.includes(p.status)).reduce((a: number, p: any) => a + (p.fee || 0), 0)
    const totalExpense = proposals.filter((p: any) => p.dancer_id !== project.pm_dancer_id && activeStatuses.includes(p.status)).reduce((a: number, p: any) => a + (p.fee || 0), 0)

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
                            {isOwner && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">내 프로젝트</span>
                            )}
                            {isOwner && project.parent_project_id == null && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">브리프</span>
                            )}
                            {isOwner && project.parent_project_id != null && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 font-medium">파생</span>
                            )}
                            {isPm && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-medium">PM</span>
                            )}
                            {!isOwner && !isPm && myProposal && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${myProposal.status === 'accepted'
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : 'bg-yellow-500/10 text-yellow-400'
                                }`}>
                                    {myProposal.status === 'accepted' ? '참여 중' : '제안 검토 중'}
                                </span>
                            )}
                            {!isProjectPublic(project.visibility, project.embargo_date) && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-medium flex items-center gap-0.5">
                                    <EyeOff className="w-2.5 h-2.5" /> 비공개
                                    {isEmbargoActive(project.embargo_date) && <span className="text-[8px] text-red-400 ml-0.5">(엠바고)</span>}
                                </span>
                            )}
                            {isArchived && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 font-medium flex items-center gap-0.5">
                                    <Archive className="w-2.5 h-2.5" /> 보관됨
                                </span>
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
                        <span>{isClientOnly ? `참여 확정 ${acceptedCount}명` : `참여 ${acceptedCount}/${totalCount}명`}</span>
                    </div>
                    {project.start_date && (
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{project.start_date}{project.end_date ? ` ~ ${project.end_date}` : ''}</span>
                        </div>
                    )}
                    <span className="ml-auto">{getRelativeTime(project.created_at)}</span>
                </div>

                {/* PM만 전체 매출/지출, 참여자는 본인 제안 단가만 */}
                {isPm && (pmRevenue > 0 || totalExpense > 0) && (
                    <div className="flex items-center gap-2 text-[10px] text-white/25 pt-1 mt-0.5 border-t border-neutral-800/30">
                        {pmRevenue > 0 && <span className="text-blue-400/50">매출 {pmRevenue.toLocaleString()}</span>}
                        {totalExpense > 0 && <><span>·</span><span className="text-red-400/50">지출 {totalExpense.toLocaleString()}</span></>}
                        <span className={`ml-auto font-medium ${(pmRevenue - totalExpense) >= 0 ? 'text-green-400/50' : 'text-red-400/50'}`}>
                            순익 {(pmRevenue - totalExpense).toLocaleString()}
                        </span>
                    </div>
                )}
                {!isPm && myProposal && (
                    <div className="flex items-center gap-2 text-[10px] text-white/25 pt-1 mt-0.5 border-t border-neutral-800/30">
                        <span className="text-white/40">내 제안 단가</span>
                        <span className={myProposal.fee ? 'text-primary/70 font-medium' : 'text-yellow-400/50'}>
                            {myProposal.fee ? `${(myProposal.fee as number).toLocaleString()}원` : '미정'}
                        </span>
                    </div>
                )}
            </div>
        </Link>
    )
}
