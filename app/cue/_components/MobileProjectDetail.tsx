import * as React from 'react';
import { CUE } from './tokens';
import { Avatar, Tag } from './Primitives';
import { Ico } from './Icons';
import { Phone, iconBtn } from './Frames';

export function MobileProjectDetail() {
  return (
    <Phone>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div
          style={{
            height: 220,
            position: 'relative',
            overflow: 'hidden',
            background: `repeating-linear-gradient(120deg, rgba(34,197,94,0.08) 0 16px, rgba(34,197,94,0.18) 16px 32px)`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 16,
              right: 16,
              display: 'flex',
              justifyContent: 'space-between',
              zIndex: 5,
            }}
          >
            <button style={iconBtn}>{Ico.chev(CUE.ink, 16)}</button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={iconBtn}>{Ico.bookmark(CUE.ink, 18)}</button>
              <button style={iconBtn}>{Ico.more(CUE.ink, 18)}</button>
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: 20,
              background: 'linear-gradient(to top, rgba(14,14,12,1), transparent)',
            }}
          >
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <Tag tone="accent">In progress</Tag>
              <Tag tone="ghost">Backup × 4</Tag>
            </div>
            <div
              style={{
                fontFamily: CUE.serif,
                fontSize: 28,
                fontStyle: 'italic',
                lineHeight: 1.05,
                letterSpacing: -0.5,
              }}
            >
              Hyein — Solo Stage
              <br />
              Music Bank
            </div>
          </div>
        </div>

        <div
          style={{
            margin: '14px 16px',
            padding: '14px 16px',
            background: CUE.surface,
            borderRadius: 16,
            border: `1px solid ${CUE.hairline}`,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 14,
          }}
        >
          {[
            ['Client', 'ADOR'],
            ['Choreo', 'Lia Kim'],
            ['Total pay', '₩ 1,800,000'],
            ['Confirmed', '3 / 4 dancers'],
          ].map(([k, v], i) => (
            <div key={i}>
              <div
                style={{
                  fontSize: 10,
                  color: CUE.ink3,
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                }}
              >
                {k}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  marginTop: 2,
                  fontFamily: i === 2 ? CUE.mono : CUE.sans,
                  color: i === 2 ? CUE.accent : CUE.ink,
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            padding: '8px 20px 8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: CUE.ink3 }}>
            ↳ SCHEDULE · 3 SUBPROJECTS
          </div>
          <span style={{ fontSize: 11, color: CUE.ink3, fontFamily: CUE.mono }}>2/3</span>
        </div>

        <div style={{ padding: '0 16px 8px', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: 16 + 18,
              top: 16,
              bottom: 16,
              width: 1.5,
              background: CUE.hairline2,
            }}
          />
          {[
            {
              done: true,
              label: 'Rehearsal #1',
              date: 'May 8 · Wed',
              time: '14:00–18:00',
              loc: 'ADOR Studio B · Yongsan',
              pay: '₩ 200,000',
            },
            {
              done: true,
              label: 'Rehearsal #2',
              date: 'May 10 · Fri',
              time: '13:00–19:00',
              loc: 'ADOR Studio B · Yongsan',
              pay: '₩ 300,000',
            },
            {
              done: false,
              current: true,
              label: 'Live Shoot · Music Bank',
              date: 'May 12 · Sun',
              time: 'Call 06:00 · Wrap 17:00',
              loc: 'KBS Hall · Yeouido',
              pay: '₩ 1,300,000',
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 16,
                padding: '14px 0',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div style={{ position: 'relative', width: 36, flexShrink: 0, paddingTop: 2 }}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    background: s.done ? CUE.accent : s.current ? CUE.bg : CUE.surface,
                    border: s.current ? `2px solid ${CUE.accent}` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 9,
                  }}
                >
                  {s.done && Ico.check(CUE.accentInk, 12)}
                  {s.current && (
                    <div style={{ width: 6, height: 6, borderRadius: 999, background: CUE.accent }} />
                  )}
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  background: s.current ? CUE.surface : 'transparent',
                  border: s.current ? `1px solid ${CUE.hairline2}` : `1px solid ${CUE.hairline}`,
                  borderRadius: 14,
                  padding: 14,
                  opacity: s.done ? 0.62 : 1,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{s.label}</div>
                  {s.current && <Tag tone="accent">Up next</Tag>}
                  {s.done && <Tag tone="ok">Done</Tag>}
                </div>
                <div style={{ fontSize: 12, color: CUE.ink2, marginTop: 6, fontFamily: CUE.mono }}>
                  {s.date} · {s.time}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: CUE.ink3,
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {Ico.pin2(CUE.ink3, 12)} {s.loc}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: `1px dashed ${CUE.hairline}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 11,
                  }}
                >
                  <span style={{ color: CUE.ink3 }}>Subtotal</span>
                  <span style={{ fontFamily: CUE.mono, color: CUE.ink, fontWeight: 600 }}>{s.pay}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            padding: '20px 20px 8px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.2,
            color: CUE.ink3,
          }}
        >
          ↳ CREW · 4 DANCERS
        </div>
        <div style={{ padding: '0 16px 8px', display: 'flex', gap: 10, overflowX: 'auto' }}>
          {[
            { n: 'Park J.', s: 'You', a: true },
            { n: 'Min H.', s: 'Confirmed', a: true },
            { n: 'Hwa Y.', s: 'Confirmed', a: true },
            { n: '?', s: 'Casting', a: false },
          ].map((c, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                width: 96,
                background: CUE.surface,
                borderRadius: 14,
                padding: 12,
                border: `1px solid ${CUE.hairline}`,
                textAlign: 'center',
              }}
            >
              {c.a ? (
                <Avatar name={c.n} size={48} />
              ) : (
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 999,
                    border: `1.5px dashed ${CUE.hairline2}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    color: CUE.ink3,
                    fontSize: 18,
                  }}
                >
                  ?
                </div>
              )}
              <div style={{ fontSize: 12, fontWeight: 500, marginTop: 8 }}>{c.n}</div>
              <div
                style={{
                  fontSize: 10,
                  marginTop: 2,
                  color: c.a ? (c.s === 'You' ? CUE.accent : CUE.ink3) : CUE.warn,
                }}
              >
                {c.s}
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 100 }} />
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: 16,
          right: 16,
          zIndex: 5,
          display: 'flex',
          gap: 8,
        }}
      >
        <button
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: 999,
            background: CUE.accent,
            color: CUE.accentInk,
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {Ico.msg(CUE.accentInk, 16)} Crew chat{' '}
          <span style={{ fontFamily: CUE.mono, fontSize: 11, opacity: 0.7 }}>· 2 new</span>
        </button>
      </div>
    </Phone>
  );
}
