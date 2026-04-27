'use client'

import { useEffect, useState } from 'react'
import { Ico } from '@/components/cue'
import { formatPay, type CastingMock } from '@/lib/castingMockData'

interface Props {
    open: boolean
    onClose: () => void
    casting: CastingMock
}

export default function ApplyCastingSheet({ open, onClose, casting }: Props) {
    const [message, setMessage] = useState('')
    const [reel, setReel] = useState('')
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        if (!open) {
            setSubmitted(false)
            return
        }
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
                                fontSize: 12,
                                fontWeight: 500,
                                color: 'var(--cue-ink-3)',
                            }}
                        >
                            지원 · {casting.category}
                        </div>
                        <h2
                            style={{
                                fontSize: 20,
                                fontWeight: 700,
                                letterSpacing: '-0.02em',
                                color: 'var(--cue-ink)',
                                marginTop: 2,
                            }}
                        >
                            지원하기
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
                    <SuccessBlock onClose={onClose} casting={casting} />
                ) : (
                    <form onSubmit={handleSubmit} style={{ padding: 20, display: 'grid', gap: 18 }}>
                        <div
                            style={{
                                padding: 14,
                                borderRadius: 14,
                                background: 'var(--cue-surface)',
                                border: '1px solid var(--cue-hairline)',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color: 'var(--cue-ink-3)',
                                    marginBottom: 6,
                                }}
                            >
                                지원 대상
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--cue-ink)', lineHeight: 1.4 }}>
                                {casting.title}
                            </div>
                            <div
                                style={{
                                    fontSize: 12,
                                    color: 'var(--cue-ink-3)',
                                    marginTop: 6,
                                    fontVariantNumeric: 'tabular-nums',
                                }}
                            >
                                {casting.poster} · {formatPay(casting.pay)}
                            </div>
                        </div>

                        <Field label="간단한 자기소개 / 메시지">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={5}
                                placeholder="활동명, 주요 경력, 지원 동기 등을 자유롭게 적어주세요"
                                style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
                                required
                            />
                        </Field>

                        <Field label="릴 / 포트폴리오 링크">
                            <input
                                type="url"
                                value={reel}
                                onChange={(e) => setReel(e.target.value)}
                                placeholder="https://www.instagram.com/reel/..."
                                style={inputStyle}
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
                            현재는 UI 스캐폴드입니다. 백엔드 연동 후 클라이언트의 받은 제안함으로 발송됩니다.
                        </div>

                        <button
                            type="submit"
                            disabled={!message}
                            style={{
                                padding: '14px 18px',
                                borderRadius: 999,
                                background: message ? 'var(--cue-accent)' : 'var(--cue-surface-2)',
                                color: message ? 'var(--cue-accent-ink)' : 'var(--cue-ink-3)',
                                fontWeight: 700,
                                fontSize: 14,
                                border: 'none',
                                cursor: message ? 'pointer' : 'not-allowed',
                            }}
                        >
                            지원서 보내기
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

function SuccessBlock({ onClose, casting }: { onClose: () => void; casting: CastingMock }) {
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
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: 'var(--cue-ink)',
                }}
            >
                지원 준비 완료
            </h3>
            <p style={{ fontSize: 13, color: 'var(--cue-ink-3)', marginTop: 8, lineHeight: 1.6 }}>
                백엔드 연동 후 &quot;{casting.poster}&quot;에게
                <br />
                실제 지원서가 발송됩니다.
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
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--cue-ink-2)',
                    marginBottom: 8,
                }}
            >
                {label}
            </div>
            {children}
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
