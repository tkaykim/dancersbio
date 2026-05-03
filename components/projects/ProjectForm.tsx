'use client'

import { Loader2, Plus, Trash2, Globe, Lock, Calendar } from 'lucide-react'
import { formatEmbargoDate, getKSTDateString } from '@/lib/utils'
import type { EventType, RecruitGender } from '@/lib/types'
import { EVENT_TYPE_LABELS, RECRUIT_GENDER_LABELS } from '@/lib/types'
import { useProjectForm, sanitizeNumber, displayWithCommas } from './useProjectForm'

const CATEGORY_OPTIONS = [
    { value: 'choreo', label: '안무제작/댄서참여' },
    { value: 'broadcast', label: '방송 출연' },
    { value: 'performance', label: '공연' },
    { value: 'workshop', label: '워크샵' },
    { value: 'judge', label: '심사' },
    { value: 'other', label: '기타' },
]
const EVENT_TYPE_OPTIONS: EventType[] = ['main', 'rehearsal', 'shoot', 'fitting', 'meeting', 'other']

interface Props {
    projectId?: string
    onSuccess: (projectId: string) => void
    onCancel?: () => void
}

/**
 * 모바일용 풀폭 폼.
 */
export default function ProjectForm({ projectId, onSuccess, onCancel }: Props) {
    const f = useProjectForm({ projectId, onSuccess })

    if (f.initialLoading) {
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
        <form onSubmit={f.handleSubmit} className="p-5 space-y-5">
            {f.error && (
                <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(255,122,110,0.12)', color: 'var(--cue-bad)' }}>
                    {f.error}
                </div>
            )}

            <section>
                <label className={labelClass}>공개 여부 *</label>
                <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => f.setVisibility('private')}
                        className={`p-3 rounded-lg border text-left transition ${f.visibility === 'private'
                            ? 'border-primary bg-primary/10' : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <Lock className="w-4 h-4 text-white/80" />
                            <span className="text-sm font-bold text-white">비공개</span>
                        </div>
                        <p className="text-[11px] text-white/50 leading-relaxed">초대(제안)한 인원만 열람. 캐스팅 탭 미노출.</p>
                    </button>
                    <button type="button" onClick={() => f.setVisibility('public')}
                        className={`p-3 rounded-lg border text-left transition ${f.visibility === 'public'
                            ? 'border-primary bg-primary/10' : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <Globe className="w-4 h-4 text-white/80" />
                            <span className="text-sm font-bold text-white">공개</span>
                        </div>
                        <p className="text-[11px] text-white/50 leading-relaxed">어드민 검토 후 캐스팅 탭에 노출.</p>
                    </button>
                </div>
                {f.isEdit && f.visibility !== f.origVisibility && f.visibility === 'public' && (
                    <p className="text-[11px] text-yellow-400/80 mt-2">공개로 전환 시 어드민 재검토를 거칩니다.</p>
                )}
            </section>

            <div>
                <label className={labelClass}>프로젝트명 *</label>
                <input type="text" value={f.title} onChange={(e) => f.setTitle(e.target.value)} required
                    placeholder="예: 뮤직비디오 안무 제작" className={inputClass} />
            </div>

            <div>
                <label className={labelClass}>설명</label>
                <textarea value={f.description} onChange={(e) => f.setDescription(e.target.value)}
                    rows={3} placeholder="프로젝트 간략 설명" className={`${inputClass} resize-none`} />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>카테고리 *</label>
                    <select value={f.category} onChange={(e) => f.setCategory(e.target.value)} className={inputClass}>
                        {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>모집 성별</label>
                    <select value={f.recruitGender} onChange={(e) => f.setRecruitGender(e.target.value as RecruitGender)} className={inputClass}>
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
                            value={displayWithCommas(f.budgetPerPerson)}
                            onChange={(e) => f.setBudgetPerPerson(sanitizeNumber(e.target.value))}
                            disabled={f.budgetUndefined}
                            placeholder="1인당 예산 (원)"
                            className={`${inputClass} disabled:opacity-50`} />
                        <label className="mt-1.5 flex items-center gap-1.5 text-[11px] text-white/50">
                            <input type="checkbox" checked={f.budgetUndefined}
                                onChange={(e) => f.setBudgetUndefined(e.target.checked)} className="accent-primary" />
                            예산 미정
                        </label>
                    </div>
                    <div>
                        <input type="number" inputMode="numeric"
                            value={f.recruitCount} onChange={(e) => f.setRecruitCount(e.target.value)}
                            placeholder="섭외 인원" className={inputClass} />
                    </div>
                </div>
                {f.totalBudget !== null && !f.isEdit && (
                    <p className="mt-2 text-[11px] text-primary/80">
                        총 예산 (참고): {f.totalBudget.toLocaleString()}원 — 등록 후에는 표시되지 않습니다
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
                    {f.events.map((row, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-900/40 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <input type="date" value={row.date}
                                    onChange={(e) => f.updateEvent(idx, { date: e.target.value })}
                                    className={`${inputClass} flex-1 min-w-[130px]`} />
                                <input type="time" value={row.time}
                                    onChange={(e) => f.updateEvent(idx, { time: e.target.value })}
                                    disabled={row.timeUndefined}
                                    className={`${inputClass} w-28 disabled:opacity-50`} />
                                <button type="button" onClick={() => f.removeEvent(idx)}
                                    className="p-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white" aria-label="삭제">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <select value={row.type}
                                    onChange={(e) => f.updateEvent(idx, { type: e.target.value as EventType })}
                                    className={`${inputClass} w-32`}>
                                    {EVENT_TYPE_OPTIONS.map(t => <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>)}
                                </select>
                                <input type="text" value={row.label}
                                    onChange={(e) => f.updateEvent(idx, { label: e.target.value })}
                                    placeholder="메모 (선택)"
                                    className={`${inputClass} flex-1 min-w-[120px]`} />
                                <label className="flex items-center gap-1.5 text-[11px] text-white/50 ml-auto">
                                    <input type="checkbox" checked={row.timeUndefined}
                                        onChange={(e) => f.updateEvent(idx, { timeUndefined: e.target.checked })}
                                        className="accent-primary" />
                                    시간 미정
                                </label>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={f.addEvent}
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
                        <input type="date" value={f.recruitStart} onChange={(e) => f.setRecruitStart(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <p className={hintClass}>모집 마감일</p>
                        <input type="date" value={f.recruitEnd} onChange={(e) => f.setRecruitEnd(e.target.value)} className={inputClass} />
                    </div>
                </div>
            </div>

            <div>
                <label className={labelClass}>엠바고 날짜 (선택)</label>
                <p className={hintClass}>이 날짜까지는 SNS·개인적 정보 노출 금지를 표시합니다 (공개 여부와는 무관).</p>
                <input type="date" value={f.embargoDate} onChange={(e) => f.setEmbargoDate(e.target.value)}
                    min={getKSTDateString()} className={inputClass} />
                {f.embargoDate && (
                    <p className="text-[11px] text-orange-400/60 mt-1.5">
                        {formatEmbargoDate(f.embargoDate)} 23:59(KST)까지 외부 노출 금지
                    </p>
                )}
            </div>

            <div className="border-t border-neutral-800 pt-4">
                <p className="text-xs text-white/35 mb-3">회사/단체 정보 (선택)</p>
                <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={f.companyName} onChange={(e) => f.setCompanyName(e.target.value)}
                        placeholder="회사/단체명" className={inputClass} />
                    <input type="text" value={f.contactPerson} onChange={(e) => f.setContactPerson(e.target.value)}
                        placeholder="담당자명" className={inputClass} />
                </div>
            </div>

            <div className="border-t border-neutral-800 pt-4">
                <p className="text-xs text-white/35 mb-2">등록자 정보</p>
                <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-3 text-sm text-white/80">
                    {f.authorName ? `${f.authorName} · ` : ''}{f.user?.email ?? ''}
                </div>
                <label className="mt-2 flex items-center gap-1.5 text-[12px] text-white/60">
                    <input type="checkbox" checked={f.ownerAnonymous}
                        onChange={(e) => f.setOwnerAnonymous(e.target.checked)} className="accent-primary" />
                    등록자 정보 비공개 (공개 시에도 익명 처리)
                </label>
            </div>

            <div className="flex gap-2 mt-2">
                {onCancel && (
                    <button type="button" onClick={onCancel}
                        className="flex-1 py-3.5 bg-neutral-800 text-white/80 font-bold rounded-xl">취소</button>
                )}
                <button type="submit" disabled={f.loading || !f.title.trim()}
                    className="flex-1 py-3.5 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {f.loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                        f.isEdit ? '저장' : (f.visibility === 'public' ? '공개 신청과 함께 등록' : '비공개로 등록')}
                </button>
            </div>
        </form>
    )
}
