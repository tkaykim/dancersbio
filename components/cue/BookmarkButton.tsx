'use client'

import { useState } from 'react'
import { Ico } from './Icons'
import { useBookmarks, useIsHydrated, type BookmarkKind } from '@/hooks/useBookmarks'

interface Props {
    kind: BookmarkKind
    id: string
    size?: number
    className?: string
    label?: string
}

export default function BookmarkButton({ kind, id, size = 20, className, label }: Props) {
    const { isBookmarked, toggle } = useBookmarks()
    const hydrated = useIsHydrated()
    const [pulse, setPulse] = useState(false)
    const active = hydrated && isBookmarked(kind, id)

    return (
        <button
            type="button"
            aria-label={label ?? (active ? '북마크 해제' : '북마크')}
            aria-pressed={active}
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const next = toggle(kind, id)
                if (next) {
                    setPulse(true)
                    window.setTimeout(() => setPulse(false), 220)
                }
            }}
            className={className}
            style={{
                background: 'transparent',
                border: 'none',
                padding: 6,
                cursor: 'pointer',
                color: active ? 'var(--cue-accent)' : 'var(--cue-ink-3)',
                transform: pulse ? 'scale(1.18)' : 'scale(1)',
                transition: 'transform 180ms ease, color 120ms ease',
                lineHeight: 0,
            }}
        >
            {(active ? Ico.bookmarkF : Ico.bookmark)('currentColor', size)}
        </button>
    )
}
