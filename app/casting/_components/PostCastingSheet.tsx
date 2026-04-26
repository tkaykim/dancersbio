'use client'

import { useEffect, useState } from 'react'
import { Ico } from '@/components/cue'
import type { CastingCategory, CastingOfferModel, CastingPayType } from '@/lib/castingMockData'

interface Props {
    open: boolean
    onClose: () => void
}

const CATEGORIES: CastingCategory[] = ['광고', '안무제작', '댄서참여', '강사구인', '오디션', '기타']
const OFFER_MODELS: { value: CastingOfferModel; label: string; hint: string }[] = [
    { value: 'public', label: '공개 캐스팅', hint: '모두에게 공개' },
    { value: 'direct', label: '다이렉트 오퍼', hint: '특정 인물에게만 발송' },
    { value: 'hybrid', label: '공개 + 초대', hint: '공개하면서 일부 초대' },
]
const PAY_TYPES: { value: CastingPayType; label: string }[] = [
    { value: 'fixed', label: '확정 금액' },
    { value: 'range', label: '범위' },
    { value: 'negotiable', label: '협의' },
    { value: 'unpaid', label: '무급' },
]

export default function PostCastingSheet({ open, onClose }: Props) {
    const [category, setCategory] = useState<CastingCategory>('댄서참여')
    const [offerModel, setOfferModel] = useState<CastingOfferModel>('public')
    const [payType, setPayType] = useState<CastingPayType>('fixed')
    const [title, setTitle] = useState('')
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        if (!open) return
        const orig = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = orig
        }
    }, [open])

    if (!open) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 60,
                background: 'rgba(0,0,0,0.55)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: 480,
                    background: 'var(--cue-bg)',
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    border: '1px solid var(--cue-hairline)',
                    maxHeight: '92vh',
                    overflowY: 'auto',
                }}
            >
                <div
                    style={{
                        padding: '14px 20px 12px',
                        borderBottom: '1px solid var(--cue-hairline)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'sticky',
                        top: 0,
                        background: 'color-mix(in srgb, var(--cue-bg) 92%, transparent)',
                        backdropFilter: 'blur(18px)',
                        WebkitBackdropFilter: 'blur(18px)',
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: 10,
                                letterSpacing: 1.2,
                                color: 'var(--cue-ink-3)',
                                fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                            }}
                        >
                            ↳ NEW POSTING
                        </div>
                        <h2
                            style={{
                                fontFamily: 'var(--font-cue-serif), serif',
                                fontStyle: 'italic',
                                fontSize: 20,
                                color: 'var(--cue-ink)',
                                marginTop: 2,
                            }}
                        >
                            공고 올리기<span style={{ color: 'var(--cue-accent)' }}>.</span>
                        </h2>
                    </div>
                    <button
                        type="button"
                        aria-label="닫기"
                        onClick={onClose}
                        style={{
                            background: 'var(--cue-surface)',
                            border: '1px solid var(--cue-hairline)',
                            borderRadius: 999,
                            padding: 8,
                            color: 'var(--cue-ink)',
                        }}
                    >
                        {Ico.x('currentColor', 16)}
                    </button>
                </div>

                {submitted ? (
                    <SuccessBlock onClose={onClose} />
                ) : (
                    <form onSubmit={handleSubmit} style={{ padding: 20, display: 'grid', gap: 18 }}>
                        <Field label="카테고리">
                            <ChipGroup
                                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                                value={category}
                                onChange={(v) => setCategory(v as CastingCategory)}
                            />
                        </Field>

                        <Field label="공고 방식">
                            <div style={{ display: 'grid', gap: 8 }}>
                                {OFFER_MODELS.map((m) => (
                                    <label
                                        key={m.value}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 10,
                                            padding: 12,
                                            border: '1px solid var(--cue-hairline)',
                                            borderRadius: 14,
                                            background:
                                                offerModel === m.value
                                                    ? 'var(--cue-accent-dim)'
                                                    : 'var(--cue-surface)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="offer"
                                            checked={offerModel === m.value}
                                            onChange={() => setOfferModel(m.value)}
                                            style={{ marginTop: 4, accentColor: 'var(--cue-accent)' }}
                                        />
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: 'var(--cue-ink)',
                                                }}
                                            >
                                                {m.label}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: 'var(--cue-ink-3)',
                                                    marginTop: 2,
                                                }}
                                            >
                                                {m.hint}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </Field>

                        <Field label="제목">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="예) 뉴진스 혜인 솔로 백업 댄서 4명"
                                style={inputStyle}
                                required
                            />
                        </Field>

                        <Field label="페이">
                            <ChipGroup
                                options={PAY_TYPES.map((p) => ({ value: p.value, label: p.label }))}
                                value={payType}
                                onChange={(v) => setPayType(v as CastingPayType)}
                            />
                            {payType === 'fixed' && (
                                <input
                                    type="text"
                                    placeholder="₩ 1,800,000"
                                    style={{ ...inputStyle, marginTop: 8 }}
                                />
                            )}
                            {payType === 'range' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                                    <input type="text" placeholder="최소" style={inputStyle} />
                                    <input type="text" placeholder="최대" style={inputStyle} />
                                </div>
                            )}
                        </Field>

                        <Field label="일정 / 장소">
                            <input type="text" placeholder="5/12 · 리허설 2회 + 본 촬영" style={inputStyle} />
                            <input
                                type="text"
                                placeholder="서울 성동 · (선택)"
                                style={{ ...inputStyle, marginTop: 8 }}
                            />
                        </Field>

                        <Field label="상세 설명">
                            <textarea
                                rows={4}
                                placeholder="안무 컨셉, 현장 분위기, 지원 자격 등 자유 기술"
                                style={{ ...inputStyle, resize: 'vertical', minHeight: 96 }}
                            />
                        </Field>

                        <div
                            style={{
                                padding: 12,
                                borderRadius: 12,
                                background: 'var(--cue-surface)',
                                border: '1px dashed var(--cue-hairline)',
                                fontSize: 11,
                                color: 'var(--cue-ink-3)',
                                lineHeight: 1.55,
                            }}
                        >
                            ↳ 현재는 UI 스캐폴드입니다. 백엔드 연동 후 실제 게시·다이렉트 발송이 동작합니다.
                        </div>

                        <button
                            type="submit"
                            disabled={!title}
                            style={{
                                padding: '14px 18px',
                                borderRadius: 999,
                                background: title ? 'var(--cue-accent)' : 'var(--cue-surface-2)',
                                color: title ? 'var(--cue-accent-ink)' : 'var(--cue-ink-3)',
                                fontWeight: 700,
                                fontSize: 14,
                                border: 'none',
                                cursor: title ? 'pointer' : 'not-allowed',
                            }}
                        >
                            게시 미리보기
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

function SuccessBlock({ onClose }: { onClose: () => void }) {
    return (
        <div style={{ padding: 32, textAlign: 'center' }}>
            <div
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: 999,
                    background: 'var(--cue-accent-dim)',
                    color: 'var(--cue-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                }}
            >
                {Ico.check('currentColor', 28)}
            </div>
            <h3
                style={{
                    fontFamily: 'var(--font-cue-serif), serif',
                    fontStyle: 'italic',
                    fontSize: 22,
                    color: 'var(--cue-ink)',
                }}
            >
                게시 준비 완료<span style={{ color: 'var(--cue-accent)' }}>.</span>
            </h3>
            <p style={{ fontSize: 13, color: 'var(--cue-ink-3)', marginTop: 8, lineHeight: 1.6 }}>
                백엔드 연동이 완료되면 이 작성 내용이
                <br />
                실제 캐스팅 보드와 다이렉트 메시지로 발송됩니다.
            </p>
            <button
                type="button"
                onClick={onClose}
                style={{
                    marginTop: 24,
                    padding: '12px 20px',
                    borderRadius: 999,
                    background: 'var(--cue-surface-2)',
                    color: 'var(--cue-ink)',
                    border: '1px solid var(--cue-hairline)',
                    fontSize: 13,
                }}
            >
                닫기
            </button>
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <div
                style={{
                    fontSize: 10,
                    letterSpacing: 1.2,
                    fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                    color: 'var(--cue-ink-3)',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                }}
            >
                {label}
            </div>
            {children}
        </div>
    )
}

function ChipGroup({
    options,
    value,
    onChange,
}: {
    options: { value: string; label: string }[]
    value: string
    onChange: (v: string) => void
}) {
    return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {options.map((o) => {
                const active = o.value === value
                return (
                    <button
                        key={o.value}
                        type="button"
                        onClick={() => onChange(o.value)}
                        style={{
                            padding: '7px 13px',
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 500,
                            background: active ? 'var(--cue-ink)' : 'var(--cue-surface)',
                            color: active ? 'var(--cue-bg)' : 'var(--cue-ink-2)',
                            border: active ? 'none' : '1px solid var(--cue-hairline)',
                            cursor: 'pointer',
                        }}
                    >
                        {o.label}
                    </button>
                )
            })}
        </div>
    )
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 12,
    background: 'var(--cue-surface)',
    border: '1px solid var(--cue-hairline)',
    color: 'var(--cue-ink)',
    fontSize: 13,
    outline: 'none',
    fontFamily: 'inherit',
}
