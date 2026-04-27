// Cue design tokens — shared across the app.
// Mirrors app/cue/_components/tokens.ts but exposes them via CSS variables (set in globals.css).
// Use these constants when you need raw color values in TS (e.g. inline SVG fills).

export const CUE = {
  bg:        '#0E0E0C',
  surface:   '#161614',
  surface2:  '#1E1E1B',
  surface3:  '#272723',
  hairline:  'rgba(255,250,235,0.08)',
  hairline2: 'rgba(255,250,235,0.14)',

  ink:       '#F4F0E6',
  ink2:      'rgba(244,240,230,0.72)',
  ink3:      'rgba(244,240,230,0.48)',
  ink4:      'rgba(244,240,230,0.28)',

  accent:    '#22C55E',
  accentInk: '#0E0E0C',
  accentDim: 'rgba(34,197,94,0.18)',

  ok:        '#7DE2A0',
  warn:      '#FFC061',
  bad:       '#FF7A6E',
  info:      '#9BC8FF',

  sans:   'var(--font-cue-sans), "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  serif:  'var(--font-cue-serif), "Times New Roman", serif',
  mono:   'var(--font-cue-mono), ui-monospace, "SF Mono", Menlo, monospace',

  r1: 8, r2: 12, r3: 18, r4: 24, r5: 32,
} as const;

export const CUE_LIGHT = {
  bg:        '#F6F3EC',
  surface:   '#FFFFFF',
  surface2:  '#F0ECE2',
  surface3:  '#E6E1D3',
  hairline:  'rgba(20,18,12,0.08)',
  hairline2: 'rgba(20,18,12,0.14)',
  ink:       '#14120C',
  ink2:      'rgba(20,18,12,0.72)',
  ink3:      'rgba(20,18,12,0.50)',
  ink4:      'rgba(20,18,12,0.28)',
  accent:    '#7CC435',
  accentInk: '#0E0E0C',
  accentDim: 'rgba(124,196,53,0.16)',
  ok: '#2E9D5C', warn: '#C77A12', bad: '#D64A3D', info: '#3878C8',
  sans: CUE.sans, serif: CUE.serif, mono: CUE.mono,
  r1: 8, r2: 12, r3: 18, r4: 24, r5: 32,
} as const;

export type CueTheme = typeof CUE | typeof CUE_LIGHT;
