'use client'

import Link from 'next/link'
import MobileContainer from '@/components/layout/MobileContainer'
import { Ico } from '@/components/cue'

const FILTER_CHIPS = [
    { label: 'For you', active: true },
    { label: '광고', active: false },
    { label: '안무제작', active: false },
    { label: '댄서참여', active: false },
    { label: '강사구인', active: false },
    { label: '오디션', active: false },
    { label: '기타', active: false },
]

export default function CastingPage() {
    return (
        <MobileContainer>
            <div
                className="min-h-screen pb-24"
                style={{ background: 'var(--cue-bg)', color: 'var(--cue-ink)' }}
            >
                {/* Header */}
                <div
                    className="sticky top-0 z-10 pt-header-safe"
                    style={{
                        background: 'color-mix(in srgb, var(--cue-bg) 92%, transparent)',
                        backdropFilter: 'blur(18px)',
                        WebkitBackdropFilter: 'blur(18px)',
                        borderBottom: '1px solid var(--cue-hairline)',
                    }}
                >
                    <div className="px-6 py-4 flex items-start justify-between">
                        <div>
                            <div
                                style={{
                                    fontSize: 11,
                                    letterSpacing: 1.4,
                                    textTransform: 'uppercase',
                                    color: 'var(--cue-ink-3)',
                                    fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                                    marginBottom: 4,
                                }}
                            >
                                CASTING · 0 OPEN
                            </div>
                            <h1
                                style={{
                                    fontFamily: 'var(--font-cue-serif), serif',
                                    fontStyle: 'italic',
                                    fontSize: 28,
                                    letterSpacing: -0.6,
                                    color: 'var(--cue-ink)',
                                }}
                            >
                                Casting<span style={{ color: 'var(--cue-accent)' }}>.</span>
                            </h1>
                        </div>
                        <button
                            type="button"
                            aria-label="공고 올리기"
                            className="p-2 rounded-full"
                            style={{
                                background: 'var(--cue-surface-2)',
                                color: 'var(--cue-accent)',
                                border: '1px solid var(--cue-hairline)',
                            }}
                        >
                            {Ico.plus('currentColor', 20)}
                        </button>
                    </div>

                    {/* Filter chips */}
                    <div
                        className="px-6 pb-3 flex gap-2 overflow-x-auto"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {FILTER_CHIPS.map((chip) => (
                            <button
                                key={chip.label}
                                type="button"
                                style={{
                                    flexShrink: 0,
                                    padding: '6px 12px',
                                    borderRadius: 999,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    background: chip.active ? 'var(--cue-ink)' : 'var(--cue-surface)',
                                    color: chip.active ? 'var(--cue-bg)' : 'var(--cue-ink-2)',
                                    border: chip.active ? 'none' : '1px solid var(--cue-hairline)',
                                }}
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Empty state — feed not built yet (P2) */}
                <div className="px-6 pt-16 pb-12 text-center">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{
                            background: 'var(--cue-surface)',
                            border: '1px solid var(--cue-hairline)',
                        }}
                    >
                        {Ico.briefcase('var(--cue-ink-4)', 28)}
                    </div>
                    <p
                        style={{
                            fontSize: 14,
                            color: 'var(--cue-ink-2)',
                            marginBottom: 8,
                            lineHeight: 1.5,
                        }}
                    >
                        아직 올라온 공고가 없어요
                    </p>
                    <p
                        style={{
                            fontSize: 12,
                            color: 'var(--cue-ink-3)',
                            marginBottom: 24,
                            lineHeight: 1.6,
                        }}
                    >
                        광고·안무제작·댄서참여·강사구인 등<br />
                        다양한 캐스팅이 곧 열립니다
                    </p>

                    <div
                        className="rounded-2xl p-5 text-left mb-3"
                        style={{
                            background: 'var(--cue-surface)',
                            border: '1px solid var(--cue-hairline)',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 10,
                                fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                                color: 'var(--cue-ink-3)',
                                letterSpacing: 0.6,
                                marginBottom: 8,
                            }}
                        >
                            ↳ 누가 올릴 수 있나요
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--cue-ink-2)', lineHeight: 1.6 }}>
                            클라이언트·안무가·댄서·에이전시 누구나
                            공개 캐스팅 콜 또는 비공개 다이렉트 오퍼를 게시할 수 있어요.
                        </p>
                    </div>

                    <Link
                        href="/inbox"
                        className="inline-block w-full py-3 rounded-full text-center font-medium"
                        style={{
                            background: 'var(--cue-surface-2)',
                            color: 'var(--cue-ink)',
                            fontSize: 13,
                            border: '1px solid var(--cue-hairline)',
                        }}
                    >
                        받은 다이렉트 오퍼 보기
                    </Link>
                </div>
            </div>
        </MobileContainer>
    )
}
