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

/* Cue token 기반 styles */
const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 13,
    color: 'var(--cue-ink)',
    background: 'var(--cue-surface-2)',
    border: '1px solid var(--cue-hairline)',
    borderRadius: 8,
    outline: 'none',
}
const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: 'var(--cue-ink-2)', marginBottom: 6,
    letterSpacing: 0.2, textTransform: 'uppercase',
}
const hintStyle: React.CSSProperties = {
    fontSize: 11, color: 'var(--cue-ink-3)', marginTop: 4, lineHeight: 1.5,
}
const dividerStyle: React.CSSProperties = {
    margin: '20px 0', borderTop: '1px solid var(--cue-hairline)',
}

function Field({ label, children, hint, span = 1 }: {
    label?: string; children: React.ReactNode; hint?: string; span?: 1 | 2
}) {
    return (
        <div style={{ gridColumn: span === 2 ? '1 / -1' : 'auto' }}>
            {label && <label style={labelStyle}>{label}</label>}
            {children}
            {hint && <p style={hintStyle}>{hint}</p>}
        </div>
    )
}

function VisibilityCard({ active, icon, title, desc, onClick }: {
    active: boolean; icon: React.ReactNode; title: string; desc: string; onClick: () => void
}) {
    return (
        <button
            type="button" onClick={onClick}
            style={{
                flex: 1,
                textAlign: 'left',
                padding: '12px 14px',
                borderRadius: 10,
                background: active ? 'var(--cue-accent-dim)' : 'var(--cue-surface)',
                border: `1px solid ${active ? 'var(--cue-accent)' : 'var(--cue-hairline)'}`,
                color: active ? 'var(--cue-ink)' : 'var(--cue-ink-2)',
                cursor: 'pointer',
                transition: 'all 120ms',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {icon}
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--cue-ink)' }}>{title}</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--cue-ink-3)', lineHeight: 1.5 }}>{desc}</p>
        </button>
    )
}

export default function ProjectFormDesktop({ projectId, onSuccess, onCancel }: Props) {
    const f = useProjectForm({ projectId, onSuccess })

    if (f.initialLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--cue-accent)' }} />
            </div>
        )
    }

    return (
        <form
            onSubmit={f.handleSubmit}
            style={{ padding: '20px 24px 24px' }}
        >
            {f.error && (
                <div style={{
                    padding: '10px 12px',
                    marginBottom: 16,
                    borderRadius: 8,
                    background: 'rgba(255,122,110,0.10)',
                    border: '1px solid rgba(255,122,110,0.32)',
                    color: 'var(--cue-bad)',
                    fontSize: 12,
                }}>
                    {f.error}
                </div>
            )}

            {/* 공개 여부 */}
            <Field label="공개 여부">
                <div style={{ display: 'flex', gap: 8 }}>
                    <VisibilityCard
                        active={f.visibility === 'private'}
                        icon={<Lock className="w-4 h-4" style={{ color: 'var(--cue-ink-2)' }} />}
                        title="비공개"
                        desc="초대(제안)한 인원만 열람. 캐스팅 탭 미노출."
                        onClick={() => f.setVisibility('private')}
                    />
                    <VisibilityCard
                        active={f.visibility === 'public'}
                        icon={<Globe className="w-4 h-4" style={{ color: 'var(--cue-ink-2)' }} />}
                        title="공개"
                        desc="어드민 검토 후 캐스팅 탭에 노출."
                        onClick={() => f.setVisibility('public')}
                    />
                </div>
                {f.isEdit && f.visibility !== f.origVisibility && f.visibility === 'public' && (
                    <p style={{ ...hintStyle, color: 'var(--cue-warn)' }}>
                        공개로 전환 시 어드민 재검토를 거칩니다.
                    </p>
                )}
            </Field>

            <div style={dividerStyle} />

            {/* 제목·설명 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                <Field label="프로젝트명 *">
                    <input
                        type="text" value={f.title}
                        onChange={(e) => f.setTitle(e.target.value)} required
                        placeholder="예: 뮤직비디오 안무 제작"
                        style={inputBase}
                    />
                </Field>
                <Field label="설명">
                    <textarea
                        value={f.description}
                        onChange={(e) => f.setDescription(e.target.value)}
                        rows={3} placeholder="프로젝트 간략 설명"
                        style={{ ...inputBase, resize: 'vertical', minHeight: 80, fontFamily: 'inherit' }}
                    />
                </Field>
            </div>

            <div style={dividerStyle} />

            {/* 카테고리 + 성별 + 예산 + 인원 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
                <Field label="카테고리 *">
                    <select value={f.category} onChange={(e) => f.setCategory(e.target.value)} style={inputBase}>
                        {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </Field>
                <Field label="모집 성별">
                    <select value={f.recruitGender} onChange={(e) => f.setRecruitGender(e.target.value as RecruitGender)} style={inputBase}>
                        <option value="any">{RECRUIT_GENDER_LABELS.any}</option>
                        <option value="male">{RECRUIT_GENDER_LABELS.male}</option>
                        <option value="female">{RECRUIT_GENDER_LABELS.female}</option>
                    </select>
                </Field>

                <Field label="섭외 1인당 예산">
                    <input
                        type="text" inputMode="numeric"
                        value={displayWithCommas(f.budgetPerPerson)}
                        onChange={(e) => f.setBudgetPerPerson(sanitizeNumber(e.target.value))}
                        disabled={f.budgetUndefined}
                        placeholder="원"
                        style={{ ...inputBase, opacity: f.budgetUndefined ? 0.4 : 1 }}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 11, color: 'var(--cue-ink-3)' }}>
                        <input type="checkbox" checked={f.budgetUndefined}
                            onChange={(e) => f.setBudgetUndefined(e.target.checked)}
                            style={{ accentColor: 'var(--cue-accent)' }} />
                        예산 미정
                    </label>
                </Field>
                <Field label="섭외 인원">
                    <input
                        type="number" inputMode="numeric"
                        value={f.recruitCount} onChange={(e) => f.setRecruitCount(e.target.value)}
                        placeholder="명" style={inputBase}
                    />
                    {f.totalBudget !== null && !f.isEdit && (
                        <p style={{ ...hintStyle, color: 'var(--cue-accent)' }}>
                            총 예산 (참고): {f.totalBudget.toLocaleString()}원
                        </p>
                    )}
                </Field>
            </div>

            <div style={dividerStyle} />

            {/* 행사 일정 */}
            <Field>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--cue-accent)' }} />
                    <span style={labelStyle}>행사 일정</span>
                </div>
                <p style={{ ...hintStyle, marginTop: 0, marginBottom: 10 }}>
                    날짜 → 시간(미정 가능) → 종류 → 메모. 여러 일정 추가 가능.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {f.events.map((row, idx) => (
                        <div
                            key={idx}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '160px 130px 130px 1fr auto auto',
                                gap: 8,
                                alignItems: 'center',
                                padding: 10,
                                background: 'var(--cue-surface)',
                                border: '1px solid var(--cue-hairline)',
                                borderRadius: 10,
                            }}
                        >
                            <input type="date" value={row.date}
                                onChange={(e) => f.updateEvent(idx, { date: e.target.value })}
                                style={inputBase} />
                            <input type="time" value={row.time}
                                onChange={(e) => f.updateEvent(idx, { time: e.target.value })}
                                disabled={row.timeUndefined}
                                style={{ ...inputBase, opacity: row.timeUndefined ? 0.4 : 1 }} />
                            <select value={row.type}
                                onChange={(e) => f.updateEvent(idx, { type: e.target.value as EventType })}
                                style={inputBase}>
                                {EVENT_TYPE_OPTIONS.map(t => <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>)}
                            </select>
                            <input type="text" value={row.label}
                                onChange={(e) => f.updateEvent(idx, { label: e.target.value })}
                                placeholder="메모 (선택)" style={inputBase} />
                            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--cue-ink-3)', whiteSpace: 'nowrap' }}>
                                <input type="checkbox" checked={row.timeUndefined}
                                    onChange={(e) => f.updateEvent(idx, { timeUndefined: e.target.checked })}
                                    style={{ accentColor: 'var(--cue-accent)' }} />
                                시간 미정
                            </label>
                            <button type="button" onClick={() => f.removeEvent(idx)}
                                style={{
                                    padding: 6, borderRadius: 6,
                                    color: 'var(--cue-ink-3)', background: 'transparent',
                                    border: 'none', cursor: 'pointer',
                                }}
                                aria-label="삭제">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={f.addEvent}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            fontSize: 12, color: 'var(--cue-accent)',
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            padding: '6px 0', alignSelf: 'flex-start',
                        }}>
                        <Plus className="w-4 h-4" /> 일정 추가
                    </button>
                </div>
            </Field>

            <div style={dividerStyle} />

            {/* 모집 기간 + 엠바고 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
                <Field label="모집 시작일">
                    <input type="date" value={f.recruitStart} onChange={(e) => f.setRecruitStart(e.target.value)} style={inputBase} />
                </Field>
                <Field label="모집 마감일">
                    <input type="date" value={f.recruitEnd} onChange={(e) => f.setRecruitEnd(e.target.value)} style={inputBase} />
                </Field>
                <Field label="엠바고 (선택)">
                    <input type="date" value={f.embargoDate}
                        onChange={(e) => f.setEmbargoDate(e.target.value)}
                        min={getKSTDateString()} style={inputBase} />
                </Field>
            </div>
            {f.embargoDate && (
                <p style={{ ...hintStyle, marginTop: 6, color: 'var(--cue-warn)' }}>
                    {formatEmbargoDate(f.embargoDate)} 23:59(KST)까지 외부 노출 금지 (공개 여부와 무관).
                </p>
            )}

            <div style={dividerStyle} />

            {/* 회사/단체 */}
            <Field>
                <span style={labelStyle}>회사/단체 정보 (선택)</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                    <input type="text" value={f.companyName}
                        onChange={(e) => f.setCompanyName(e.target.value)}
                        placeholder="회사/단체명" style={inputBase} />
                    <input type="text" value={f.contactPerson}
                        onChange={(e) => f.setContactPerson(e.target.value)}
                        placeholder="담당자명" style={inputBase} />
                </div>
            </Field>

            <div style={dividerStyle} />

            {/* 등록자 */}
            <Field label="등록자 정보">
                <div style={{
                    padding: '10px 12px',
                    background: 'var(--cue-surface)',
                    border: '1px solid var(--cue-hairline)',
                    borderRadius: 8,
                    fontSize: 12,
                    color: 'var(--cue-ink-2)',
                }}>
                    {f.authorName ? `${f.authorName} · ` : ''}{f.user?.email ?? ''}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: 'var(--cue-ink-2)' }}>
                    <input type="checkbox" checked={f.ownerAnonymous}
                        onChange={(e) => f.setOwnerAnonymous(e.target.checked)}
                        style={{ accentColor: 'var(--cue-accent)' }} />
                    등록자 정보 비공개 (공개 시에도 익명 처리)
                </label>
            </Field>

            {/* Footer */}
            <div style={{
                display: 'flex', gap: 8, justifyContent: 'flex-end',
                marginTop: 24, paddingTop: 16,
                borderTop: '1px solid var(--cue-hairline)',
            }}>
                {onCancel && (
                    <button type="button" onClick={onCancel}
                        style={{
                            padding: '10px 18px', fontSize: 13, fontWeight: 600,
                            color: 'var(--cue-ink-2)',
                            background: 'transparent',
                            border: '1px solid var(--cue-hairline)',
                            borderRadius: 8, cursor: 'pointer',
                        }}>
                        취소
                    </button>
                )}
                <button type="submit" disabled={f.loading || !f.title.trim()}
                    style={{
                        padding: '10px 20px', fontSize: 13, fontWeight: 700,
                        color: 'var(--cue-accent-ink)',
                        background: 'var(--cue-accent)',
                        border: 'none', borderRadius: 8,
                        cursor: f.loading || !f.title.trim() ? 'not-allowed' : 'pointer',
                        opacity: f.loading || !f.title.trim() ? 0.5 : 1,
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}>
                    {f.loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {f.isEdit ? '저장' : (f.visibility === 'public' ? '공개 신청과 함께 등록' : '비공개로 등록')}
                </button>
            </div>
        </form>
    )
}
