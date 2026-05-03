import * as React from 'react';
import { CUE, CUE_LIGHT, CueTheme } from './tokens';

type Tone = 'default' | 'accent' | 'ok' | 'warn' | 'bad' | 'info' | 'ghost';

export function Avatar({ name = '', size = 28, hue, src }: { name?: string; size?: number; hue?: number; src?: string }) {
  const initials = name.split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase() || '·';
  const h = hue ?? ((name.charCodeAt(0) || 0) * 7) % 360;
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
        }}
      />
    );
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
        color: '#0E0E0C',
        background: `linear-gradient(135deg, oklch(0.78 0.12 ${h}), oklch(0.62 0.14 ${(h + 40) % 360}))`,
      }}
    >
      {initials}
    </div>
  );
}

export function Tag({
  children,
  tone = 'default',
  dark = true,
  style,
}: {
  children: React.ReactNode;
  tone?: Tone;
  dark?: boolean;
  style?: React.CSSProperties;
}) {
  const T: CueTheme = dark ? CUE : CUE_LIGHT;
  const tones: Record<Tone, { bg: string; fg: string; br: string }> = {
    default: { bg: T.surface2, fg: T.ink2, br: T.hairline },
    accent: { bg: T.accentDim, fg: T.accent, br: 'transparent' },
    ok: { bg: 'rgba(125,226,160,0.14)', fg: T.ok, br: 'transparent' },
    warn: { bg: 'rgba(255,192,97,0.14)', fg: T.warn, br: 'transparent' },
    bad: { bg: 'rgba(255,122,110,0.14)', fg: T.bad, br: 'transparent' },
    info: { bg: 'rgba(155,200,255,0.14)', fg: T.info, br: 'transparent' },
    ghost: { bg: 'transparent', fg: T.ink2, br: T.hairline2 },
  };
  const t = tones[tone];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: 0.1,
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.br}`,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function ImgPH({
  w = '100%' as React.CSSProperties['width'],
  h = 120,
  label = 'photo',
  dark = true,
  radius = 12,
  style,
}: {
  w?: React.CSSProperties['width'];
  h?: React.CSSProperties['height'];
  label?: string;
  dark?: boolean;
  radius?: number;
  style?: React.CSSProperties;
}) {
  const T: CueTheme = dark ? CUE : CUE_LIGHT;
  const stripeA = dark ? 'rgba(255,250,235,0.04)' : 'rgba(20,18,12,0.04)';
  const stripeB = dark ? 'rgba(255,250,235,0.08)' : 'rgba(20,18,12,0.08)';
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        background: `repeating-linear-gradient(135deg, ${stripeA} 0 8px, ${stripeB} 8px 16px)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: CUE.mono,
        fontSize: 10,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        color: T.ink3,
        ...style,
      }}
    >
      {label}
    </div>
  );
}
