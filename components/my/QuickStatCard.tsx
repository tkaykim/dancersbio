interface QuickStatCardProps {
    label: string
    value: string | number
    /** Tailwind text color classnames are accepted for backward compat (mapped to Cue tones). */
    accent?: string
}

function resolveAccent(accent?: string): string {
    if (!accent) return 'var(--cue-accent)'
    if (accent.includes('primary') || accent.includes('accent')) return 'var(--cue-accent)'
    if (accent.includes('white/60') || accent.includes('ink-3')) return 'var(--cue-ink-3)'
    if (accent.includes('white')) return 'var(--cue-ink)'
    return accent.startsWith('var(') || accent.startsWith('#') ? accent : 'var(--cue-accent)'
}

export default function QuickStatCard({ label, value, accent }: QuickStatCardProps) {
    const color = resolveAccent(accent)
    return (
        <div
            className="rounded-xl p-4 flex-1 min-w-0"
            style={{
                background: 'var(--cue-surface)',
                border: '1px solid var(--cue-hairline)',
            }}
        >
            <p
                style={{
                    fontFamily: 'var(--font-cue-serif), serif',
                    fontStyle: 'italic',
                    fontSize: 26,
                    lineHeight: 1.05,
                    letterSpacing: -0.4,
                    color,
                }}
            >
                {value}
            </p>
            <p
                className="truncate mt-2"
                style={{
                    fontSize: 10,
                    color: 'var(--cue-ink-3)',
                    fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                }}
            >
                {label}
            </p>
        </div>
    )
}
