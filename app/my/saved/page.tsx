'use client'

import Link from 'next/link'
import MobileContainer from '@/components/layout/MobileContainer'
import { Ico } from '@/components/cue'
import { useBookmarks, useIsHydrated } from '@/hooks/useBookmarks'
import { CASTING_MOCKS } from '@/lib/castingMockData'
import CastingCard from '@/app/casting/_components/CastingCard'
import { useBackWithFallback } from '@/lib/useBackWithFallback'

export default function SavedPage() {
    const { list } = useBookmarks()
    const hydrated = useIsHydrated()
    const goBack = useBackWithFallback('/my')

    const savedCastings = hydrated
        ? list('casting')
              .map((entry) => CASTING_MOCKS.find((m) => m.id === entry.id))
              .filter((c): c is (typeof CASTING_MOCKS)[number] => Boolean(c))
        : []

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
                    <div className="px-6 py-4 flex items-start gap-3">
                        <button
                            type="button"
                            aria-label="뒤로"
                            onClick={goBack}
                            className="p-2 rounded-full"
                            style={{
                                background: 'var(--cue-surface)',
                                border: '1px solid var(--cue-hairline)',
                                color: 'var(--cue-ink)',
                            }}
                        >
                            {Ico.chevLeft('currentColor', 16)}
                        </button>
                        <div>
                            <h1
                                style={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    letterSpacing: '-0.02em',
                                    color: 'var(--cue-ink)',
                                }}
                            >
                                저장한 항목
                            </h1>
                            <p
                                style={{
                                    fontSize: 12,
                                    color: 'var(--cue-ink-3)',
                                    marginTop: 2,
                                }}
                            >
                                {hydrated ? `${savedCastings.length}건` : ''}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="px-4 pt-4">
                    {!hydrated ? null : savedCastings.length === 0 ? (
                        <EmptyState />
                    ) : (
                        savedCastings.map((item) => <CastingCard key={item.id} item={item} />)
                    )}
                </div>
            </div>
        </MobileContainer>
    )
}

function EmptyState() {
    return (
        <div className="px-6 pt-16 pb-12 text-center">
            <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                    background: 'var(--cue-surface)',
                    border: '1px solid var(--cue-hairline)',
                }}
            >
                {Ico.bookmark('var(--cue-ink-4)', 28)}
            </div>
            <p
                style={{
                    fontSize: 14,
                    color: 'var(--cue-ink-2)',
                    marginBottom: 8,
                    lineHeight: 1.5,
                }}
            >
                아직 저장한 캐스팅이 없어요
            </p>
            <p style={{ fontSize: 12, color: 'var(--cue-ink-3)', marginBottom: 24, lineHeight: 1.6 }}>
                마음에 드는 공고에 북마크를 누르면
                <br />
                여기서 다시 확인할 수 있어요
            </p>
            <Link
                href="/casting"
                className="inline-block px-5 py-3 rounded-full font-medium"
                style={{
                    background: 'var(--cue-accent)',
                    color: 'var(--cue-accent-ink)',
                    fontSize: 13,
                    border: 'none',
                }}
            >
                캐스팅 둘러보기
            </Link>
        </div>
    )
}
