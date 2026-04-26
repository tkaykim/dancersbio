import * as React from 'react';
import { CUE_LIGHT, WEB_W, WEB_H } from './tokens';
import { Avatar, Tag } from './Primitives';
import { Ico } from './Icons';
import { WebFrame, WebSidebar } from './Frames';

export function WebProjectDetail() {
  const T = CUE_LIGHT;
  return (
    <WebFrame
      url="cue.studio/projects/hyein-solo"
      tabTitle="Hyein Solo · ADOR"
      width={WEB_W}
      height={WEB_H}
    >
      <WebSidebar active="projects" role="choreo" />
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            padding: '20px 28px 16px',
            borderBottom: `1px solid ${T.hairline}`,
            background: T.surface,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: T.ink3 }}>
            <span>Projects</span>
            {Ico.chev(T.ink3, 10)}
            <span>Active</span>
            {Ico.chev(T.ink3, 10)}
            <span style={{ color: T.ink }}>Hyein Solo</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 10,
            }}
          >
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <Tag tone="warn" dark={false}>
                  Casting · 75%
                </Tag>
                <Tag tone="ghost" dark={false}>
                  ADOR
                </Tag>
                <Tag tone="ghost" dark={false}>
                  Music Bank
                </Tag>
              </div>
              <div
                style={{
                  fontFamily: T.serif,
                  fontSize: 32,
                  fontStyle: 'italic',
                  letterSpacing: -0.6,
                }}
              >
                Hyein — Solo Stage{' '}
                <span
                  style={{
                    color: T.ink3,
                    fontStyle: 'normal',
                    fontFamily: T.sans,
                    fontSize: 18,
                  }}
                >
                  · Backup × 4
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: `1px solid ${T.hairline2}`,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                Share casting call
              </button>
              <button
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: T.ink,
                  color: T.bg,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Publish update
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 28px 8px' }}>
          <div
            style={{
              fontSize: 11,
              color: T.ink3,
              letterSpacing: 0.5,
              marginBottom: 10,
              textTransform: 'uppercase',
            }}
          >
            Subprojects · 3
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {(
              [
                {
                  l: 'Rehearsal #1',
                  d: 'May 8 · 14:00',
                  loc: 'Studio B',
                  pay: '₩ 200K',
                  s: 'done' as const,
                  crew: '4/4',
                },
                {
                  l: 'Rehearsal #2',
                  d: 'May 10 · 13:00',
                  loc: 'Studio B',
                  pay: '₩ 300K',
                  s: 'done' as const,
                  crew: '4/4',
                },
                {
                  l: 'Live Shoot · Music Bank',
                  d: 'May 12 · 06:00',
                  loc: 'KBS Hall',
                  pay: '₩ 1.3M',
                  s: 'next' as const,
                  crew: '3/4',
                },
              ]
            ).map((s, i) => (
              <div
                key={i}
                style={{
                  padding: 14,
                  background: s.s === 'next' ? T.surface : T.surface2,
                  borderRadius: 12,
                  border: `1px solid ${s.s === 'next' ? T.ink : T.hairline}`,
                  opacity: s.s === 'done' ? 0.7 : 1,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.l}</div>
                  {s.s === 'done' && (
                    <Tag tone="ok" dark={false}>
                      Done
                    </Tag>
                  )}
                  {s.s === 'next' && (
                    <Tag tone="accent" dark={false}>
                      Up next
                    </Tag>
                  )}
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.ink2 }}>{s.d}</div>
                <div style={{ fontSize: 11, color: T.ink3, marginTop: 2 }}>
                  {s.loc} · Crew {s.crew}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: `1px dashed ${T.hairline}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 11,
                  }}
                >
                  <span style={{ color: T.ink3 }}>Subtotal</span>
                  <span style={{ fontFamily: T.mono, fontWeight: 600 }}>{s.pay}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: '16px 28px 24px',
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: 16,
          }}
        >
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
                borderBottom: `1px solid ${T.hairline}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Roster</div>
                <div style={{ fontSize: 11, color: T.ink3, marginTop: 2 }}>
                  3 confirmed · 1 in negotiation · 47 applicants
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['Confirmed 3', 'Negotiating 1', 'Shortlist 12', 'New 23'].map((l, i) => (
                  <button
                    key={i}
                    style={{
                      padding: '5px 10px',
                      fontSize: 11,
                      borderRadius: 6,
                      background: i === 1 ? T.surface3 : 'transparent',
                      color: i === 1 ? T.ink : T.ink3,
                      border: `1px solid ${i === 1 ? T.hairline2 : 'transparent'}`,
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {(
              [
                {
                  n: 'Park Jiyoon',
                  m: '7y · Hip-hop',
                  match: 96,
                  ask: '₩ 500K',
                  tone: 'ok' as const,
                  stat: 'Confirmed',
                  star: 4.9,
                },
                {
                  n: 'Min Hyejin',
                  m: '5y · Hip-hop·Jazz',
                  match: 91,
                  ask: '₩ 450K',
                  tone: 'ok' as const,
                  stat: 'Confirmed',
                  star: 4.7,
                },
                {
                  n: 'Yu Soyoung',
                  m: '4y · Heels',
                  match: 88,
                  ask: '₩ 420K',
                  tone: 'ok' as const,
                  stat: 'Confirmed',
                  star: 4.8,
                },
                {
                  n: 'Hwa Yeji',
                  m: '6y · Heels·Jazz Funk',
                  match: 89,
                  ask: '₩ 600K',
                  tone: 'warn' as const,
                  stat: 'Counter sent',
                  star: 5.0,
                  sel: true,
                },
                {
                  n: 'Kim Soeun',
                  m: '3y · Hip-hop',
                  match: 84,
                  ask: '₩ 380K',
                  tone: 'default' as const,
                  stat: 'Shortlist',
                  star: 4.6,
                },
              ]
            ).map((d, i, arr) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1.4fr 80px 1fr 1.2fr 80px',
                  alignItems: 'center',
                  padding: '12px 18px',
                  background: d.sel ? T.surface2 : 'transparent',
                  borderLeft: d.sel ? `2px solid ${T.ink}` : '2px solid transparent',
                  borderBottom: i < arr.length - 1 ? `1px solid ${T.hairline}` : 'none',
                  fontSize: 12,
                }}
              >
                <Avatar name={d.n} size={28} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{d.n}</div>
                  <div style={{ color: T.ink3, fontSize: 11 }}>
                    {d.m} · ★ {d.star}
                  </div>
                </div>
                <div style={{ fontFamily: T.mono, color: T.accent, fontWeight: 700, fontSize: 12 }}>
                  {d.match}%
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 12 }}>{d.ask}</div>
                <Tag tone={d.tone} dark={false}>
                  {d.stat}
                </Tag>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  <button style={{ padding: 4, color: T.ink3 }}>{Ico.msg(T.ink3, 14)}</button>
                  <button style={{ padding: 4, color: T.ink3 }}>{Ico.more(T.ink3, 14)}</button>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: T.surface,
              borderRadius: 14,
              border: `1px solid ${T.hairline}`,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 480,
            }}
          >
            <div
              style={{
                padding: '14px 16px',
                borderBottom: `1px solid ${T.hairline}`,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Avatar name="Hwa Yeji" size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Hwa Yeji</div>
                <div style={{ fontSize: 11, color: T.ink3 }}>Negotiating pay · 2 messages</div>
              </div>
              <Tag tone="warn" dark={false}>
                Counter sent
              </Tag>
            </div>

            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.hairline}` }}>
              <div
                style={{
                  background: T.bg,
                  border: `1px solid ${T.hairline}`,
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: T.ink3,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  Offer · Hyein Solo (3 subprojects)
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 8,
                    fontSize: 11,
                  }}
                >
                  <div>
                    <div style={{ color: T.ink3 }}>Original ask</div>
                    <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                      ₩ 600,000
                    </div>
                  </div>
                  <div>
                    <div style={{ color: T.ink3 }}>Budget cap</div>
                    <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                      ₩ 500,000
                    </div>
                  </div>
                  <div>
                    <div style={{ color: T.ink3 }}>Counter</div>
                    <div
                      style={{
                        fontFamily: T.mono,
                        fontSize: 13,
                        fontWeight: 700,
                        marginTop: 2,
                        color: T.accent,
                      }}
                    >
                      ₩ 540,000
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: `1px dashed ${T.hairline}`,
                    fontSize: 11,
                    color: T.ink3,
                  }}
                >
                  + Travel covered · meals on shoot day · 2hr extra rehearsal compensated
                </div>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                padding: '14px 16px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                <div
                  style={{
                    background: T.surface2,
                    padding: '10px 12px',
                    borderRadius: '12px 12px 12px 2px',
                    fontSize: 12,
                    lineHeight: 1.4,
                  }}
                >
                  안녕하세요! 무대 핏 너무 좋아요. 일정은 다 가능한데 페이가 평소 데이레잇이라 약간만 조정 부탁드릴게요.
                </div>
                <div style={{ fontSize: 10, color: T.ink3, marginTop: 4 }}>Yeji · 11:42</div>
              </div>
              <div style={{ alignSelf: 'flex-end', maxWidth: '80%' }}>
                <div
                  style={{
                    background: T.ink,
                    color: T.bg,
                    padding: '10px 12px',
                    borderRadius: '12px 12px 2px 12px',
                    fontSize: 12,
                    lineHeight: 1.4,
                  }}
                >
                  예지 컨디션 알아서 좋아요. 예산 ₩500K 한도라 ₩540K + 식비/이동 별도로 카운터 드릴게요.
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: T.ink3,
                    marginTop: 4,
                    textAlign: 'right',
                  }}
                >
                  You · 11:48
                </div>
              </div>
              <div
                style={{
                  alignSelf: 'flex-end',
                  maxWidth: '90%',
                  background: T.accentDim,
                  border: `1px solid ${T.accent}`,
                  padding: 10,
                  borderRadius: 10,
                  fontSize: 11,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Counter offer sent</span>
                  <span style={{ fontFamily: T.mono, fontWeight: 700 }}>₩ 540,000</span>
                </div>
                <div style={{ color: T.ink3, marginTop: 4 }}>+ travel + meals · awaiting response</div>
              </div>
              <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                <div
                  style={{
                    background: T.surface2,
                    padding: '10px 12px',
                    borderRadius: '12px 12px 12px 2px',
                    fontSize: 12,
                    lineHeight: 1.4,
                  }}
                >
                  좋아요! 그 조건으로 갈게요. 리허설 첫날 의상 가이드만 미리 받을 수 있을까요?
                </div>
                <div style={{ fontSize: 10, color: T.ink3, marginTop: 4 }}>Yeji · 12:03</div>
              </div>
            </div>

            <div
              style={{
                padding: 12,
                borderTop: `1px solid ${T.hairline}`,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <button
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  fontSize: 11,
                  border: `1px solid ${T.hairline2}`,
                  color: T.ink2,
                  fontWeight: 500,
                }}
              >
                + Offer
              </button>
              <input
                placeholder="Reply to Yeji..."
                style={{
                  flex: 1,
                  fontSize: 12,
                  padding: '8px 10px',
                  background: T.bg,
                  borderRadius: 8,
                  border: `1px solid ${T.hairline}`,
                  color: T.ink,
                }}
              />
              <button
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: T.ink,
                  color: T.bg,
                }}
              >
                {Ico.send(T.bg, 14)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </WebFrame>
  );
}
