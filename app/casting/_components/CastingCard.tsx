'use client'

import Link from 'next/link'
import { Ico, BookmarkButton } from '@/components/cue'
import { formatPay, type CastingMock } from '@/lib/castingMockData'

interface Props {
    item: CastingMock
}

const OFFER_MODEL_LABEL: Record<CastingMock['offerModel'], string> = {
    public: '공개 캐스팅',
    direct: '다이렉트 오퍼',
    hybrid: '공개+초대',
}

export default function CastingCard({ item }: Props) {
    if (item.featured) return <FeaturedCard item={item} />
    return <DefaultCard item={item} />
}

function DefaultCard({ item }: Props) {
    return (
        <Link
            href={`/casting/${item.id}`}
            style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
        >
            <article
                style={{
                    background: 'var(--cue-surface)',
                    borderRadius: 18,
                    padding: 16,
                    marginBottom: 12,
                    border: '1px solid var(--cue-hairline)',
                    cursor: 'pointer',
                }}
            >
                <header
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 10,
                    }}
                >
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <Chip tone="accent">{item.category}</Chip>
                        {item.tags.slice(0, 2).map((t) => (
                            <Chip key={t}>{t}</Chip>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {item.deadlineLabel && (
                            <span
                                style={{
                                    fontSize: 11,
                                    color: 'var(--cue-ink-3)',
                                    fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                                }}
                            >
                                {item.deadlineLabel}
                            </span>
                        )}
                        <BookmarkButton kind="casting" id={item.id} size={18} />
                    </div>
                </header>

                <h3
                    style={{
                        fontSize: 16,
                        fontWeight: 600,
                        lineHeight: 1.3,
                        letterSpacing: -0.2,
                        color: 'var(--cue-ink)',
                    }}
                >
                    {item.title}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--cue-ink-3)', marginTop: 4 }}>
                    {item.poster} · {OFFER_MODEL_LABEL[item.offerModel]}
                </p>

                <footer
                    style={{
                        marginTop: 14,
                        paddingTop: 12,
                        borderTop: '1px dashed var(--cue-hairline)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                                fontSize: 13,
                                fontWeight: 600,
                                color: 'var(--cue-ink)',
                            }}
                        >
                            {formatPay(item.pay)}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--cue-ink-3)', marginTop: 2 }}>
                            {item.schedule}
                            {item.location ? ` · ${item.location}` : ''}
                        </div>
                    </div>
                    {Ico.arrow('var(--cue-ink-2)', 16)}
                </footer>
            </article>
        </Link>
    )
}

function FeaturedCard({ item }: Props) {
    return (
        <Link
            href={`/casting/${item.id}`}
            style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
        >
            <article
                style={{
                    background: 'var(--cue-accent)',
                    color: 'var(--cue-accent-ink)',
                    borderRadius: 22,
                    padding: 18,
                    marginBottom: 14,
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                }}
            >
                <header
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                    }}
                >
                    <span
                        style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: 1.2,
                            fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                        }}
                    >
                        ↳ FEATURED · {item.category.toUpperCase()}
                    </span>
                    {item.deadlineLabel && (
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '3px 8px',
                                background: 'var(--cue-accent-ink)',
                                color: 'var(--cue-accent)',
                                borderRadius: 999,
                            }}
                        >
                            {item.deadlineLabel}
                        </span>
                    )}
                </header>

                <h3
                    style={{
                        fontFamily: 'var(--font-cue-serif), serif',
                        fontStyle: 'italic',
                        fontSize: 24,
                        lineHeight: 1.1,
                        marginTop: 14,
                        letterSpacing: -0.3,
                    }}
                >
                    {item.title}
                </h3>

                <p style={{ fontSize: 13, marginTop: 10, opacity: 0.75, fontWeight: 500 }}>
                    {item.poster}
                </p>

                <footer
                    style={{
                        marginTop: 14,
                        padding: '12px 0 0',
                        borderTop: '1px solid rgba(14,14,12,0.18)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                                fontSize: 14,
                                fontWeight: 700,
                            }}
                        >
                            {formatPay(item.pay)}
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.65, marginTop: 2 }}>{item.schedule}</div>
                    </div>
                    <Link
                        href={`/casting/${item.id}?apply=1`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            padding: '10px 16px',
                            background: 'var(--cue-accent-ink)',
                            color: 'var(--cue-accent)',
                            borderRadius: 999,
                            fontSize: 13,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            border: 'none',
                            textDecoration: 'none',
                        }}
                    >
                        지원하기 {Ico.arrow('var(--cue-accent)', 14)}
                    </Link>
                </footer>

                <div
                    style={{
                        position: 'absolute',
                        top: 14,
                        right: 78,
                    }}
                >
                    <BookmarkButton kind="casting" id={item.id} size={18} />
                </div>
            </article>
        </Link>
    )
}

function Chip({
    children,
    tone = 'default',
}: {
    children: React.ReactNode
    tone?: 'default' | 'accent'
}) {
    return (
        <span
            style={{
                fontSize: 10,
                padding: '3px 8px',
                borderRadius: 999,
                background: tone === 'accent' ? 'var(--cue-accent-dim)' : 'var(--cue-surface-2)',
                color: tone === 'accent' ? 'var(--cue-accent)' : 'var(--cue-ink-2)',
                border: '1px solid var(--cue-hairline)',
                fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                letterSpacing: 0.4,
                textTransform: 'uppercase',
            }}
        >
            {children}
        </span>
    )
}
