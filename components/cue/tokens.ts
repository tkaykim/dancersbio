// Cue design tokens — shared across the app.
// Mirrors app/cue/_components/tokens.ts but exposes them via CSS variables (set in globals.css).
// Use these constants when you need raw color values in TS (e.g. inline SVG fills).

export const CUE = {
  bg:        '#0B0B0D',
  surface:   '#15151A',
  surface2:  '#1E1E24',
  surface3:  '#28282F',
  hairline:  'rgba(255,255,255,0.08)',
  hairline2: 'rgba(255,255,255,0.14)',

  ink:       '#FAFAFA',
  ink2:      'rgba(250,250,250,0.72)',
  ink3:      'rgba(250,250,250,0.48)',
  ink4:      'rgba(250,250,250,0.28)',

  accent:    '#22C55E',
  accentInk: '#0B0B0D',
  accentDim: 'rgba(34,197,94,0.18)',

  ok:        '#7DE2A0',
  warn:      '#FFC061',
  bad:       '#FF7A6E',
  info:      '#9BC8FF',

  sans:   'var(--font-cue-sans), "Pretendard", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif',
  // serif alias kept for legacy refs — points to sans so no Times fallback
  serif:  'var(--font-cue-sans), "Pretendard", system-ui, sans-serif',
  mono:   'var(--font-cue-mono), ui-monospace, "SF Mono", Menlo, monospace',

  r1: 8, r2: 12, r3: 18, r4: 24, r5: 32,
} as const;

export const CUE_LIGHT = {
  bg:        '#FAFAFA',
  surface:   '#FFFFFF',
  surface2:  '#F2F2F4',
  surface3:  '#E8E8EC',
  hairline:  'rgba(11,11,13,0.08)',
  hairline2: 'rgba(11,11,13,0.14)',
  ink:       '#0B0B0D',
  ink2:      'rgba(11,11,13,0.72)',
  ink3:      'rgba(11,11,13,0.50)',
  ink4:      'rgba(11,11,13,0.28)',
  accent:    '#16A34A',
  accentInk: '#FFFFFF',
  accentDim: 'rgba(22,163,74,0.14)',
  ok: '#2E9D5C', warn: '#C77A12', bad: '#D64A3D', info: '#3878C8',
  sans: CUE.sans, serif: CUE.serif, mono: CUE.mono,
  r1: 8, r2: 12, r3: 18, r4: 24, r5: 32,
} as const;

export type CueTheme = typeof CUE | typeof CUE_LIGHT;
