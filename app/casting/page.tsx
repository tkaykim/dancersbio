'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import MobileContainer from '@/components/layout/MobileContainer'
import { Ico } from '@/components/cue'
import { CASTING_MOCKS, type CastingCategory } from '@/lib/castingMockData'
import CastingCard from './_components/CastingCard'
import PostCastingSheet from './_components/PostCastingSheet'

type FilterValue = 'foryou' | CastingCategory

const FILTER_CHIPS: { value: FilterValue; label: string }[] = [
    { value: 'foryou', label: 'For you' },
    { value: '광고', label: '광고' },
    { value: '안무제작', label: '안무제작' },
    { value: '댄서참여', label: '댄서참여' },
    { value: '강사구인', label: '강사구인' },
    { value: '오디션', label: '오디션' },
    { value: '기타', label: '기타' },
]

export default function CastingPage() {
    const [filter, setFilter] = useState<FilterValue>('foryou')
    const [openPost, setOpenPost] = useState(false)

    const visible = useMemo(() => {
        if (filter === 'foryou') return CASTING_MOCKS
        return CASTING_MOCKS.filter((c) => c.category === filter)
    }, [filter])

    return (
        <MobileContainer>
            <div
                className="min-h-screen pb-24"
                style={{ background: 'var(--cue-bg)', color: 'var(--cue-ink)' }}
            >
                <header
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
                                CASTING · {visible.length} OPEN
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
                            onClick={() => setOpenPost(true)}
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

                    <div
                        className="px-6 pb-3 flex gap-2 overflow-x-auto"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {FILTER_CHIPS.map((chip) => {
                            const active = chip.value === filter
                            return (
                                <button
                                    key={chip.value}
                                    type="button"
                                    onClick={() => setFilter(chip.value)}
                                    style={{
                                        flexShrink: 0,
                                        padding: '6px 12px',
                                        borderRadius: 999,
                                        fontSize: 12,
                                        fontWeight: 500,
                                        background: active ? 'var(--cue-ink)' : 'var(--cue-surface)',
                                        color: active ? 'var(--cue-bg)' : 'var(--cue-ink-2)',
                                        border: active ? 'none' : '1px solid var(--cue-hairline)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {chip.label}
                                </button>
                            )
                        })}
                    </div>
                </header>

                <div className="px-4 pt-4">
                    {visible.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            {visible.map((item) => (
                                <CastingCard key={item.id} item={item} />
                            ))}
                            <Link
                                href="/inbox"
                                className="block mx-2 my-4 py-3 rounded-full text-center font-medium"
                                style={{
                                    background: 'var(--cue-surface-2)',
                                    color: 'var(--cue-ink)',
                                    fontSize: 13,
                                    border: '1px solid var(--cue-hairline)',
                                }}
                            >
                                받은 다이렉트 오퍼 보기
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <PostCastingSheet open={openPost} onClose={() => setOpenPost(false)} />
        </MobileContainer>
    )
}

function EmptyState() {
    return (
        <div className="px-6 pt-12 pb-12 text-center">
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
                이 카테고리엔 아직 공고가 없어요
            </p>
            <p style={{ fontSize: 12, color: 'var(--cue-ink-3)', lineHeight: 1.6 }}>
                다른 카테고리를 둘러보거나
                <br />
                직접 공고를 올려보세요
            </p>
        </div>
    )
}
