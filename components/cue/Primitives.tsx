'use client'

import * as React from 'react'

type Tone = 'default' | 'accent' | 'ok' | 'warn' | 'bad' | 'info' | 'ghost'

const TONE_BG: Record<Tone, string> = {
  default: 'var(--cue-surface-2)',
  accent:  'var(--cue-accent-dim)',
  ok:      'rgba(125,226,160,0.14)',
  warn:    'rgba(255,192,97,0.14)',
  bad:     'rgba(255,122,110,0.14)',
  info:    'rgba(155,200,255,0.14)',
  ghost:   'transparent',
}
const TONE_FG: Record<Tone, string> = {
  default: 'var(--cue-ink-2)',
  accent:  'var(--cue-accent)',
  ok:      'var(--cue-ok)',
  warn:    'var(--cue-warn)',
  bad:     'var(--cue-bad)',
  info:    'var(--cue-info)',
  ghost:   'var(--cue-ink-2)',
}
const TONE_BR: Record<Tone, string> = {
  default: 'var(--cue-hairline)',
  accent:  'transparent',
  ok:      'transparent',
  warn:    'transparent',
  bad:     'transparent',
  info:    'transparent',
  ghost:   'var(--cue-hairline-2)',
}

export function CueTag({
  children,
  tone = 'default',
  className = '',
  style,
}: {
  children: React.ReactNode
  tone?: Tone
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: 0.1,
        background: TONE_BG[tone],
        color: TONE_FG[tone],
        border: `1px solid ${TONE_BR[tone]}`,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  )
}

export function CueAvatar({
  name = '',
  size = 32,
  src,
  hue,
}: {
  name?: string
  size?: number
  src?: string | null
  hue?: number
}) {
  const initials = name.split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase() || '·'
  const h = hue ?? ((name.charCodeAt(0) || 0) * 7) % 360
  if (src) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          flexShrink: 0,
          border: '1px solid var(--cue-hairline)',
        }}
      />
    )
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 600,
        letterSpacing: 0.2,
        color: '#0B0B0D',
        background: `linear-gradient(135deg, oklch(0.78 0.12 ${h}), oklch(0.62 0.14 ${(h + 40) % 360}))`,
      }}
    >
      {initials}
    </div>
  )
}

export function CueCard({
  children,
  className = '',
  padding = 16,
  radius = 14,
  style,
  onClick,
  hover = false,
  as,
}: {
  children: React.ReactNode
  className?: string
  padding?: number | string
  radius?: number
  style?: React.CSSProperties
  onClick?: () => void
  hover?: boolean
  as?: 'div' | 'button' | 'a'
}) {
  const Comp = (as ?? (onClick ? 'button' : 'div')) as React.ElementType
  return (
    <Comp
      onClick={onClick}
      className={className}
      style={{
        background: 'var(--cue-surface)',
        border: '1px solid var(--cue-hairline)',
        borderRadius: radius,
        padding,
        color: 'var(--cue-ink)',
        textAlign: 'left',
        width: onClick ? '100%' : undefined,
        cursor: onClick ? 'pointer' : undefined,
        transition: hover ? 'background 120ms, border-color 120ms' : undefined,
        ...style,
      }}
    >
      {children}
    </Comp>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export function CueButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled,
  type = 'button',
  style,
  fullWidth,
}: {
  children: React.ReactNode
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: (e: React.MouseEvent) => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  style?: React.CSSProperties
  fullWidth?: boolean
}) {
  const sizes = {
    sm: { padding: '6px 10px', fontSize: 12, radius: 8 },
    md: { padding: '9px 14px', fontSize: 13, radius: 10 },
    lg: { padding: '12px 18px', fontSize: 14, radius: 12 },
  }
  const variants: Record<ButtonVariant, React.CSSProperties> = {
    primary:   { background: 'var(--cue-accent)', color: 'var(--cue-accent-ink)', border: '1px solid var(--cue-accent)' },
    secondary: { background: 'transparent', color: 'var(--cue-ink)', border: '1px solid var(--cue-hairline-2)' },
    ghost:     { background: 'transparent', color: 'var(--cue-ink-2)', border: '1px solid transparent' },
    danger:    { background: 'rgba(255,122,110,0.12)', color: 'var(--cue-bad)', border: '1px solid rgba(255,122,110,0.22)' },
  }
  const s = sizes[size]
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        padding: s.padding,
        fontSize: s.fontSize,
        borderRadius: s.radius,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : undefined,
        fontFamily: 'inherit',
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export function CueEyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        fontSize: 12,
        fontWeight: 500,
        color: 'var(--cue-ink-3)',
      }}
    >
      {children}
    </div>
  )
}

/**
 * Modern heading replacement (formerly italic serif). Now sans bold with tight tracking.
 * Component name kept for backwards-compat — visual is no longer serif.
 */
export function CueSerif({
  children,
  size = 28,
  className = '',
  style,
}: {
  children: React.ReactNode
  size?: number
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span
      className={className}
      style={{
        fontSize: size,
        fontWeight: 700,
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
        color: 'var(--cue-ink)',
        ...style,
      }}
    >
      {children}
    </span>
  )
}

/** Reserved for tabular numerals (prices, D-day). Avoid using on Korean labels. */
export function CueMono({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
        fontVariantNumeric: 'tabular-nums',
        ...style,
      }}
    >
      {children}
    </span>
  )
}

export function CueDivider({ className = '' }: { className?: string }) {
  return <div className={className} style={{ height: 1, background: 'var(--cue-hairline)', width: '100%' }} />
}

export function CueProgress({
  value = 0,
  height = 4,
  tone = 'accent',
}: {
  value?: number
  height?: number
  tone?: 'accent' | 'ok' | 'warn' | 'ink'
}) {
  const fg = tone === 'accent' ? 'var(--cue-accent)' : tone === 'ok' ? 'var(--cue-ok)' : tone === 'warn' ? 'var(--cue-warn)' : 'var(--cue-ink)'
  return (
    <div
      style={{
        width: '100%',
        height,
        background: 'var(--cue-surface-3)',
        borderRadius: 999,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          height: '100%',
          background: fg,
          transition: 'width 240ms',
        }}
      />
    </div>
  )
}
