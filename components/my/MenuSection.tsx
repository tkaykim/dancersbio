import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface MenuItem {
    label: string
    href: string
    icon: LucideIcon
    badge?: string | number
    /** Tailwind classnames are accepted but mapped to Cue tones. */
    badgeColor?: string
}

interface MenuSectionProps {
    items: MenuItem[]
}

function resolveBadgeStyle(badgeColor?: string): React.CSSProperties {
    if (badgeColor?.includes('red')) {
        return {
            background: 'color-mix(in srgb, var(--cue-bad) 18%, transparent)',
            color: 'var(--cue-bad)',
        }
    }
    if (badgeColor?.includes('green')) {
        return {
            background: 'color-mix(in srgb, var(--cue-ok) 18%, transparent)',
            color: 'var(--cue-ok)',
        }
    }
    return {
        background: 'color-mix(in srgb, var(--cue-accent) 20%, transparent)',
        color: 'var(--cue-accent)',
    }
}

export default function MenuSection({ items }: MenuSectionProps) {
    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{
                background: 'var(--cue-surface)',
                border: '1px solid var(--cue-hairline)',
            }}
        >
            {items.map((item, idx) => (
                <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    className="flex items-center justify-between w-full min-h-[52px] px-5 py-4 transition-colors cursor-pointer touch-manipulation"
                    style={{
                        borderBottom: idx < items.length - 1 ? '1px solid var(--cue-hairline)' : undefined,
                    }}
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <item.icon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--cue-ink-2)' }} />
                        <span style={{ color: 'var(--cue-ink)', fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {item.badge !== undefined && item.badge !== 0 && (
                            <span
                                className="px-2 py-0.5 rounded-full"
                                style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                                    letterSpacing: 0.4,
                                    ...resolveBadgeStyle(item.badgeColor),
                                }}
                            >
                                {item.badge}
                            </span>
                        )}
                        <ChevronRight className="w-4 h-4" style={{ color: 'var(--cue-ink-4)' }} />
                    </div>
                </Link>
            ))}
        </div>
    )
}
