'use client'

import { Suspense, useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    ArrowLeft, Search, X, Check, Loader2, Send, Plus,
    User as UserIcon, FolderOpen, ChevronDown, ChevronUp,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { Dancer } from '@/lib/supabase'

const CATEGORY_OPTIONS = [
    { value: 'choreo', label: '안무 제작' },
    { value: 'broadcast', label: '방송 출연' },
    { value: 'performance', label: '공연' },
    { value: 'workshop', label: '워크샵' },
    { value: 'judge', label: '심사' },
]

const ROLE_PRESETS = ['메인 댄서', '백업 댄서', '공동 안무', '게스트', '디렉터']

export default function NewProposalPageWrapper() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        }>
            <NewProposalPage />
        </Suspense>
    )
}

function NewProposalPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()

    const preselectedDancerId = searchParams.get('dancer_id')
    const preselectedProjectId = searchParams.get('project_id')

    const [sending, setSending] = useState(false)
    const [dataLoading, setDataLoading] = useState(true)

    // Project mode: 'new' or 'existing'
    const [projectMode, setProjectMode] = useState<'new' | 'existing'>(
        preselectedProjectId ? 'existing' : 'new'
    )
    const [selectedProjectId, setSelectedProjectId] = useState(preselectedProjectId || '')
    const [existingProjects, setExistingProjects] = useState<{ id: string; title: string; category: string }[]>([])

    // New project form
    const [projectData, setProjectData] = useState({
        title: '',
        category: 'choreo',
        companyName: '',
        startDate: '',
        endDate: '',
    })

    // Dancer selection
    const [allDancers, setAllDancers] = useState<Dancer[]>([])
    const [selectedDancerIds, setSelectedDancerIds] = useState<Set<string>>(new Set())
    const [dancerSearch, setDancerSearch] = useState('')
    const [showDancerSearch, setShowDancerSearch] = useState(!preselectedDancerId)

    // Proposal terms
    const [fee, setFee] = useState('')
    const [role, setRole] = useState('')
    const [message, setMessage] = useState('')

    // Already proposed dancer IDs for selected project
    const [existingProposalDancerIds, setExistingProposalDancerIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (!authLoading && !user) router.push('/auth/signin')
    }, [user, authLoading, router])

    const fetchData = useCallback(async () => {
        if (!user) return
        setDataLoading(true)
        try {
            const [dancersRes, projectsRes] = await Promise.all([
                supabase.from('dancers').select('*').eq('is_verified', true).order('stage_name'),
                supabase.from('projects').select('id, title, category').eq('owner_id', user.id).order('created_at', { ascending: false }),
            ])

            setAllDancers((dancersRes.data as Dancer[]) || [])
            setExistingProjects(projectsRes.data || [])

            if (preselectedDancerId) {
                setSelectedDancerIds(new Set([preselectedDancerId]))
            }

            if (preselectedProjectId) {
                await fetchExistingProposals(preselectedProjectId)
            }
        } catch (err) {
            console.error('Error loading data:', err)
        } finally {
            setDataLoading(false)
        }
    }, [user, preselectedDancerId, preselectedProjectId])

    useEffect(() => {
        if (user) fetchData()
    }, [user, fetchData])

    const fetchExistingProposals = async (projectId: string) => {
        const { data } = await supabase
            .from('proposals')
            .select('dancer_id')
            .eq('project_id', projectId)
        setExistingProposalDancerIds(new Set((data || []).map(p => p.dancer_id)))
    }

    const handleProjectChange = async (projectId: string) => {
        setSelectedProjectId(projectId)
        if (projectId) {
            await fetchExistingProposals(projectId)
        } else {
            setExistingProposalDancerIds(new Set())
        }
    }

    const filteredDancers = useMemo(() => {
        let results = allDancers
        if (dancerSearch.trim()) {
            const q = dancerSearch.toLowerCase()
            results = results.filter(d =>
                d.stage_name.toLowerCase().includes(q) ||
                d.genres?.some(g => g.toLowerCase().includes(q)) ||
                d.location?.toLowerCase().includes(q)
            )
        }
        return results
    }, [allDancers, dancerSearch])

    const toggleDancer = (id: string) => {
        setSelectedDancerIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const selectedDancersList = useMemo(() => {
        return allDancers.filter(d => selectedDancerIds.has(d.id))
    }, [allDancers, selectedDancerIds])

    const canSubmit = useMemo(() => {
        if (selectedDancerIds.size === 0) return false
        if (projectMode === 'new' && !projectData.title.trim()) return false
        if (projectMode === 'existing' && !selectedProjectId) return false
        return true
    }, [selectedDancerIds, projectMode, projectData.title, selectedProjectId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !canSubmit) return
        setSending(true)

        try {
            let projectId: string

            if (projectMode === 'existing' && selectedProjectId) {
                projectId = selectedProjectId
            } else {
                // Create client profile if company name given
                let clientProfileId: string | null = null
                if (projectData.companyName.trim()) {
                    const { data: existing } = await supabase.from('clients').select('id')
                        .eq('owner_id', user.id).eq('company_name', projectData.companyName.trim()).single()
                    if (existing) {
                        clientProfileId = existing.id
                    } else {
                        const { data: newClient, error: clientErr } = await supabase.from('clients')
                            .insert({ owner_id: user.id, company_name: projectData.companyName.trim(), contact_person: '' })
                            .select('id').single()
                        if (clientErr) throw clientErr
                        clientProfileId = newClient.id
                    }
                }

                const { data: project, error: projectErr } = await supabase.from('projects').insert({
                    owner_id: user.id,
                    client_profile_id: clientProfileId,
                    title: projectData.title.trim(),
                    category: projectData.category,
                    status: 'active',
                    confirmation_status: 'negotiating',
                    progress_status: 'recruiting',
                    visibility: 'private',
                    start_date: projectData.startDate || null,
                    end_date: projectData.endDate || null,
                }).select('id').single()

                if (projectErr) throw projectErr
                projectId = project.id
            }

            // Create proposals
            const proposals = Array.from(selectedDancerIds).map(dancerId => ({
                project_id: projectId,
                dancer_id: dancerId,
                sender_id: user.id,
                fee: fee ? parseInt(fee) : null,
                role: role || '참여 댄서',
                details: message || null,
                status: 'pending',
            }))

            const { error: proposalErr } = await supabase.from('proposals').insert(proposals)
            if (proposalErr) throw proposalErr

            alert(`${selectedDancerIds.size}명의 댄서에게 제안을 보냈습니다!`)
            router.push('/my/proposals?tab=outbox')
        } catch (err: any) {
            alert('오류: ' + err.message)
        } finally {
            setSending(false)
        }
    }

    if (authLoading || dataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    const inputClass = "w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-primary text-sm"
    const labelClass = "block text-sm font-medium text-white/80 mb-1.5"

    return (
        <div className={`min-h-screen bg-background ${selectedDancerIds.size > 0 ? 'pb-48' : 'pb-20'}`}>
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-20">
                <div className="px-5 py-3.5 flex items-center gap-3">
                    <Link href="/my/proposals?tab=outbox">
                        <ArrowLeft className="w-5 h-5 text-white/70" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-white">댄서에게 제안 보내기</h1>
                        <p className="text-white/35 text-[11px]">프로젝트에 댄서를 초대하세요</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-0">
                {/* Section 1: Project */}
                <div className="p-5 border-b border-neutral-800/50">
                    <h2 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">
                        01 프로젝트
                    </h2>

                    {existingProjects.length > 0 && (
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setProjectMode('new')}
                                className={`flex-1 py-2 text-xs font-medium rounded-lg border transition ${projectMode === 'new'
                                    ? 'bg-primary/10 border-primary/30 text-primary'
                                    : 'bg-neutral-900 border-neutral-800 text-white/40'
                                }`}
                            >
                                <Plus className="w-3.5 h-3.5 inline mr-1" />
                                새 프로젝트
                            </button>
                            <button
                                type="button"
                                onClick={() => setProjectMode('existing')}
                                className={`flex-1 py-2 text-xs font-medium rounded-lg border transition ${projectMode === 'existing'
                                    ? 'bg-primary/10 border-primary/30 text-primary'
                                    : 'bg-neutral-900 border-neutral-800 text-white/40'
                                }`}
                            >
                                <FolderOpen className="w-3.5 h-3.5 inline mr-1" />
                                기존 프로젝트
                            </button>
                        </div>
                    )}

                    {projectMode === 'new' ? (
                        <div className="space-y-3">
                            <div>
                                <label className={labelClass}>프로젝트명 *</label>
                                <input
                                    type="text"
                                    value={projectData.title}
                                    onChange={e => setProjectData(p => ({ ...p, title: e.target.value }))}
                                    placeholder="예: 뮤직비디오 안무 제작"
                                    className={inputClass}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>카테고리</label>
                                    <select
                                        value={projectData.category}
                                        onChange={e => setProjectData(p => ({ ...p, category: e.target.value }))}
                                        className={inputClass}
                                    >
                                        {CATEGORY_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>회사/단체</label>
                                    <input
                                        type="text"
                                        value={projectData.companyName}
                                        onChange={e => setProjectData(p => ({ ...p, companyName: e.target.value }))}
                                        placeholder="선택사항"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>시작일</label>
                                    <input
                                        type="date"
                                        value={projectData.startDate}
                                        onChange={e => setProjectData(p => ({ ...p, startDate: e.target.value }))}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>종료일</label>
                                    <input
                                        type="date"
                                        value={projectData.endDate}
                                        onChange={e => setProjectData(p => ({ ...p, endDate: e.target.value }))}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className={labelClass}>프로젝트 선택 *</label>
                            <select
                                value={selectedProjectId}
                                onChange={e => handleProjectChange(e.target.value)}
                                className={inputClass}
                            >
                                <option value="">프로젝트를 선택하세요</option>
                                {existingProjects.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Section 2: Dancer Selection */}
                <div className="p-5 border-b border-neutral-800/50">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-bold text-white/50 uppercase tracking-wider">
                            02 댄서 선택
                            {selectedDancerIds.size > 0 && (
                                <span className="ml-2 text-primary">({selectedDancerIds.size}명)</span>
                            )}
                        </h2>
                        <button
                            type="button"
                            onClick={() => setShowDancerSearch(!showDancerSearch)}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                            {showDancerSearch ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            {showDancerSearch ? '접기' : '댄서 검색'}
                        </button>
                    </div>

                    {/* Selected dancers chips */}
                    {selectedDancersList.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-3">
                            {selectedDancersList.map(d => (
                                <button
                                    key={d.id}
                                    type="button"
                                    onClick={() => toggleDancer(d.id)}
                                    className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/30 rounded-full text-xs text-primary"
                                >
                                    <div className="w-4 h-4 rounded-full bg-neutral-800 overflow-hidden flex-shrink-0">
                                        {d.profile_img ? (
                                            <Image src={d.profile_img} alt="" width={16} height={16} className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <UserIcon className="w-2.5 h-2.5 text-white/20" />
                                            </div>
                                        )}
                                    </div>
                                    {d.stage_name}
                                    <X className="w-3 h-3" />
                                </button>
                            ))}
                        </div>
                    )}

                    {showDancerSearch && (
                        <div className="space-y-2">
                            {/* Search input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type="text"
                                    value={dancerSearch}
                                    onChange={e => setDancerSearch(e.target.value)}
                                    placeholder="이름, 장르, 지역으로 검색..."
                                    className="w-full pl-9 pr-8 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary"
                                />
                                {dancerSearch && (
                                    <button type="button" onClick={() => setDancerSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <X className="w-4 h-4 text-white/30" />
                                    </button>
                                )}
                            </div>

                            {/* Dancer list */}
                            <div className="max-h-64 overflow-y-auto space-y-1 rounded-lg">
                                {filteredDancers.length === 0 ? (
                                    <p className="text-center py-8 text-white/30 text-sm">
                                        {dancerSearch ? '검색 결과가 없습니다' : '등록된 댄서가 없습니다'}
                                    </p>
                                ) : (
                                    filteredDancers.map(dancer => {
                                        const isSelected = selectedDancerIds.has(dancer.id)
                                        const alreadyProposed = existingProposalDancerIds.has(dancer.id)

                                        return (
                                            <button
                                                key={dancer.id}
                                                type="button"
                                                onClick={() => !alreadyProposed && toggleDancer(dancer.id)}
                                                disabled={alreadyProposed}
                                                className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition text-left ${alreadyProposed
                                                    ? 'opacity-40 cursor-not-allowed bg-neutral-900/30'
                                                    : isSelected
                                                        ? 'bg-primary/10 border border-primary/30'
                                                        : 'bg-neutral-900/30 hover:bg-neutral-800/50'
                                                }`}
                                            >
                                                <div className="w-9 h-9 bg-neutral-800 rounded-full overflow-hidden flex-shrink-0 relative">
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
                                                    <div className="flex items-center gap-2">
                                                        {dancer.genres && dancer.genres.length > 0 && (
                                                            <p className="text-[10px] text-white/30 truncate">{dancer.genres.slice(0, 3).join(', ')}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                {alreadyProposed ? (
                                                    <span className="text-[10px] text-white/30 flex-shrink-0">제안 완료</span>
                                                ) : (
                                                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${isSelected
                                                        ? 'border-primary bg-primary'
                                                        : 'border-neutral-600'
                                                    }`}>
                                                        {isSelected && <Check className="w-3 h-3 text-black" />}
                                                    </div>
                                                )}
                                            </button>
                                        )
                                    })
                                )}
                            </div>
                            <p className="text-[10px] text-white/20 text-right">{filteredDancers.length}명의 댄서</p>
                        </div>
                    )}
                </div>

                {/* Section 3: Proposal Terms */}
                <div className="p-5">
                    <h2 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4">
                        03 제안 조건
                    </h2>

                    {/* Role presets */}
                    <div className="flex gap-1.5 flex-wrap mb-3">
                        {ROLE_PRESETS.map(r => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setRole(r)}
                                className={`text-[11px] px-2.5 py-1 rounded-full transition ${role === r
                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                    : 'bg-neutral-800 text-white/40 border border-neutral-700 hover:text-white/60'
                                }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>역할</label>
                                <input
                                    type="text"
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                    placeholder="예: 메인 댄서"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>제안 금액 (원)</label>
                                <input
                                    type="number"
                                    value={fee}
                                    onChange={e => setFee(e.target.value)}
                                    placeholder="선택사항"
                                    className={inputClass}
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>메시지</label>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                rows={3}
                                placeholder="추가 내용이나 요청사항을 입력하세요"
                                className={`${inputClass} resize-none`}
                            />
                        </div>
                    </div>
                </div>
            </form>

            {/* Bottom action bar */}
            <div className="fixed bottom-16 left-0 right-0 bg-neutral-900 border-t border-neutral-800 p-4 pb-5 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
                {selectedDancerIds.size > 0 ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-white/50 px-1">
                            <span>{selectedDancerIds.size}명 선택</span>
                            {fee && <span>인당 {parseInt(fee).toLocaleString()}원</span>}
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={sending || !canSubmit}
                            className="w-full py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {sending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            {sending ? '보내는 중...' : `${selectedDancerIds.size}명에게 제안 보내기`}
                        </button>
                    </div>
                ) : (
                    <p className="text-center text-white/30 text-sm py-1">
                        댄서를 선택하면 제안을 보낼 수 있습니다
                    </p>
                )}
            </div>
        </div>
    )
}

