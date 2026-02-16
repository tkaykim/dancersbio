'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import {
    ArrowLeft, Loader2, Users, Calendar, Edit3, Plus,
    CheckCircle, Clock, XCircle, User as UserIcon, Save, Handshake, Play,
    Eye, EyeOff, ChevronDown, ChevronUp, ShieldAlert, Target, Ban,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getRelativeTime, getProjectStatuses, isEmbargoActive, formatEmbargoDate, getKSTDateString, isProjectPublic } from '@/lib/utils'
import type { Project, ConfirmationStatus, ProgressStatus } from '@/lib/types'
import TaskManager from '@/components/projects/TaskManager'

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

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [project, setProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)
    const [notes, setNotes] = useState('')
    const [editingNotes, setEditingNotes] = useState(false)
    const [savingNotes, setSavingNotes] = useState(false)
    const [showFinance, setShowFinance] = useState(false)
    const [showEmbargoSettings, setShowEmbargoSettings] = useState(false)
    const [editingBasicInfo, setEditingBasicInfo] = useState(false)
    const [basicInfo, setBasicInfo] = useState({ description: '', due_date: '' })

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
                    pm_dancer:dancers!pm_dancer_id (id, stage_name),
                    proposals (id, dancer_id, sender_id, fee, status, role, details, created_at, dancers (id, stage_name, profile_img, genres))
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            setProject(data as any)
            setNotes(data.notes || '')
            setBasicInfo({ description: data.description || '', due_date: data.due_date || '' })
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
        if (value === 'declined' || value === 'cancelled') updates.progress_status = 'cancelled'
        if (value === 'completed') updates.progress_status = 'completed'
        const statusMap: Record<string, string> = {
            negotiating: 'recruiting', confirmed: 'active',
            declined: 'cancelled', cancelled: 'cancelled', completed: 'done',
        }
        updates.status = statusMap[value] || 'recruiting'
        const { error } = await supabase.from('projects').update(updates).eq('id', project.id)
        if (!error) {
            setProject({ ...project, ...updates })
            if (value === 'completed') await generateCareerEntries(project)
        }
    }

    const updateProgress = async (value: ProgressStatus) => {
        if (!project) return
        if (getProjectStatuses(project).confirmation !== 'confirmed') return
        const { error } = await supabase.from('projects').update({ progress_status: value }).eq('id', project.id)
        if (!error) {
            setProject({ ...project, progress_status: value })
            if (value === 'completed') await generateCareerEntries(project)
        }
    }

    const generateCareerEntries = async (proj: Project) => {
        const accepted = (proj.proposals || []).filter(p => p.status === 'accepted')
        const year = proj.start_date ? proj.start_date.substring(0, 4) : new Date().getFullYear().toString()
        const month = proj.start_date ? proj.start_date.substring(5, 7) : ''
        const careerType = proj.category || 'other'
        const careerDate = proj.start_date || new Date().toISOString().split('T')[0]

        const { data: existingCareers } = await supabase
            .from('careers')
            .select('dancer_id')
            .contains('details', { project_id: proj.id })

        const existingDancerIds = new Set((existingCareers || []).map(c => c.dancer_id))

        const CATEGORY_ROLE_MAP: Record<string, string> = {
            choreo: '안무가', broadcast: '출연', performance: '공연', workshop: '워크샵 강사', judge: '심사위원',
        }
        const pmRoleLabel = CATEGORY_ROLE_MAP[proj.category || ''] || 'PM'

        const entries = accepted
            .filter(p => !existingDancerIds.has(p.dancer_id))
            .map(p => {
                const isPm = proj.pm_dancer_id === p.dancer_id
                const baseRole = p.role || '참여'
                const role = isPm ? `${pmRoleLabel} (PM) · ${baseRole}` : baseRole
                return {
                    dancer_id: p.dancer_id, type: careerType, title: proj.title, date: careerDate,
                    details: { year, month, role, description: proj.description || '', project_id: proj.id }
                }
            })

        // PM이 참여자 목록에 없는 경우 (별도 엔트리)
        if (proj.pm_dancer_id && !existingDancerIds.has(proj.pm_dancer_id) && !entries.some(e => e.dancer_id === proj.pm_dancer_id)) {
            entries.push({
                dancer_id: proj.pm_dancer_id, type: careerType, title: proj.title, date: careerDate,
                details: { year, month, role: `${pmRoleLabel} (PM)`, description: proj.description || '', project_id: proj.id }
            })
        }

        if (entries.length === 0) {
            alert(existingCareers && existingCareers.length > 0 ? '이미 경력이 등록되어 있습니다.' : '등록할 참여자가 없습니다.')
            return
        }
        const { error } = await supabase.from('careers').insert(entries)
        if (!error) alert(`${entries.length}명의 참여자에게 경력이 자동 등록되었습니다.`)
    }

    const saveNotes = async () => {
        if (!project) return
        setSavingNotes(true)
        const { error } = await supabase.from('projects').update({ notes }).eq('id', project.id)
        if (!error) { setProject({ ...project, notes }); setEditingNotes(false) }
        setSavingNotes(false)
    }

    const saveBasicInfo = async () => {
        if (!project) return
        setSavingNotes(true)
        const { error } = await supabase.from('projects').update({
            description: basicInfo.description || null,
            due_date: basicInfo.due_date || null,
        }).eq('id', project.id)
        if (!error) {
            setProject({ ...project, description: basicInfo.description || null, due_date: basicInfo.due_date || null })
            setEditingBasicInfo(false)
        }
        setSavingNotes(false)
    }

    const cancelProposal = async (proposalId: string) => {
        if (!confirm('이 제안을 취소하시겠습니까?\n취소된 제안은 복구할 수 없습니다.')) return
        const { error } = await supabase.from('proposals').update({ status: 'cancelled' }).eq('id', proposalId)
        if (!error) {
            alert('제안이 취소되었습니다.')
            fetchProject()
        } else {
            alert('오류가 발생했습니다.')
        }
    }

    const setProjectPm = async (dancerId: string) => {
        if (!project) return
        const { error } = await supabase.from('projects').update({ pm_dancer_id: dancerId }).eq('id', project.id)
        if (!error) {
            setProject({ ...project, pm_dancer_id: dancerId })
            fetchProject()
        } else {
            alert('PM 지정에 실패했습니다.')
        }
    }

    const [myDancerIds, setMyDancerIds] = useState<string[]>([])
    useEffect(() => {
        if (!user) return
        supabase.from('dancers').select('id').or(`owner_id.eq.${user.id},manager_id.eq.${user.id}`)
            .then(({ data }) => setMyDancerIds((data || []).map((d: { id: string }) => d.id)))
    }, [user])

    const myProposal = useMemo(() => {
        if (!project?.proposals) return null
        return project.proposals.find(p => myDancerIds.includes(p.dancer_id)) || null
    }, [project, myDancerIds])

    if (authLoading || loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
    }
    if (!project || !user) return null

    const isOwner = project.owner_id === user.id
    const isPm = project.pm_dancer_id != null && myDancerIds.includes(project.pm_dancer_id)
    const canManageProject = isOwner || isPm
    const { confirmation, progress } = getProjectStatuses(project)
    const confirmInfo = CONFIRMATION_OPTIONS.find(o => o.value === confirmation) || CONFIRMATION_OPTIONS[0]
    const progressInfo = PROGRESS_OPTIONS.find(o => o.value === progress) || PROGRESS_OPTIONS[0]

    const deduplicatedProposals = (() => {
        const map = new Map<string, any>()
        const pri: Record<string, number> = { accepted: 0, negotiating: 1, pending: 2, declined: 3 }
        for (const p of project.proposals || []) {
            const ex = map.get(p.dancer_id)
            if (!ex || (pri[p.status] ?? 9) < (pri[ex.status] ?? 9)) map.set(p.dancer_id, p)
        }
        return Array.from(map.values())
    })()

    const acceptedProposals = deduplicatedProposals.filter(p => p.status === 'accepted')
    const pendingProposals = deduplicatedProposals.filter(p => p.status === 'pending' || p.status === 'negotiating')
    const declinedProposals = deduplicatedProposals.filter(p => p.status === 'declined')
    const canRecruit = confirmation === 'confirmed' && progress === 'recruiting'

    const embargoActive = isEmbargoActive(project.embargo_date)
    const effectivelyPublic = isProjectPublic(project.visibility, project.embargo_date)

    const allActiveProposals = deduplicatedProposals.filter(p => p.status === 'accepted' || p.status === 'pending' || p.status === 'negotiating')
    const pmRevenue = allActiveProposals.filter((p: any) => p.dancer_id === project.pm_dancer_id).reduce((a: number, p: any) => a + (p.fee || 0), 0)
    const totalExpense = allActiveProposals.filter((p: any) => p.dancer_id !== project.pm_dancer_id).reduce((a: number, p: any) => a + (p.fee || 0), 0)
    const netProfit = pmRevenue - totalExpense

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-10">
                <div className="px-5 py-3.5 flex items-center gap-3">
                    <Link href="/my/projects"><ArrowLeft className="w-5 h-5 text-white/70" /></Link>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-base font-bold text-white truncate">{project.title}</h1>
                            {/* 비공개/엠바고 인디케이터 (헤더에 컴팩트하게) */}
                            {!effectivelyPublic && (
                                <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 shrink-0">
                                    <EyeOff className="w-2.5 h-2.5" />
                                    {embargoActive ? '엠바고' : '비공개'}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            {project.clients?.company_name && (
                                <span className="text-[11px] text-white/35">{project.clients.company_name}</span>
                            )}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${confirmInfo.color}`}>{confirmInfo.label}</span>
                            {confirmation === 'confirmed' && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${progressInfo.color}`}>{progressInfo.label}</span>
                            )}
                            {project.category && (
                                <span className="text-[10px] text-white/30">{CATEGORY_LABELS[project.category] || project.category}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* ── 프로젝트 기본 정보 ── */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-white/40">프로젝트 정보</h3>
                        {canManageProject && !editingBasicInfo && (
                            <button onClick={() => setEditingBasicInfo(true)} className="text-[11px] text-primary/70 hover:text-primary">편집</button>
                        )}
                        {canManageProject && editingBasicInfo && (
                            <button onClick={saveBasicInfo} disabled={savingNotes} className="text-[11px] text-primary hover:underline flex items-center gap-1">
                                {savingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} 저장
                            </button>
                        )}
                    </div>
                    {editingBasicInfo ? (
                        <div className="space-y-2">
                            <textarea
                                value={basicInfo.description}
                                onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                                rows={2}
                                placeholder="프로젝트 설명"
                                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary resize-none"
                            />
                            <div>
                                <label className="text-[11px] text-white/40 mb-1 block">마감일</label>
                                <input
                                    type="date"
                                    value={basicInfo.due_date}
                                    onChange={(e) => setBasicInfo({ ...basicInfo, due_date: e.target.value })}
                                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {project.description ? (
                                <p className="text-sm text-white/50 leading-relaxed">{project.description}</p>
                            ) : (
                                <p className="text-xs text-white/20">설명 없음</p>
                            )}
                            <div className="flex flex-wrap gap-3 text-xs text-white/35">
                                {project.start_date && (
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{project.start_date}{project.end_date ? ` ~ ${project.end_date}` : ''}</span>
                                )}
                                {project.due_date && (
                                    <span className="flex items-center gap-1 text-red-400/50"><Target className="w-3 h-3" />마감 {project.due_date}</span>
                                )}
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" />확정 {acceptedProposals.length}명</span>
                                {pendingProposals.length > 0 && <span className="text-yellow-400/50">대기 {pendingProposals.length}</span>}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── 오너 전용: PM 미지정 시 참여 확정 댄서 중 PM 지정 ── */}
                {isOwner && !project.pm_dancer_id && acceptedProposals.length > 0 && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                        <p className="text-xs font-medium text-amber-200/90 mb-2">프로젝트 PM 지정</p>
                        <p className="text-[11px] text-white/50 mb-2">댄서 초대·할일 관리는 PM에게도 열립니다. 참여 확정 댄서 중 한 명을 PM으로 지정하세요.</p>
                        <select
                            defaultValue=""
                            onChange={(e) => { const v = e.target.value; if (v) setProjectPm(v) }}
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-primary"
                        >
                            <option value="">PM 선택...</option>
                            {acceptedProposals.map((p: any) => (
                                <option key={p.id} value={p.dancer_id}>
                                    {p.dancers?.stage_name ?? '댄서'} (참여 확정)
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* ── 댄서 초대 (오너 또는 PM) ── */}
                {canRecruit && canManageProject && (
                    <Link href={`/my/projects/${project.id}/invite`}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition">
                        <Plus className="w-5 h-5" /> 댄서 초대하기
                    </Link>
                )}

                {/* ── 할일 관리 (오너 또는 PM) ── */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                    <TaskManager projectId={project.id} isOwner={canManageProject} myDancerIds={myDancerIds} />
                </div>

                {/* ── 참여자 시점: 내 참여 정보 (제안받은 단가만 표시) ── */}
                {myProposal && (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
                        <h3 className="text-xs font-semibold text-white/50">나의 참여 정보</h3>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                                {myProposal.role && <span className="text-white/70">{myProposal.role}</span>}
                                <span className={`text-xs font-semibold ${myProposal.status === 'accepted' ? 'text-green-400' : myProposal.status === 'declined' ? 'text-red-400' : 'text-yellow-400'}`}>
                                    {myProposal.status === 'accepted' ? '수락됨' : myProposal.status === 'declined' ? '거절됨' : '대기 중'}
                                </span>
                            </div>
                            {myProposal.fee
                                ? <span className="text-primary font-bold">{myProposal.fee.toLocaleString()}원</span>
                                : <span className="text-yellow-400/60 text-xs">금액 미정</span>
                            }
                        </div>
                        {myProposal.details && <p className="text-xs text-white/30 pt-1 border-t border-neutral-800">{myProposal.details}</p>}
                        {(myProposal.status === 'pending' || myProposal.status === 'negotiating') && (
                            <ParticipantActions proposalId={myProposal.id} projectId={project.id} dancerId={myProposal.dancer_id} onUpdate={fetchProject} />
                        )}
                    </div>
                )}

                {/* ── 참여 댄서 목록 ── */}
                <section className="space-y-2">
                    <h2 className="text-xs font-semibold text-white/40 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                        참여 확정 ({acceptedProposals.length})
                    </h2>
                    {acceptedProposals.length === 0 ? (
                        <p className="text-xs text-white/20 py-3 text-center">아직 참여 확정된 댄서가 없습니다</p>
                    ) : (
                        <div className="space-y-1.5">
                            {acceptedProposals.map(p => <DancerRow key={p.id} proposal={p} showFee={isPm} />)}
                        </div>
                    )}
                </section>

                {/* 대기 중 */}
                {canManageProject && pendingProposals.length > 0 && (
                    <section className="space-y-2">
                        <h2 className="text-xs font-semibold text-white/40 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-yellow-400" />
                            응답 대기 ({pendingProposals.length})
                        </h2>
                        <div className="space-y-1.5">
                            {pendingProposals.map(p => <DancerRow key={p.id} proposal={p} showFee={isPm} showCancelButton={true} onCancel={() => cancelProposal(p.id)} />)}
                        </div>
                    </section>
                )}

                {/* 거절 */}
                {canManageProject && declinedProposals.length > 0 && (
                    <section className="space-y-2 opacity-40">
                        <h2 className="text-xs font-semibold text-white/40 flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5 text-red-400" /> 거절 ({declinedProposals.length})
                        </h2>
                        <div className="space-y-1.5">
                            {declinedProposals.map(p => <DancerRow key={p.id} proposal={p} showFee={isPm} />)}
                        </div>
                    </section>
                )}

                {/* ── 안내 메시지 ── */}
                {canManageProject && confirmation === 'confirmed' && progress !== 'recruiting' && progress !== 'completed' && progress !== 'cancelled' && (
                    <p className="text-xs text-white/25 text-center py-2">진행 상태를 &apos;모집 중&apos;으로 변경하면 댄서를 초대할 수 있습니다</p>
                )}
                {canManageProject && confirmation === 'negotiating' && (
                    <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-lg p-3 text-center">
                        <p className="text-xs text-yellow-400/70">클라이언트와 협상 중 — 확정 후 댄서 모집 가능</p>
                    </div>
                )}

                {/* ── 오너/PM: 상태 관리 ── */}
                {canManageProject && (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 space-y-3">
                        <div>
                            <p className="text-[11px] text-white/30 mb-1.5 flex items-center gap-1">
                                <Handshake className="w-3 h-3" /> 확정 상태
                            </p>
                            <div className="flex gap-1 flex-wrap">
                                {CONFIRMATION_OPTIONS.map(opt => (
                                    <button key={opt.value} onClick={() => updateConfirmation(opt.value)}
                                        className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition ${confirmation === opt.value
                                            ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-neutral-800 text-white/30 hover:text-white/50'}`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {confirmation === 'confirmed' && (
                            <div className="pt-2 border-t border-neutral-800/50">
                                <p className="text-[11px] text-white/30 mb-1.5 flex items-center gap-1">
                                    <Play className="w-3 h-3" /> 진행 상태
                                </p>
                                <div className="flex gap-1 flex-wrap">
                                    {PROGRESS_OPTIONS.filter(o => o.value !== 'idle').map(opt => (
                                        <button key={opt.value} onClick={() => updateProgress(opt.value)}
                                            className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition ${progress === opt.value
                                                ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-neutral-800 text-white/30 hover:text-white/50'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── 오너/PM: 메모 ── */}
                {canManageProject && (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-semibold text-white/40 flex items-center gap-1.5">
                                <Edit3 className="w-3 h-3" /> 메모
                            </h3>
                            {!editingNotes ? (
                                <button onClick={() => setEditingNotes(true)} className="text-[11px] text-primary/70 hover:text-primary">편집</button>
                            ) : (
                                <button onClick={saveNotes} disabled={savingNotes} className="text-[11px] text-primary hover:underline flex items-center gap-1">
                                    {savingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} 저장
                                </button>
                            )}
                        </div>
                        {editingNotes ? (
                            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
                                placeholder="리허설 일정, 의상, 동선 등..."
                                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-primary resize-none" />
                        ) : (
                            notes ? <p className="text-sm text-white/50 whitespace-pre-wrap">{notes}</p>
                                : <p className="text-xs text-white/15">메모 없음</p>
                        )}
                    </div>
                )}

                {/* ── PM만: 전체 매출/지출 재무 요약 (접힘식) ── */}
                {isPm && (
                    <div className="bg-neutral-900/70 border border-neutral-800/50 rounded-xl overflow-hidden">
                        <button onClick={() => setShowFinance(!showFinance)}
                            className="w-full px-3 py-2.5 flex items-center justify-between text-xs hover:bg-neutral-800/30 transition">
                            <span className="text-white/40 font-medium">재무</span>
                            <div className="flex items-center gap-3">
                                {pmRevenue > 0 && <span className="text-blue-400/70">매출 {pmRevenue.toLocaleString()}</span>}
                                {totalExpense > 0 && <span className="text-red-400/60">지출 {totalExpense.toLocaleString()}</span>}
                                {(pmRevenue > 0 || totalExpense > 0) && (
                                    <span className={`font-semibold ${netProfit >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                                        순익 {netProfit.toLocaleString()}
                                    </span>
                                )}
                                {pmRevenue === 0 && totalExpense === 0 && <span className="text-white/30">내역 없음</span>}
                                {showFinance ? <ChevronUp className="w-3.5 h-3.5 text-white/20" /> : <ChevronDown className="w-3.5 h-3.5 text-white/20" />}
                            </div>
                        </button>
                        {showFinance && (
                            <FinanceDetails
                                contractAmount={project.contract_amount}
                                acceptedProposals={acceptedProposals}
                                pendingProposals={pendingProposals}
                                projectPmDancerId={project.pm_dancer_id}
                            />
                        )}
                    </div>
                )}

                {/* ── 오너 전용: 공개/엠바고 (접힘식) ── */}
                {isOwner && (
                    <div className="bg-neutral-900/70 border border-neutral-800/50 rounded-xl overflow-hidden">
                        <button onClick={() => setShowEmbargoSettings(!showEmbargoSettings)}
                            className="w-full px-3 py-2.5 flex items-center justify-between text-xs hover:bg-neutral-800/30 transition">
                            <span className="text-white/40 font-medium flex items-center gap-1.5">
                                {embargoActive ? <ShieldAlert className="w-3 h-3 text-red-400" /> : <EyeOff className="w-3 h-3 text-white/30" />}
                                공개 설정
                            </span>
                            <div className="flex items-center gap-2">
                                <span className={`font-semibold ${effectivelyPublic ? 'text-green-400/70' : 'text-orange-400/70'}`}>
                                    {effectivelyPublic ? '공개' : embargoActive ? `엠바고 ~${project.embargo_date}` : '비공개'}
                                </span>
                                {showEmbargoSettings ? <ChevronUp className="w-3.5 h-3.5 text-white/20" /> : <ChevronDown className="w-3.5 h-3.5 text-white/20" />}
                            </div>
                        </button>
                        {showEmbargoSettings && <EmbargoPanel project={project} onUpdate={fetchProject} />}
                    </div>
                )}
            </div>
        </div>
    )
}

/* ─── 재무 상세 (PM 전용, 접힘 패널) ─── */
function FinanceDetails({
    contractAmount,
    acceptedProposals,
    pendingProposals,
    projectPmDancerId,
}: {
    contractAmount: number | null
    acceptedProposals: any[]
    pendingProposals: any[]
    projectPmDancerId: string | null
}) {
    const pmIncomeConfirmed = acceptedProposals.filter((p: any) => p.dancer_id === projectPmDancerId).reduce((a: number, p: any) => a + (p.fee || 0), 0)
    const pmIncomePending = pendingProposals.filter((p: any) => p.dancer_id === projectPmDancerId).reduce((a: number, p: any) => a + (p.fee || 0), 0)
    const expenseConfirmed = acceptedProposals.filter((p: any) => p.dancer_id !== projectPmDancerId).reduce((a: number, p: any) => a + (p.fee || 0), 0)
    const expensePending = pendingProposals.filter((p: any) => p.dancer_id !== projectPmDancerId).reduce((a: number, p: any) => a + (p.fee || 0), 0)
    const totalIncome = pmIncomeConfirmed + pmIncomePending
    const totalExpense = expenseConfirmed + expensePending
    const undecided = [...acceptedProposals, ...pendingProposals].filter((p: any) => !p.fee).length

    return (
        <div className="px-3 pb-3 space-y-1.5 text-xs border-t border-neutral-800/30">
            {contractAmount != null && contractAmount > 0 && (
                <div className="flex justify-between pt-2">
                    <span className="text-white/30">프로젝트 계약금 (참고)</span>
                    <span className="text-white/50">{contractAmount.toLocaleString()}원</span>
                </div>
            )}
            <div className="flex justify-between pt-2">
                <span className="text-white/30">PM 매출 (확정)</span>
                <span className="text-blue-400/80">{pmIncomeConfirmed > 0 ? `+${pmIncomeConfirmed.toLocaleString()}원` : '-'}</span>
            </div>
            {pmIncomePending > 0 && (
                <div className="flex justify-between">
                    <span className="text-white/30">PM 매출 (대기)</span>
                    <span className="text-yellow-400/60">+{pmIncomePending.toLocaleString()}원</span>
                </div>
            )}
            <div className="flex justify-between">
                <span className="text-white/30">참여자 지출 (확정)</span>
                <span className="text-red-400/70">{expenseConfirmed > 0 ? `-${expenseConfirmed.toLocaleString()}원` : '-'}</span>
            </div>
            {expensePending > 0 && (
                <div className="flex justify-between">
                    <span className="text-white/30">참여자 지출 (대기)</span>
                    <span className="text-yellow-400/60">-{expensePending.toLocaleString()}원</span>
                </div>
            )}
            {(totalIncome > 0 || totalExpense > 0) && (
                <div className="flex justify-between pt-1 border-t border-neutral-800/30">
                    <span className="text-white/40 font-medium">순수익</span>
                    <span className={`font-bold ${(totalIncome - totalExpense) >= 0 ? 'text-green-400/80' : 'text-red-400/80'}`}>
                        {(totalIncome - totalExpense).toLocaleString()}원
                    </span>
                </div>
            )}
            {undecided > 0 && <p className="text-[10px] text-yellow-400/40 pt-1">금액 미정 {undecided}건 — 확정 시 합계에 반영</p>}
        </div>
    )
}

/* ─── 엠바고/공개 패널 (접힘) ─── */
function EmbargoPanel({ project, onUpdate }: { project: Project; onUpdate: () => void }) {
    const [updating, setUpdating] = useState(false)
    const [embargoInput, setEmbargoInput] = useState(project.embargo_date || '')

    const embargoActive = isEmbargoActive(project.embargo_date)
    const effectivelyPublic = isProjectPublic(project.visibility, project.embargo_date)

    const toggleVisibility = async () => {
        if (project.visibility !== 'public' && embargoActive) {
            const formatted = project.embargo_date ? formatEmbargoDate(project.embargo_date) : ''
            alert(`엠바고 기간 중입니다. ${formatted}(KST)까지 비공개가 유지됩니다.`)
            return
        }
        const newVis = project.visibility === 'public' ? 'private' : 'public'
        const msg = newVis === 'public'
            ? '프로젝트를 공개합니다. 관련 경력이 프로필에 표시됩니다.'
            : '프로젝트를 비공개합니다. 경력이 프로필에서 숨겨집니다.'
        if (!confirm(msg)) return
        setUpdating(true)
        const { error } = await supabase.from('projects').update({ visibility: newVis }).eq('id', project.id)
        setUpdating(false)
        if (!error) onUpdate()
    }

    const saveEmbargo = async () => {
        if (!embargoInput) {
            if (!confirm('엠바고를 해제하시겠습니까?')) return
            setUpdating(true)
            const { error } = await supabase.from('projects').update({ embargo_date: null }).eq('id', project.id)
            setUpdating(false)
            if (!error) onUpdate()
            return
        }
        if (embargoInput <= getKSTDateString()) { alert('오늘(KST) 이후 날짜만 가능합니다.'); return }

        const formatted = formatEmbargoDate(embargoInput)
        if (!confirm(
            `엠바고: ${formatted} 23:59(KST)까지 비공개\n` +
            `다음날 00:00(KST)부터 자동 공개\n\n` +
            `* 모든 시각은 한국시각(KST) 기준\n\n설정하시겠습니까?`
        )) return

        setUpdating(true)
        const { error } = await supabase.from('projects').update({ embargo_date: embargoInput, visibility: 'private' }).eq('id', project.id)
        setUpdating(false)
        if (!error) onUpdate()
    }

    return (
        <div className="px-3 pb-3 space-y-3 border-t border-neutral-800/30 pt-2">
            {/* 토글 */}
            <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">
                    현재: <span className={effectivelyPublic ? 'text-green-400' : 'text-orange-400'}>{effectivelyPublic ? '공개' : '비공개'}</span>
                </span>
                <button onClick={toggleVisibility} disabled={updating || embargoActive}
                    className={`text-[11px] px-3 py-1.5 rounded-lg font-medium transition ${
                        effectivelyPublic ? 'bg-orange-500/10 text-orange-400' : embargoActive ? 'bg-neutral-800 text-white/15 cursor-not-allowed' : 'bg-green-500/10 text-green-400'
                    }`}>
                    {updating ? '...' : effectivelyPublic ? '비공개로' : embargoActive ? '엠바고 중' : '공개로'}
                </button>
            </div>

            {/* 엠바고 상태 */}
            {embargoActive && project.embargo_date && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
                    <p className="text-[11px] text-red-400/80">
                        엠바고: {formatEmbargoDate(project.embargo_date)} 23:59(KST)까지 비공개 → 다음날 자동 공개
                    </p>
                </div>
            )}
            {!embargoActive && project.embargo_date && (
                <p className="text-[11px] text-green-400/50">엠바고 해제됨 ({formatEmbargoDate(project.embargo_date)} 만료)</p>
            )}

            {/* 엠바고 날짜 변경 */}
            <div className="flex gap-2">
                <input type="date" value={embargoInput} onChange={(e) => setEmbargoInput(e.target.value)}
                    min={getKSTDateString()}
                    className="flex-1 px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white focus:outline-none focus:border-primary" />
                <button onClick={saveEmbargo} disabled={updating || embargoInput === (project.embargo_date || '')}
                    className="px-3 py-1.5 bg-neutral-800 text-white/50 rounded-lg text-[11px] font-medium hover:text-white transition disabled:opacity-30">
                    {updating ? '...' : '적용'}
                </button>
            </div>
            {project.embargo_date && (
                <button onClick={async () => {
                    if (!confirm('엠바고를 해제하시겠습니까?')) return
                    setUpdating(true)
                    const { error } = await supabase.from('projects').update({ embargo_date: null }).eq('id', project.id)
                    setUpdating(false)
                    if (!error) { setEmbargoInput(''); onUpdate() }
                }} disabled={updating} className="text-[10px] text-red-400/40 hover:text-red-400">
                    엠바고 해제
                </button>
            )}
            <p className="text-[9px] text-white/15">모든 시각은 한국시각(KST, UTC+9) 기준</p>
        </div>
    )
}

/* ─── 댄서 행 ─── */
function DancerRow({ 
    proposal, 
    showFee, 
    showCancelButton = false,
    onCancel 
}: { 
    proposal: any
    showFee: boolean
    showCancelButton?: boolean
    onCancel?: () => void
}) {
    const dancer = proposal.dancers
    const statusInfo = PROPOSAL_STATUS_ICON[proposal.status] || PROPOSAL_STATUS_ICON.pending
    const StatusIcon = statusInfo.icon

    const [cancelling, setCancelling] = useState(false)

    const handleCancel = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (cancelling || !onCancel) return
        setCancelling(true)
        await onCancel()
        setCancelling(false)
    }

    return (
        <div className="bg-neutral-900/40 border border-neutral-800/40 rounded-lg overflow-hidden">
            <Link href={`/profile/${dancer.id}`} className="block">
                <div className="px-3 py-2.5 flex items-center gap-2.5 hover:bg-neutral-800/30 transition">
                    <div className="w-8 h-8 bg-neutral-800 rounded-full overflow-hidden flex-shrink-0 relative">
                        {dancer.profile_img ? (
                            <Image src={dancer.profile_img} alt={dancer.stage_name} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center"><UserIcon className="w-3.5 h-3.5 text-white/20" /></div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{dancer.stage_name}</p>
                        {dancer.genres && dancer.genres.length > 0 && (
                            <p className="text-[10px] text-white/25 truncate">{dancer.genres.slice(0, 3).join(', ')}</p>
                        )}
                    </div>
                    {proposal.role && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 shrink-0">{proposal.role}</span>}
                    {showFee && (
                        proposal.fee ? <span className="text-[11px] text-white/40 shrink-0">{proposal.fee.toLocaleString()}</span>
                            : <span className="text-[10px] text-yellow-400/40 shrink-0">미정</span>
                    )}
                    <StatusIcon className={`w-3.5 h-3.5 shrink-0 ${statusInfo.color}`} />
                </div>
            </Link>
            {showCancelButton && onCancel && (
                <div className="border-t border-neutral-800/40 px-3 py-1.5">
                    <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="w-full py-1.5 text-xs text-red-400/60 hover:text-red-400 hover:bg-red-400/5 rounded transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                        {cancelling ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                        제안 취소
                    </button>
                </div>
            )}
        </div>
    )
}

/* ─── 참여자 액션 ─── */
function ParticipantActions({ proposalId, projectId, dancerId, onUpdate }: { proposalId: string; projectId: string; dancerId: string; onUpdate: () => void }) {
    const [acting, setActing] = useState(false)
    const handleAction = async (action: 'accepted' | 'declined') => {
        if (acting) return
        if (!confirm(action === 'accepted' ? '수락하시겠습니까?' : '거절하시겠습니까?')) return
        setActing(true)
        try {
            const { error } = await supabase.from('proposals').update({ status: action }).eq('id', proposalId)
            if (error) throw error

            // 수락 시 자동 PM 지정 + 프로젝트 상태 전환
            if (action === 'accepted') {
                const { data: proj } = await supabase.from('projects').select('pm_dancer_id, confirmation_status').eq('id', projectId).single()
                if (proj) {
                    const updates: Record<string, any> = {}
                    if (!proj.pm_dancer_id) updates.pm_dancer_id = dancerId
                    if (proj.confirmation_status === 'negotiating') {
                        updates.confirmation_status = 'confirmed'
                        updates.progress_status = 'recruiting'
                    }
                    if (Object.keys(updates).length > 0) {
                        await supabase.from('projects').update(updates).eq('id', projectId)
                    }
                }
            }

            onUpdate()
        } catch { alert('오류가 발생했습니다.') } finally { setActing(false) }
    }
    return (
        <div className="flex gap-2 pt-2 border-t border-neutral-800">
            <button onClick={() => handleAction('declined')} disabled={acting}
                className="flex-1 py-2 text-xs font-semibold text-red-400 bg-red-500/10 rounded-lg">거절</button>
            <button onClick={() => handleAction('accepted')} disabled={acting}
                className="flex-1 py-2 text-xs font-bold text-black bg-primary rounded-lg flex items-center justify-center gap-1">
                {acting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} 수락
            </button>
        </div>
    )
}
