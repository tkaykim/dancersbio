import * as React from 'react';
import { CUE, CUE_LIGHT, CueTheme, PHONE_W, PHONE_H } from './tokens';
import { Ico } from './Icons';

export const iconBtn: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 999,
  background: CUE.surface,
  border: `1px solid ${CUE.hairline}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export function Phone({
  children,
  bg = CUE.bg,
  hideHome = false,
}: {
  children: React.ReactNode;
  bg?: string;
  hideHome?: boolean;
}) {
  return (
    <div
      className="cue"
      style={{
        width: PHONE_W,
        height: PHONE_H,
        background: bg,
        color: CUE.ink,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: CUE.sans,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: 54,
          padding: '14px 28px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 16,
          fontWeight: 600,
          color: CUE.ink,
          position: 'relative',
          zIndex: 5,
        }}
      >
        <span style={{ letterSpacing: -0.2 }}>9:41</span>
        <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <svg width="18" height="11" viewBox="0 0 18 11">
            <g fill={CUE.ink}>
              <rect x="0" y="7" width="3" height="4" rx="0.6" />
              <rect x="5" y="4.5" width="3" height="6.5" rx="0.6" />
              <rect x="10" y="2" width="3" height="9" rx="0.6" />
              <rect x="15" y="0" width="3" height="11" rx="0.6" />
            </g>
          </svg>
          <svg width="24" height="11" viewBox="0 0 24 11" fill="none">
            <rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke={CUE.ink} strokeOpacity="0.5" />
            <rect x="2" y="2" width="17" height="7" rx="1.4" fill={CUE.ink} />
            <path d="M22 3.5v4c0.7-0.2 1.2-1 1.2-2s-0.5-1.8-1.2-2z" fill={CUE.ink} fillOpacity="0.5" />
          </svg>
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 11,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 124,
          height: 36,
          borderRadius: 18,
          background: '#000',
          zIndex: 10,
        }}
      />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>{children}</div>
      {!hideHome && (
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 134,
            height: 5,
            borderRadius: 3,
            background: CUE.ink,
            opacity: 0.95,
            zIndex: 5,
          }}
        />
      )}
    </div>
  );
}

type TabKey = 'feed' | 'crew' | 'inbox' | 'work' | 'me';

export function TabBar({ active = 'feed' }: { active?: TabKey }) {
  const items: { k: TabKey; label: string; ic: keyof typeof Ico; badge?: number }[] = [
    { k: 'feed', label: 'Casting', ic: 'briefcase' },
    { k: 'crew', label: 'Crew', ic: 'user' },
    { k: 'inbox', label: 'Inbox', ic: 'msg', badge: 3 },
    { k: 'work', label: 'Work', ic: 'cal' },
    { k: 'me', label: 'Me', ic: 'home' },
  ];
  return (
    <div
      style={{
        borderTop: `0.5px solid ${CUE.hairline2}`,
        background: 'rgba(14,14,12,0.92)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        padding: '8px 0 22px',
        display: 'flex',
        justifyContent: 'space-around',
      }}
    >
      {items.map((it) => {
        const on = it.k === active;
        return (
          <div
            key={it.k}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              color: on ? CUE.accent : CUE.ink3,
              position: 'relative',
            }}
          >
            {it.badge ? (
              <div
                style={{
                  position: 'absolute',
                  top: -2,
                  right: 8,
                  minWidth: 14,
                  height: 14,
                  padding: '0 4px',
                  borderRadius: 7,
                  background: CUE.bad,
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {it.badge}
              </div>
            ) : null}
            {Ico[it.ic]('currentColor', 22)}
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: 0.1 }}>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function WebFrame({
  url = 'cue.studio/dashboard',
  tabTitle = 'Cue · Client',
  children,
  dark = false,
  width,
  height,
}: {
  url?: string;
  tabTitle?: string;
  children: React.ReactNode;
  dark?: boolean;
  width: number;
  height: number;
}) {
  const T: CueTheme = dark ? CUE : CUE_LIGHT;
  return (
    <div
      className="cue"
      style={{
        width,
        height,
        borderRadius: 12,
        overflow: 'hidden',
        background: T.bg,
        color: T.ink,
        boxShadow: '0 30px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: T.sans,
      }}
    >
      <div
        style={{
          height: 38,
          background: dark ? '#1a1a17' : '#E8E3D6',
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          gap: 10,
          borderBottom: `1px solid ${T.hairline}`,
        }}
      >
        <div style={{ display: 'flex', gap: 7 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F57' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FEBC2E' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28C840' }} />
        </div>
        <div
          style={{
            flex: 1,
            height: 24,
            borderRadius: 6,
            background: dark ? '#0e0e0c' : '#F6F3EC',
            border: `1px solid ${T.hairline}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            gap: 8,
            fontSize: 11,
            color: T.ink3,
            fontFamily: T.mono,
          }}
        >
          <span style={{ opacity: 0.5 }}>⌥</span>
          <span>{url}</span>
        </div>
        <div style={{ fontSize: 10, color: T.ink3 }}>{tabTitle}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

export function WebSidebar({
  active = 'projects',
  role = 'client',
}: {
  active?: string;
  role?: 'client' | 'choreo';
}) {
  const T = CUE_LIGHT;
  const sections: { l: string; k: string; i: keyof typeof Ico; n?: number }[] =
    role === 'client'
      ? [
          { l: 'Overview', k: 'overview', i: 'home' },
          { l: 'Projects', k: 'projects', i: 'briefcase', n: 7 },
          { l: 'Casting', k: 'casting', i: 'user', n: 23 },
          { l: 'Calendar', k: 'calendar', i: 'cal' },
          { l: 'Messages', k: 'messages', i: 'msg', n: 4 },
          { l: 'Billing', k: 'billing', i: 'won' },
        ]
      : [
          { l: 'Studio', k: 'studio', i: 'home' },
          { l: 'My projects', k: 'projects', i: 'briefcase', n: 4 },
          { l: 'Crew pool', k: 'crew', i: 'user' },
          { l: 'Casting calls', k: 'calls', i: 'spark', n: 12 },
          { l: 'Calendar', k: 'calendar', i: 'cal' },
          { l: 'Messages', k: 'messages', i: 'msg' },
        ];
  return (
    <div
      style={{
        width: 220,
        background: T.surface2,
        borderRight: `1px solid ${T.hairline}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px 24px' }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: T.ink,
            color: T.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: T.serif,
            fontStyle: 'italic',
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          c
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>Cue</div>
          <div style={{ fontSize: 10, color: T.ink3, letterSpacing: 0.4 }}>{role.toUpperCase()}</div>
        </div>
      </div>

      {sections.map((s) => {
        const on = s.k === active;
        return (
          <div
            key={s.k}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 8,
              marginBottom: 2,
              background: on ? T.surface : 'transparent',
              color: on ? T.ink : T.ink2,
              fontSize: 13,
              fontWeight: on ? 600 : 500,
              border: on ? `1px solid ${T.hairline}` : `1px solid transparent`,
            }}
          >
            {Ico[s.i]('currentColor', 16)}
            <span style={{ flex: 1 }}>{s.l}</span>
            {s.n ? (
              <span style={{ fontSize: 10, fontFamily: T.mono, color: T.ink3 }}>{s.n}</span>
            ) : null}
          </div>
        );
      })}

      <div style={{ flex: 1 }} />
      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          padding: '10px 8px',
          borderRadius: 10,
          background: T.surface,
          border: `1px solid ${T.hairline}`,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, oklch(0.78 0.12 200), oklch(0.62 0.14 240))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0E0E0C',
            fontWeight: 600,
            fontSize: 11,
          }}
        >
          HS
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>HYBE Studio</div>
          <div style={{ fontSize: 10, color: T.ink3 }}>Producer · Sora L.</div>
        </div>
      </div>
    </div>
  );
}
