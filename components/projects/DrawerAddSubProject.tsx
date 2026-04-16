'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, Loader2, Send, User as UserIcon, Plus } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import Drawer from '@/components/ui/Drawer'
import type { Dancer } from '@/lib/supabase'

const TITLE_PRESETS = ['시안 제작', '시안 수정', '디렉팅', '출연', '안무 제작', '워크샵']

const ROLE_PRESETS = [
    '안무가', '메인 댄서', '백업 댄서', '디렉터', '공동 안무', '게스트', '참여 댄서',
]

interface DrawerAddSubProjectProps {
    isOpen: boolean
    onClose: () => void
    parentProject: {
        id: string
        owner_id: string
        client_profile_id: string | null
        category: string | null
        title: string
    }
    onSuccess: () => void
}

type Step = 'info' | 'dancer' | 'proposal'

export default function DrawerAddSubProject({
    isOpen, onClose, parentProject, onSuccess,
}: DrawerAddSubProjectProps) {
    const { user } = useAuth()
    const [step, setStep] = useState<Step>('info')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const [title, setTitle] = useState('')
    const [customTitle, setCustomTitle] = useState('')
    const [budget, setBudget] = useState('')
    const [description, setDescription] = useState('')

    const [allDancers, setAllDancers] = useState<Dancer[]>([])
    const [loadingDancers, setLoadingDancers] = useState(false)
    const [dancerSearch, setDancerSearch] = useState('')
    const [selectedDancerId, setSelectedDancerId] = useState<string | null>(null)
    const [proposalRole, setProposalRole] = useState('안무가')
    const [proposalFee, setProposalFee] = useState('')
    const [proposalDetails, setProposalDetails] = useState('')

    useEffect(() => {
        if (isOpen) {
            setStep('info')
            setTitle('')
            setCustomTitle('')
            setBudget('')
            setDescription('')
            setSelectedDancerId(null)
            setDancerSearch('')
            setProposalRole('안무가')
            setProposalFee('')
            setProposalDetails('')
            setError('')
        }
    }, [isOpen])

    const fetchDancers = useCallback(async () => {
        setLoadingDancers(true)
        try {
            const { data, error: err } = await supabase
                .from('dancers')
                .select('*')
                .eq('is_verified', true)
                .order('stage_name')
            if (err) throw err
            setAllDancers((data as Dancer[]) || [])
        } catch {
            setAllDancers([])
        } finally {
            setLoadingDancers(false)
        }
    }, [])

    useEffect(() => {
        if (isOpen && step === 'dancer' && allDancers.length === 0) {
            fetchDancers()
        }
    }, [isOpen, step, allDancers.length, fetchDancers])

    const filteredDancers = useMemo(() => {
        if (!dancerSearch.trim()) return allDancers
        const q = dancerSearch.toLowerCase()
        return allDancers.filter(
            d => d.stage_name.toLowerCase().includes(q) ||
                d.genres?.some(g => g.toLowerCase().includes(q)) ||
                d.location?.toLowerCase().includes(q)
        )
    }, [allDancers, dancerSearch])

    const selectedDancer = useMemo(
        () => allDancers.find(d => d.id === selectedDancerId) ?? null,
        [allDancers, selectedDancerId]
    )

    const effectiveTitle = title === '기타' ? customTitle : title

    const handleGoToDancer = () => {
        if (!effectiveTitle.trim()) return
        setStep('dancer')
    }

    const handleSkipDancer = async () => {
        await createSubProject(null)
    }

    const handleSelectDancer = (id: string) => {
        setSelectedDancerId(prev => prev === id ? null : id)
    }

    const handleGoToProposal = () => {
        if (!selectedDancerId) return
        setStep('proposal')
    }

    const handleSubmitWithProposal = async () => {
        if (!selectedDancerId) return
        await createSubProject(selectedDancerId)
    }

    const createSubProject = async (dancerId: string | null) => {
        if (!user || !effectiveTitle.trim()) return
        setError('')
        setSaving(true)
        try {
            const { data: created, error: insertErr } = await supabase
                .from('projects')
                .insert({
                    parent_project_id: parentProject.id,
                    owner_id: parentProject.owner_id,
                    client_profile_id: parentProject.client_profile_id,
                    category: parentProject.category,
                    title: effectiveTitle.trim(),
                    budget: budget ? parseInt(budget, 10) : null,
                    description: description.trim() || null,
                    confirmation_status: 'negotiating',
                    progress_status: 'idle',
                    visibility: 'private',
                })
                .select('id')
                .single()

            if (insertErr) throw insertErr

            if (dancerId && created) {
                const { data: proposal, error: propErr } = await supabase
                    .from('proposals')
                    .insert({
                        project_id: created.id,
                        dancer_id: dancerId,
                        sender_id: user.id,
                        role: proposalRole || '안무가',
                        fee: proposalFee ? parseInt(proposalFee, 10) : null,
                        details: proposalDetails.trim() || null,
                        status: 'pending',
                    })
                    .select('id')
                    .single()

                if (propErr) throw propErr
                if (proposal) {
                    const { triggerPushEvent } = await import('@/lib/trigger-push-event')
                    triggerPushEvent('proposal_created', { proposal_id: proposal.id })
                }
            }

            onSuccess()
            onClose()
        } catch (err: any) {
            setError(err.message ?? '서브 프로젝트 생성에 실패했습니다.')
        } finally {
            setSaving(false)
        }
    }

    const inputClass =
        'w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-primary'

    const stepTitle = step === 'info'
        ? '서브 프로젝트 추가'
        : step === 'dancer'
            ? '담당 안무가 선택'
            : '제안 내용 입력'

    return (
        <Drawer isOpen={isOpen} onClose={onClose} title={stepTitle}>
            <div className="space-y-4">
                <p className="text-white/60 text-sm">{parentProject.title}</p>

                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {step === 'info' && (
                    <>
                        <div>
                            <label className="block text-xs text-white/50 mb-2">유형 선택</label>
                            <div className="flex flex-wrap gap-1.5">
                                {TITLE_PRESETS.map(preset => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => setTitle(preset)}
                                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${title === preset
                                            ? 'bg-primary/20 text-primary border border-primary/40'
                                            : 'bg-neutral-800 text-white/50 border border-neutral-700 hover:text-white/70'
                                            }`}
                                    >
                                        {preset}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setTitle('기타')}
                                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${title === '기타'
                                        ? 'bg-primary/20 text-primary border border-primary/40'
                                        : 'bg-neutral-800 text-white/50 border border-neutral-700 hover:text-white/70'
                                        }`}
                                >
                                    직접 입력
                                </button>
                            </div>
                        </div>

                        {title === '기타' && (
                            <div>
                                <label className="block text-xs text-white/50 mb-1">서브 프로젝트 제목</label>
                                <input
                                    type="text"
                                    value={customTitle}
                                    onChange={e => setCustomTitle(e.target.value)}
                                    placeholder="예: MV 촬영, 리허설 등"
                                    className={inputClass}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs text-white/50 mb-1">예산 (원, 선택)</label>
                            <input
                                type="number"
                                value={budget}
                                onChange={e => setBudget(e.target.value)}
                                placeholder="예: 5000000"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-white/50 mb-1">설명 (선택)</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={2}
                                placeholder="서브 프로젝트에 대한 간단한 설명"
                                className={inputClass + ' resize-none'}
                            />
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-neutral-800">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-lg border border-neutral-700 text-white/80 text-sm"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleGoToDancer}
                                disabled={!effectiveTitle.trim()}
                                className="flex-1 py-2.5 rounded-lg bg-primary text-black font-medium text-sm disabled:opacity-40"
                            >
                                다음: 안무가 선택
                            </button>
                        </div>
                    </>
                )}

                {step === 'dancer' && (
                    <>
                        <button
                            type="button"
                            onClick={() => setStep('info')}
                            className="text-sm text-primary hover:underline"
                        >
                            ← 정보 수정
                        </button>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input
                                type="text"
                                value={dancerSearch}
                                onChange={e => setDancerSearch(e.target.value)}
                                placeholder="이름, 장르, 지역으로 검색..."
                                className={inputClass + ' pl-9'}
                            />
                        </div>

                        <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-neutral-800 p-2">
                            {loadingDancers ? (
                                <div className="flex justify-center py-6">
                                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                </div>
                            ) : filteredDancers.length === 0 ? (
                                <p className="text-center py-4 text-white/50 text-sm">
                                    {dancerSearch ? '검색 결과가 없습니다' : '등록된 댄서가 없습니다'}
                                </p>
                            ) : (
                                filteredDancers.map(dancer => {
                                    const isSelected = selectedDancerId === dancer.id
                                    return (
                                        <button
                                            key={dancer.id}
                                            type="button"
                                            onClick={() => handleSelectDancer(dancer.id)}
                                            className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition ${isSelected
                                                ? 'bg-primary/10 border border-primary/30'
                                                : 'hover:bg-neutral-800/50 border border-transparent'
                                                }`}
                                        >
                                            {dancer.profile_img ? (
                                                <Image src={dancer.profile_img} alt="" width={40} height={40}
                                                    className="rounded-full object-cover shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center shrink-0">
                                                    <UserIcon className="w-5 h-5 text-white/40" />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-white truncate">{dancer.stage_name}</div>
                                                {dancer.genres && dancer.genres.length > 0 && (
                                                    <div className="text-xs text-white/50 truncate">
                                                        {dancer.genres.slice(0, 2).join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                            {isSelected && <span className="text-primary text-xs font-medium">선택됨</span>}
                                        </button>
                                    )
                                })
                            )}
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-neutral-800">
                            <button
                                type="button"
                                onClick={handleSkipDancer}
                                disabled={saving}
                                className="flex-1 py-2.5 rounded-lg border border-neutral-700 text-white/80 text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                안무가 없이 생성
                            </button>
                            <button
                                type="button"
                                onClick={handleGoToProposal}
                                disabled={!selectedDancerId}
                                className="flex-1 py-2.5 rounded-lg bg-primary text-black font-medium text-sm disabled:opacity-40"
                            >
                                다음: 제안 작성
                            </button>
                        </div>
                    </>
                )}

                {step === 'proposal' && selectedDancer && (
                    <>
                        <button
                            type="button"
                            onClick={() => setStep('dancer')}
                            className="text-sm text-primary hover:underline"
                        >
                            ← 안무가 다시 선택
                        </button>

                        <div className="p-3 rounded-lg border border-neutral-800 bg-neutral-800/30 space-y-3">
                            <div className="flex items-center gap-2">
                                {selectedDancer.profile_img ? (
                                    <Image src={selectedDancer.profile_img} alt="" width={32} height={32}
                                        className="rounded-full object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
                                        <UserIcon className="w-4 h-4 text-white/40" />
                                    </div>
                                )}
                                <div>
                                    <span className="font-medium text-white text-sm">{selectedDancer.stage_name}</span>
                                    <span className="text-xs text-white/40 ml-2">에게 제안</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-white/50 mb-1">역할</label>
                                <select
                                    value={proposalRole}
                                    onChange={e => setProposalRole(e.target.value)}
                                    className={inputClass + ' py-1.5'}
                                >
                                    {ROLE_PRESETS.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-white/50 mb-1">금액 (원, 선택)</label>
                                <input
                                    type="number"
                                    value={proposalFee}
                                    onChange={e => setProposalFee(e.target.value)}
                                    placeholder="예: 5000000"
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-white/50 mb-1">메시지 (선택)</label>
                                <textarea
                                    value={proposalDetails}
                                    onChange={e => setProposalDetails(e.target.value)}
                                    rows={2}
                                    placeholder="제안 메시지"
                                    className={inputClass + ' resize-none'}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-neutral-800">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-lg border border-neutral-700 text-white/80 text-sm"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmitWithProposal}
                                disabled={saving}
                                className="flex-1 py-2.5 rounded-lg bg-primary text-black font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {saving ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> 생성 중...</>
                                ) : (
                                    <><Send className="w-4 h-4" /> 생성 및 제안 보내기</>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Drawer>
    )
}
