'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { findOrCreateClient } from '@/lib/create-client'
import { formatEmbargoDate, getKSTDateString } from '@/lib/utils'
import type { EventType, RecruitGender, ModerationStatus, ProjectVisibility } from '@/lib/types'
import { EVENT_TYPE_LABELS, RECRUIT_GENDER_LABELS } from '@/lib/types'
import { Loader2, Plus, Trash2, Globe, Lock, Calendar } from 'lucide-react'

const CATEGORY_OPTIONS = [
    { value: 'choreo', label: '안무제작/댄서참여' },
    { value: 'broadcast', label: '방송 출연' },
    { value: 'performance', label: '공연' },
    { value: 'workshop', label: '워크샵' },
    { value: 'judge', label: '심사' },
    { value: 'other', label: '기타' },
]
const EVENT_TYPE_OPTIONS: EventType[] = ['main', 'rehearsal', 'shoot', 'fitting', 'meeting', 'other']

interface EventRow {
    id?: string  // 수정 시 기존 행 식별
    date: string
    time: string
    timeUndefined: boolean
    type: EventType
    label: string
}

interface Props {
    /** 있으면 수정 모드, 없으면 생성 모드 */
    projectId?: string
    onSuccess: (projectId: string) => void
    onCancel?: () => void
}

const sanitizeNumber = (raw: string) => raw.replace(/[^\d]/g, '')
const displayWithCommas = (v: string) => {
    if (!v) return ''
    const n = parseInt(v, 10)
    return Number.isFinite(n) ? n.toLocaleString('ko-KR') : ''
}

export default function ProjectForm({ projectId, onSuccess, onCancel }: Props) {
    const { user } = useAuth()
    const isEdit = !!projectId

    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(isEdit)
    const [error, setError] = useState<string | null>(null)
    const [authorName, setAuthorName] = useState<string | null>(null)

    // 폼 상태
    const [visibility, setVisibility] = useState<ProjectVisibility>('private')
    const [origModerationStatus, setOrigModerationStatus] = useState<ModerationStatus>('draft')
    const [origVisibility, setOrigVisibility] = useState<ProjectVisibility>('private')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('choreo')
    const [recruitGender, setRecruitGender] = useState<RecruitGender>('any')
    const [budgetUndefined, setBudgetUndefined] = useState(false)
    const [budgetPerPerson, setBudgetPerPerson] = useState('')
    const [recruitCount, setRecruitCount] = useState('')
    const [recruitStart, setRecruitStart] = useState('')
    const [recruitEnd, setRecruitEnd] = useState('')
    const [embargoDate, setEmbargoDate] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [contactPerson, setContactPerson] = useState('')
    const [ownerAnonymous, setOwnerAnonymous] = useState(false)
    const [events, setEvents] = useState<EventRow[]>([
        { date: '', time: '', timeUndefined: false, type: 'main', label: '' },
    ])

    // 등록자 이름
    useEffect(() => {
        if (!user) return
        supabase.from('users').select('name').eq('id', user.id).maybeSingle()
            .then(({ data }) => setAuthorName(data?.name ?? null))
    }, [user])

    // 수정 모드: 기존 데이터 로드
    useEffect(() => {
        if (!projectId) return
        let cancelled = false
        const load = async () => {
            setInitialLoading(true)
            try {
                const { data: p, error: e1 } = await supabase
                    .from('projects')
                    .select(`
                        title, description, category, visibility, moderation_status,
                        recruit_count, recruit_budget_per_person, recruit_gender,
                        recruit_start_date, recruit_end_date, embargo_date, owner_anonymous,
                        clients (company_name, contact_person)
                    `)
                    .eq('id', projectId)
                    .single()
                if (e1) throw e1
                if (cancelled || !p) return
                setTitle(p.title ?? '')
                setDescription(p.description ?? '')
                setCategory(p.category ?? 'choreo')
                setVisibility((p.visibility as ProjectVisibility) ?? 'private')
                setOrigVisibility((p.visibility as ProjectVisibility) ?? 'private')
                setOrigModerationStatus((p.moderation_status as ModerationStatus) ?? 'draft')
                setRecruitGender((p.recruit_gender as RecruitGender) ?? 'any')
                if (p.recruit_budget_per_person == null) {
                    setBudgetUndefined(true)
                    setBudgetPerPerson('')
                } else {
                    setBudgetUndefined(false)
                    setBudgetPerPerson(String(p.recruit_budget_per_person))
                }
                setRecruitCount(p.recruit_count ? String(p.recruit_count) : '')
                setRecruitStart(p.recruit_start_date ?? '')
                setRecruitEnd(p.recruit_end_date ?? '')
                setEmbargoDate(p.embargo_date ?? '')
                setOwnerAnonymous(!!p.owner_anonymous)
                const c = Array.isArray(p.clients) ? p.clients[0] : p.clients
                setCompanyName(c?.company_name ?? '')
                setContactPerson(c?.contact_person ?? '')

                const { data: ev } = await supabase
                    .from('project_event_dates')
                    .select('id, event_date, event_time, label, event_type, sort_order')
                    .eq('project_id', projectId)
                    .order('sort_order', { ascending: true })
                if (cancelled) return
                if (ev && ev.length > 0) {
                    setEvents(ev.map((r) => ({
                        id: r.id,
                        date: r.event_date,
                        time: r.event_time ?? '',
                        timeUndefined: r.event_time == null,
                        type: (r.event_type as EventType) ?? 'main',
                        label: r.label ?? '',
                    })))
                }
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : '프로젝트를 불러오지 못했습니다.')
            } finally {
                setInitialLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [projectId])

    const totalBudget = useMemo(() => {
        if (budgetUndefined) return null
        const b = parseInt(budgetPerPerson, 10)
        const c = parseInt(recruitCount, 10)
        if (Number.isFinite(b) && Number.isFinite(c) && b > 0 && c > 0) return b * c
        return null
    }, [budgetPerPerson, recruitCount, budgetUndefined])

    const updateEvent = (idx: number, patch: Partial<EventRow>) =>
        setEvents((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))

    /**
     * 수정 시 visibility/moderation_status 전환 룰:
     * - 비공개 → 공개: moderation_status = 'pending' (재심사)
     * - 공개(approved) → 비공개: visibility='private', moderation_status='draft'
     * - 변동 없으면 그대로
     */
    const computeModeration = (): { visibility: ProjectVisibility; moderation_status: ModerationStatus } => {
        if (!isEdit) {
            // 생성
            return {
                visibility,
                moderation_status: visibility === 'public' ? 'pending' : 'draft',
            }
        }
        if (visibility === origVisibility) {
            return { visibility, moderation_status: origModerationStatus }
        }
        // 변경됨
        if (visibility === 'public') {
            return { visibility: 'public', moderation_status: 'pending' }
        }
        return { visibility: 'private', moderation_status: 'draft' }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !title.trim()) return
        setLoading(true)
        setError(null)
        try {
            let clientProfileId: string | null = null
            if (companyName.trim()) {
                clientProfileId = await findOrCreateClient(
                    user.id,
                    companyName.trim(),
                    contactPerson.trim() || user.email || '',
                )
            }

            const { visibility: nextVis, moderation_status: nextMod } = computeModeration()
            const corePayload: Record<string, unknown> = {
                title: title.trim(),
                description: description.trim() || null,
                category,
                visibility: nextVis,
                moderation_status: nextMod,
                recruit_budget_per_person: budgetUndefined
                    ? null
                    : (budgetPerPerson ? parseInt(budgetPerPerson, 10) : null),
                recruit_count: recruitCount ? parseInt(recruitCount, 10) : null,
                recruit_gender: recruitGender,
                recruit_start_date: recruitStart || null,
                recruit_end_date: recruitEnd || null,
                embargo_date: embargoDate || null,
                owner_anonymous: ownerAnonymous,
                client_profile_id: clientProfileId,
            }

            let resultProjectId = projectId
            if (isEdit && projectId) {
                const { error: updErr } = await supabase
                    .from('projects')
                    .update(corePayload)
                    .eq('id', projectId)
                if (updErr) throw updErr
            } else {
                const insertPayload = {
                    ...corePayload,
                    owner_id: user.id,
                    status: 'active',
                    confirmation_status: 'confirmed',
                    progress_status: 'recruiting',
                }
                const { data: created, error: insErr } = await supabase
                    .from('projects').insert(insertPayload).select('id').single()
                if (insErr) throw insErr
                resultProjectId = created.id
            }

            // 이벤트 일정: 단순화를 위해 기존 행 모두 삭제 후 재삽입
            if (resultProjectId) {
                if (isEdit) {
                    await supabase.from('project_event_dates').delete().eq('project_id', resultProjectId)
                }
                const validEvents = events.filter((r) => r.date.trim())
                if (validEvents.length > 0) {
                    await supabase.from('project_event_dates').insert(
                        validEvents.map((r, i) => ({
                            project_id: resultProjectId,
                            event_date: r.date,
                            event_time: r.timeUndefined ? null : (r.time.trim() || null),
                            label: r.label.trim() || null,
                            event_type: r.type,
                            sort_order: i,
                        }))
                    )
                }
                onSuccess(resultProjectId)
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : '저장 실패')
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        )
    }

    const inputClass = 'w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-primary'
    const labelClass = 'block text-sm font-medium text-white/80 mb-1.5'
    const hintClass = 'text-[11px] text-white/35 mb-2'

    return (
        <form onSubmit={handleSubmit} className="p-5 space-y-5">

            {error && (
                <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(255,122,110,0.12)', color: 'var(--cue-bad)' }}>
                    {error}
                </div>
            )}

            {/* 공개/비공개 */}
            <section>
                <label className={labelClass}>공개 여부 *</label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button" onClick={() => setVisibility('private')}
                        className={`p-3 rounded-lg border text-left transition ${visibility === 'private'
                            ? 'border-primary bg-primary/10' : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'}`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Lock className="w-4 h-4 text-white/80" />
                            <span className="text-sm font-bold text-white">비공개</span>
                        </div>
                        <p className="text-[11px] text-white/50 leading-relaxed">초대(제안)한 인원만 열람. 캐스팅 탭 미노출.</p>
                    </button>
                    <button
                        type="button" onClick={() => setVisibility('public')}
                        className={`p-3 rounded-lg border text-left transition ${visibility === 'public'
                            ? 'border-primary bg-primary/10' : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'}`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Globe className="w-4 h-4 text-white/80" />
                            <span className="text-sm font-bold text-white">공개</span>
                        </div>
                        <p className="text-[11px] text-white/50 leading-relaxed">어드민 검토 후 캐스팅 탭에 노출.</p>
                    </button>
                </div>
                {isEdit && visibility !== origVisibility && visibility === 'public' && (
                    <p className="text-[11px] text-yellow-400/80 mt-2">공개로 전환 시 어드민 재검토를 거칩니다.</p>
                )}
            </section>

            <div>
                <label className={labelClass}>프로젝트명 *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                    placeholder="예: 뮤직비디오 안무 제작" className={inputClass} />
            </div>

            <div>
                <label className={labelClass}>설명</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                    rows={3} placeholder="프로젝트 간략 설명" className={`${inputClass} resize-none`} />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>카테고리 *</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                        {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>모집 성별</label>
                    <select value={recruitGender} onChange={(e) => setRecruitGender(e.target.value as RecruitGender)} className={inputClass}>
                        <option value="any">{RECRUIT_GENDER_LABELS.any}</option>
                        <option value="male">{RECRUIT_GENDER_LABELS.male}</option>
                        <option value="female">{RECRUIT_GENDER_LABELS.female}</option>
                    </select>
                </div>
            </div>

            <div>
                <label className={labelClass}>섭외 예산 / 인원</label>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <input type="text" inputMode="numeric"
                            value={displayWithCommas(budgetPerPerson)}
                            onChange={(e) => setBudgetPerPerson(sanitizeNumber(e.target.value))}
                            disabled={budgetUndefined}
                            placeholder="1인당 예산 (원)"
                            className={`${inputClass} disabled:opacity-50`} />
                        <label className="mt-1.5 flex items-center gap-1.5 text-[11px] text-white/50">
                            <input type="checkbox" checked={budgetUndefined}
                                onChange={(e) => setBudgetUndefined(e.target.checked)}
                                className="accent-primary" />
                            예산 미정
                        </label>
                    </div>
                    <div>
                        <input type="number" inputMode="numeric"
                            value={recruitCount} onChange={(e) => setRecruitCount(e.target.value)}
                            placeholder="섭외 인원" className={inputClass} />
                    </div>
                </div>
                {totalBudget !== null && !isEdit && (
                    <p className="mt-2 text-[11px] text-primary/80">
                        총 예산 (참고): {totalBudget.toLocaleString()}원 — 등록 후에는 표시되지 않습니다
                    </p>
                )}
            </div>

            <section>
                <label className={labelClass}>
                    <Calendar className="w-3.5 h-3.5 inline mr-0.5 text-primary" />
                    행사 일정
                </label>
                <p className={hintClass}>날짜 → 시간(미정 가능) → 종류 → 메모. 여러 일정 추가 가능.</p>
                <div className="space-y-3">
                    {events.map((row, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-900/40 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <input type="date" value={row.date}
                                    onChange={(e) => updateEvent(idx, { date: e.target.value })}
                                    className={`${inputClass} flex-1 min-w-[130px]`} />
                                <input type="time" value={row.time}
                                    onChange={(e) => updateEvent(idx, { time: e.target.value })}
                                    disabled={row.timeUndefined}
                                    className={`${inputClass} w-28 disabled:opacity-50`} />
                                <button type="button"
                                    onClick={() => setEvents((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev)}
                                    className="p-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
                                    aria-label="삭제">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <select value={row.type}
                                    onChange={(e) => updateEvent(idx, { type: e.target.value as EventType })}
                                    className={`${inputClass} w-32`}>
                                    {EVENT_TYPE_OPTIONS.map(t => <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>)}
                                </select>
                                <input type="text" value={row.label}
                                    onChange={(e) => updateEvent(idx, { label: e.target.value })}
                                    placeholder="메모 (선택)"
                                    className={`${inputClass} flex-1 min-w-[120px]`} />
                                <label className="flex items-center gap-1.5 text-[11px] text-white/50 ml-auto">
                                    <input type="checkbox" checked={row.timeUndefined}
                                        onChange={(e) => updateEvent(idx, { timeUndefined: e.target.checked })}
                                        className="accent-primary" />
                                    시간 미정
                                </label>
                            </div>
                        </div>
                    ))}
                    <button type="button"
                        onClick={() => setEvents((prev) => [...prev, { date: '', time: '', timeUndefined: false, type: 'main', label: '' }])}
                        className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                        <Plus className="w-4 h-4" /> 일정 추가
                    </button>
                </div>
            </section>

            <div>
                <label className={labelClass}>모집 기간</label>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <p className={hintClass}>모집 시작일</p>
                        <input type="date" value={recruitStart} onChange={(e) => setRecruitStart(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <p className={hintClass}>모집 마감일</p>
                        <input type="date" value={recruitEnd} onChange={(e) => setRecruitEnd(e.target.value)} className={inputClass} />
                    </div>
                </div>
            </div>

            <div>
                <label className={labelClass}>엠바고 날짜 (선택)</label>
                <p className={hintClass}>이 날짜까지는 SNS·개인적 정보 노출 금지를 표시합니다 (공개 여부와는 무관).</p>
                <input type="date" value={embargoDate} onChange={(e) => setEmbargoDate(e.target.value)}
                    min={getKSTDateString()} className={inputClass} />
                {embargoDate && (
                    <p className="text-[11px] text-orange-400/60 mt-1.5">
                        {formatEmbargoDate(embargoDate)} 23:59(KST)까지 외부 노출 금지
                    </p>
                )}
            </div>

            <div className="border-t border-neutral-800 pt-4">
                <p className="text-xs text-white/35 mb-3">회사/단체 정보 (선택)</p>
                <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="회사/단체명" className={inputClass} />
                    <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="담당자명" className={inputClass} />
                </div>
            </div>

            <div className="border-t border-neutral-800 pt-4">
                <p className="text-xs text-white/35 mb-2">등록자 정보</p>
                <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-3 text-sm text-white/80">
                    {authorName ? `${authorName} · ` : ''}{user?.email ?? ''}
                </div>
                <label className="mt-2 flex items-center gap-1.5 text-[12px] text-white/60">
                    <input type="checkbox" checked={ownerAnonymous}
                        onChange={(e) => setOwnerAnonymous(e.target.checked)}
                        className="accent-primary" />
                    등록자 정보 비공개 (공개 시에도 익명 처리)
                </label>
            </div>

            <div className="flex gap-2 mt-2">
                {onCancel && (
                    <button type="button" onClick={onCancel}
                        className="flex-1 py-3.5 bg-neutral-800 text-white/80 font-bold rounded-xl">
                        취소
                    </button>
                )}
                <button type="submit" disabled={loading || !title.trim()}
                    className="flex-1 py-3.5 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                        isEdit ? '저장' : (visibility === 'public' ? '공개 신청과 함께 등록' : '비공개로 등록')}
                </button>
            </div>
        </form>
    )
}
