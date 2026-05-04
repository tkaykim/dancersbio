'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Plus, Trash2, Globe, Lock, Calendar } from 'lucide-react'
import { useBackWithFallback } from '@/lib/useBackWithFallback'
import { findOrCreateClient } from '@/lib/create-client'
import { formatEmbargoDate, getKSTDateString } from '@/lib/utils'
import type { EventType, RecruitGender, RecruitUnit } from '@/lib/types'
import { EVENT_TYPE_LABELS, RECRUIT_GENDER_LABELS, RECRUIT_UNIT_LABELS } from '@/lib/types'

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
    date: string
    time: string
    timeUndefined: boolean
    type: EventType
    label: string
}

export default function NewProjectPage() {
    const { user } = useAuth()
    const router = useRouter()
    const handleBack = useBackWithFallback('/my/projects')

    const [loading, setLoading] = useState(false)
    const [authorName, setAuthorName] = useState<string | null>(null)

    // 폼 상태
    const [visibility, setVisibility] = useState<'private' | 'public'>('private')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('choreo')
    const [budgetUndefined, setBudgetUndefined] = useState(false)
    const [budgetPerPerson, setBudgetPerPerson] = useState('')
    const [recruitCount, setRecruitCount] = useState('')
    const [recruitGender, setRecruitGender] = useState<RecruitGender>('any')
    const [recruitUnit, setRecruitUnit] = useState<RecruitUnit>('individual')
    const [paymentDueDate, setPaymentDueDate] = useState('')
    const [recruitStart, setRecruitStart] = useState('')
    const [recruitEnd, setRecruitEnd] = useState('')
    const [embargoDate, setEmbargoDate] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [contactPerson, setContactPerson] = useState('')
    const [ownerAnonymous, setOwnerAnonymous] = useState(false)
    const [events, setEvents] = useState<EventRow[]>([
        { date: '', time: '', timeUndefined: false, type: 'main', label: '' },
    ])

    useEffect(() => {
        if (!user) return
        supabase
            .from('users')
            .select('name')
            .eq('id', user.id)
            .maybeSingle()
            .then(({ data }) => setAuthorName(data?.name ?? null))
    }, [user])

    const totalBudget = useMemo(() => {
        if (budgetUndefined) return null
        const b = parseInt(budgetPerPerson, 10)
        const c = parseInt(recruitCount, 10)
        if (Number.isFinite(b) && Number.isFinite(c) && b > 0 && c > 0) return b * c
        return null
    }, [budgetPerPerson, recruitCount, budgetUndefined])

    /** 입력 값에서 숫자만 추출 (콤마·공백 제거) */
    const sanitizeNumber = (raw: string) => raw.replace(/[^\d]/g, '')
    /** state(숫자만)를 콤마 포함 형식으로 표시 */
    const displayWithCommas = (v: string) => {
        if (!v) return ''
        const n = parseInt(v, 10)
        return Number.isFinite(n) ? n.toLocaleString('ko-KR') : ''
    }

    const updateEvent = (idx: number, patch: Partial<EventRow>) => {
        setEvents((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        if (!title.trim()) return
        setLoading(true)
        try {
            let clientProfileId: string | null = null
            if (companyName.trim()) {
                clientProfileId = await findOrCreateClient(
                    user.id,
                    companyName.trim(),
                    contactPerson.trim() || user.email || '',
                )
            }

            const insertPayload: Record<string, unknown> = {
                owner_id: user.id,
                client_profile_id: clientProfileId,
                title: title.trim(),
                description: description.trim() || null,
                category,
                visibility,
                // 공개 선택 시 어드민 검토 대기로 자동 신청. 비공개는 draft로.
                moderation_status: visibility === 'public' ? 'pending' : 'draft',
                recruit_budget_per_person: budgetUndefined
                    ? null
                    : (budgetPerPerson ? parseInt(budgetPerPerson, 10) : null),
                recruit_count: recruitCount ? parseInt(recruitCount, 10) : null,
                recruit_gender: recruitGender,
                recruit_unit: recruitUnit,
                payment_due_date: paymentDueDate || null,
                recruit_start_date: recruitStart || null,
                recruit_end_date: recruitEnd || null,
                embargo_date: embargoDate || null,
                owner_anonymous: ownerAnonymous,
                // 백워드 호환: 기존 상태 컬럼들 기본값
                status: 'active',
                confirmation_status: 'confirmed',
                progress_status: 'recruiting',
            }

            const { data: project, error } = await supabase
                .from('projects')
                .insert(insertPayload)
                .select('id')
                .single()
            if (error) throw error

            const validEvents = events.filter((r) => r.date.trim())
            if (validEvents.length > 0) {
                await supabase.from('project_event_dates').insert(
                    validEvents.map((r, i) => ({
                        project_id: project.id,
                        event_date: r.date,
                        event_time: r.timeUndefined ? null : (r.time.trim() || null),
                        label: r.label.trim() || null,
                        event_type: r.type,
                        sort_order: i,
                    }))
                )
            }
            router.push(`/my/projects/${project.id}`)
        } catch (err: unknown) {
            alert('오류: ' + (err instanceof Error ? err.message : String(err)))
        } finally {
            setLoading(false)
        }
    }

    const inputClass = 'w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-primary'
    const labelClass = 'block text-sm font-medium text-white/80 mb-1.5'
    const hintClass = 'text-[11px] text-white/35 mb-2'

    return (
        <div className="min-h-screen bg-background pb-nav-safe">
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-10 pt-header-safe">
                <div className="px-5 pb-3.5 flex items-center gap-3">
                    <button type="button" onClick={handleBack} className="-ml-1 p-1" aria-label="뒤로">
                        <ArrowLeft className="w-5 h-5 text-white/70" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">새 프로젝트</h1>
                        <p className="text-white/35 text-[11px]">필수 정보만 채우면 바로 등록됩니다</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">

                {/* 공개/비공개 */}
                <section>
                    <label className={labelClass}>공개 여부 *</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setVisibility('private')}
                            className={`p-3 rounded-lg border text-left transition ${visibility === 'private'
                                ? 'border-primary bg-primary/10'
                                : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'}`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Lock className="w-4 h-4 text-white/80" />
                                <span className="text-sm font-bold text-white">비공개</span>
                            </div>
                            <p className="text-[11px] text-white/50 leading-relaxed">
                                초대(제안)한 인원만 열람. 캐스팅 탭 미노출.
                            </p>
                        </button>
                        <button
                            type="button"
                            onClick={() => setVisibility('public')}
                            className={`p-3 rounded-lg border text-left transition ${visibility === 'public'
                                ? 'border-primary bg-primary/10'
                                : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'}`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Globe className="w-4 h-4 text-white/80" />
                                <span className="text-sm font-bold text-white">공개</span>
                            </div>
                            <p className="text-[11px] text-white/50 leading-relaxed">
                                어드민 검토 후 캐스팅 탭에 노출.
                            </p>
                        </button>
                    </div>
                </section>

                {/* 프로젝트명 */}
                <div>
                    <label className={labelClass}>프로젝트명 *</label>
                    <input
                        type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                        placeholder="예: 뮤직비디오 안무 제작" className={inputClass}
                    />
                </div>

                {/* 설명 */}
                <div>
                    <label className={labelClass}>설명</label>
                    <textarea
                        value={description} onChange={(e) => setDescription(e.target.value)}
                        rows={3} placeholder="프로젝트 간략 설명" className={`${inputClass} resize-none`}
                    />
                </div>

                {/* 카테고리 + 성별 */}
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

                {/* 모집 단위 */}
                <div>
                    <label className={labelClass}>모집 단위 *</label>
                    <p className={hintClass}>지원자가 어떤 형태로 신청할 수 있는지 선택합니다.</p>
                    <select value={recruitUnit} onChange={(e) => setRecruitUnit(e.target.value as RecruitUnit)} className={inputClass}>
                        <option value="individual">{RECRUIT_UNIT_LABELS.individual}</option>
                        <option value="team">{RECRUIT_UNIT_LABELS.team}</option>
                        <option value="both">{RECRUIT_UNIT_LABELS.both}</option>
                    </select>
                </div>

                {/* 섭외 예산 + 인원 */}
                <div>
                    <label className={labelClass}>섭외 예산 / 인원</label>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <input
                                type="text" inputMode="numeric"
                                value={displayWithCommas(budgetPerPerson)}
                                onChange={(e) => setBudgetPerPerson(sanitizeNumber(e.target.value))}
                                disabled={budgetUndefined}
                                placeholder="1인당 예산 (원)"
                                className={`${inputClass} disabled:opacity-50`}
                            />
                            <label className="mt-1.5 flex items-center gap-1.5 text-[11px] text-white/50">
                                <input
                                    type="checkbox" checked={budgetUndefined}
                                    onChange={(e) => setBudgetUndefined(e.target.checked)}
                                    className="accent-primary"
                                />
                                예산 미정
                            </label>
                        </div>
                        <div>
                            <input
                                type="number" inputMode="numeric"
                                value={recruitCount}
                                onChange={(e) => setRecruitCount(e.target.value)}
                                placeholder="섭외 인원"
                                className={inputClass}
                            />
                        </div>
                    </div>
                    {totalBudget !== null && (
                        <p className="mt-2 text-[11px] text-primary/80">
                            총 예산 (참고): {totalBudget.toLocaleString()}원 — 등록 후에는 표시되지 않습니다
                        </p>
                    )}
                </div>

                {/* 행사 일정 */}
                <section>
                    <label className={labelClass}>
                        <Calendar className="w-3.5 h-3.5 inline mr-0.5 text-primary" />
                        행사 일정
                    </label>
                    <p className={hintClass}>날짜 선택 → 시간(미정 가능) → 종류 → 메모. 여러 일정 추가 가능.</p>
                    <div className="space-y-3">
                        {events.map((row, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-900/40 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <input
                                        type="date" value={row.date}
                                        onChange={(e) => updateEvent(idx, { date: e.target.value })}
                                        className={`${inputClass} flex-1 min-w-[130px]`}
                                    />
                                    <input
                                        type="time" value={row.time}
                                        onChange={(e) => updateEvent(idx, { time: e.target.value })}
                                        disabled={row.timeUndefined}
                                        className={`${inputClass} w-28 disabled:opacity-50`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setEvents((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev)}
                                        className="p-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
                                        aria-label="삭제"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <select
                                        value={row.type}
                                        onChange={(e) => updateEvent(idx, { type: e.target.value as EventType })}
                                        className={`${inputClass} w-32`}
                                    >
                                        {EVENT_TYPE_OPTIONS.map(t => (
                                            <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="text" value={row.label}
                                        onChange={(e) => updateEvent(idx, { label: e.target.value })}
                                        placeholder="메모 (선택)"
                                        className={`${inputClass} flex-1 min-w-[120px]`}
                                    />
                                    <label className="flex items-center gap-1.5 text-[11px] text-white/50 ml-auto">
                                        <input
                                            type="checkbox" checked={row.timeUndefined}
                                            onChange={(e) => updateEvent(idx, { timeUndefined: e.target.checked })}
                                            className="accent-primary"
                                        />
                                        시간 미정
                                    </label>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setEvents((prev) => [...prev, { date: '', time: '', timeUndefined: false, type: 'main', label: '' }])}
                            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                            <Plus className="w-4 h-4" /> 일정 추가
                        </button>
                    </div>
                </section>

                {/* 모집 기간 */}
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

                {/* 지급 예정일 */}
                <div>
                    <label className={labelClass}>지급 예정일 *</label>
                    <p className={hintClass}>참여 확정자에게 정산이 지급될 예정일입니다. 정산 페이지에 표시됩니다.</p>
                    <input
                        type="date"
                        value={paymentDueDate}
                        onChange={(e) => setPaymentDueDate(e.target.value)}
                        className={inputClass}
                        required
                    />
                </div>

                {/* 엠바고 */}
                <div>
                    <label className={labelClass}>엠바고 날짜 (선택)</label>
                    <p className={hintClass}>이 날짜까지는 SNS·개인적 정보 노출 금지를 표시합니다 (공개 여부와는 무관).</p>
                    <input
                        type="date" value={embargoDate}
                        onChange={(e) => setEmbargoDate(e.target.value)}
                        min={getKSTDateString()} className={inputClass}
                    />
                    {embargoDate && (
                        <p className="text-[11px] text-orange-400/60 mt-1.5">
                            {formatEmbargoDate(embargoDate)} 23:59(KST)까지 외부 노출 금지
                        </p>
                    )}
                </div>

                {/* 회사/단체 */}
                <div className="border-t border-neutral-800 pt-4">
                    <p className="text-xs text-white/35 mb-3">회사/단체 정보 (선택)</p>
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="회사/단체명" className={inputClass}
                        />
                        <input
                            type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)}
                            placeholder="담당자명" className={inputClass}
                        />
                    </div>
                </div>

                {/* 등록자 정보 */}
                <div className="border-t border-neutral-800 pt-4">
                    <p className="text-xs text-white/35 mb-2">등록자 정보</p>
                    <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-3 text-sm text-white/80">
                        {authorName ? `${authorName} · ` : ''}{user?.email ?? ''}
                    </div>
                    <label className="mt-2 flex items-center gap-1.5 text-[12px] text-white/60">
                        <input
                            type="checkbox" checked={ownerAnonymous}
                            onChange={(e) => setOwnerAnonymous(e.target.checked)}
                            className="accent-primary"
                        />
                        등록자 정보 비공개 (공개 시에도 익명 처리)
                    </label>
                </div>

                <button
                    type="submit" disabled={loading || !title.trim()}
                    className="w-full py-3.5 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : visibility === 'public' ? '공개 신청과 함께 등록' : '비공개로 등록'}
                </button>
            </form>
        </div>
    )
}
