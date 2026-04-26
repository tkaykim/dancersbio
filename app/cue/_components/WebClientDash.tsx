import * as React from 'react';
import { CUE_LIGHT, WEB_W, WEB_H } from './tokens';
import { Tag } from './Primitives';
import { Ico } from './Icons';
import { WebFrame, WebSidebar } from './Frames';

export function WebClientDash() {
  const T = CUE_LIGHT;
  return (
    <WebFrame url="cue.studio/projects" tabTitle="Projects · HYBE Studio" width={WEB_W} height={WEB_H}>
      <WebSidebar active="projects" role="client" />
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            padding: '18px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${T.hairline}`,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: T.ink3, letterSpacing: 0.4 }}>HYBE STUDIO · PRODUCTIONS</div>
            <div
              style={{
                fontFamily: T.serif,
                fontSize: 28,
                fontStyle: 'italic',
                marginTop: 2,
                letterSpacing: -0.4,
              }}
            >
              Projects<span style={{ color: T.accent }}>.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: T.surface,
                borderRadius: 8,
                border: `1px solid ${T.hairline}`,
                fontSize: 12,
                color: T.ink3,
                width: 240,
              }}
            >
              {Ico.search(T.ink3, 14)}
              <span>Search projects, dancers, dates...</span>
              <span style={{ marginLeft: 'auto', fontFamily: T.mono, fontSize: 10 }}>⌘K</span>
            </div>
            <button
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                background: T.ink,
                color: T.bg,
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {Ico.plus(T.bg, 14)} New project
            </button>
          </div>
        </div>

        <div
          style={{
            padding: '20px 28px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
          }}
        >
          {[
            { l: 'Active', n: '7', sub: 'projects in flight', delta: '+2 this week' },
            { l: 'Open casting', n: '3', sub: 'awaiting dancers', delta: '23 applicants' },
            { l: 'Confirmed crew', n: '34', sub: 'across projects', delta: '94% match' },
            { l: 'Spend YTD', n: '₩ 184M', sub: '67% of budget', delta: 'Ahead by ₩ 12M' },
          ].map((k, i) => (
            <div
              key={i}
              style={{
                padding: 18,
                background: T.surface,
                borderRadius: 14,
                border: `1px solid ${T.hairline}`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: T.ink3,
                  letterSpacing: 0.4,
                  textTransform: 'uppercase',
                }}
              >
                {k.l}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                <span
                  style={{
                    fontFamily: T.serif,
                    fontSize: 36,
                    lineHeight: 1,
                    fontStyle: 'italic',
                    letterSpacing: -1,
                  }}
                >
                  {k.n}
                </span>
                <span style={{ fontSize: 11, color: T.ink3 }}>{k.sub}</span>
              </div>
              <div style={{ fontSize: 11, color: T.ok, marginTop: 8, fontFamily: T.mono }}>
                ↑ {k.delta}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '0 28px 24px' }}>
          <div
            style={{
              background: T.surface,
              borderRadius: 14,
              border: `1px solid ${T.hairline}`,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${T.hairline}`,
              }}
            >
              <div style={{ display: 'flex', gap: 6 }}>
                {['All', 'Active', 'Casting', 'Wrapping', 'Archived'].map((t, i) => (
                  <button
                    key={i}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      background: i === 1 ? T.surface3 : 'transparent',
                      color: i === 1 ? T.ink : T.ink3,
                      fontWeight: i === 1 ? 600 : 500,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 12, color: T.ink3, display: 'flex', gap: 14 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {Ico.filter(T.ink3, 12)} Filter
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {Ico.upDown(T.ink3, 12)} Sort by deadline
                </span>
              </div>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.6fr 1fr 1.2fr 1fr 1fr 1fr 80px',
                padding: '10px 18px',
                fontSize: 11,
                color: T.ink3,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
                borderBottom: `1px solid ${T.hairline}`,
              }}
            >
              <span>Project</span>
              <span>Choreographer</span>
              <span>Crew</span>
              <span>Schedule</span>
              <span>Budget</span>
              <span>Status</span>
              <span></span>
            </div>
            {(
              [
                {
                  p: 'NewJeans · Hyein Solo Stage',
                  p2: 'ADOR · Music Bank',
                  c: 'Lia Kim',
                  cs: 'In rehearsal',
                  crew: '3/4 confirmed',
                  crewPct: 75,
                  sch: 'May 8 → May 12',
                  schWarn: 'Live shoot in 2d',
                  bud: '₩ 7.2M / ₩ 8M',
                  budPct: 90,
                  status: { l: 'Casting', tone: 'warn' as const },
                },
                {
                  p: 'STRAY KIDS · DOMINATE Tour',
                  p2: 'JYP · 4-month world tour',
                  c: 'Sienna Lalau (lead)',
                  cs: '+ 2 assistants',
                  crew: '12/12 confirmed',
                  crewPct: 100,
                  sch: 'Jun 12 → Sep 28',
                  schWarn: 'Kickoff in 6w',
                  bud: '₩ 280M / ₩ 320M',
                  budPct: 87,
                  status: { l: 'Confirmed', tone: 'ok' as const },
                },
                {
                  p: 'aespa · Karina Solo',
                  p2: 'SM · Mini-album promo',
                  c: 'TBD · 3 invited',
                  cs: '',
                  crew: '0/6',
                  crewPct: 0,
                  sch: 'May 22 → Jun 4',
                  schWarn: '',
                  bud: '— / ₩ 24M',
                  budPct: 0,
                  status: { l: 'Drafting', tone: 'default' as const },
                },
                {
                  p: 'IVE · Asia Leg',
                  p2: 'Starship · Tour',
                  c: 'Hyojin Choi',
                  cs: 'Confirmed',
                  crew: '8/10',
                  crewPct: 80,
                  sch: 'Jul 2 → Aug 30',
                  schWarn: '',
                  bud: '₩ 156M / ₩ 180M',
                  budPct: 86,
                  status: { l: 'Casting', tone: 'warn' as const },
                },
                {
                  p: 'CGV · "Movie night" CF',
                  p2: 'Agency · 30s spot',
                  c: 'Bada Lee',
                  cs: 'Confirmed',
                  crew: '6/6 confirmed',
                  crewPct: 100,
                  sch: 'Apr 28',
                  schWarn: 'Tomorrow',
                  bud: '₩ 18M / ₩ 18M',
                  budPct: 100,
                  status: { l: 'Wrapping', tone: 'info' as const },
                },
              ]
            ).map((r, i, arr) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.6fr 1fr 1.2fr 1fr 1fr 1fr 80px',
                  padding: '14px 18px',
                  fontSize: 13,
                  borderBottom: i < arr.length - 1 ? `1px solid ${T.hairline}` : 'none',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: T.ink }}>{r.p}</div>
                  <div style={{ fontSize: 11, color: T.ink3, marginTop: 2 }}>{r.p2}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 500 }}>{r.c}</div>
                  <div style={{ fontSize: 11, color: T.ink3 }}>{r.cs}</div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        background: T.surface3,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${r.crewPct}%`,
                          height: '100%',
                          background: r.crewPct === 100 ? T.ok : r.crewPct > 0 ? T.accent : T.warn,
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: T.ink3, marginTop: 4 }}>{r.crew}</div>
                </div>
                <div>
                  <div style={{ fontFamily: T.mono, fontSize: 12 }}>{r.sch}</div>
                  {r.schWarn && (
                    <div style={{ fontSize: 10, color: T.warn, marginTop: 2 }}>{r.schWarn}</div>
                  )}
                </div>
                <div>
                  <div style={{ fontFamily: T.mono, fontSize: 12 }}>{r.bud}</div>
                  <div
                    style={{
                      height: 3,
                      background: T.surface3,
                      borderRadius: 2,
                      marginTop: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ width: `${r.budPct}%`, height: '100%', background: T.ink }} />
                  </div>
                </div>
                <div>
                  <Tag tone={r.status.tone} dark={false}>
                    {r.status.l}
                  </Tag>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button>{Ico.more(T.ink3, 16)}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WebFrame>
  );
}
