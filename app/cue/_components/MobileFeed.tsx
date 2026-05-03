import * as React from 'react';
import { CUE } from './tokens';
import { Tag } from './Primitives';
import { Ico } from './Icons';
import { Phone, TabBar, iconBtn } from './Frames';

export function MobileFeed() {
  const projects = [
    {
      id: 1,
      tags: ['Backup', 'Seoul', 'Female'],
      title: 'NewJeans · Hyein Solo Stage',
      poster: 'ADOR · via Choreo. Lia Kim',
      pay: '₩ 1,800,000',
      schedule: '5/12 · 2 rehearsals + 1 shoot',
    },
    {
      id: 2,
      deadline: 'D-5',
      tags: ['World Tour', 'Hip-hop', 'Any'],
      title: 'STRAY KIDS · DOMINATE Tour',
      poster: 'JYP Entertainment',
      pay: '₩ 12,400,000',
      schedule: '6 cities · 4 months',
    },
    {
      id: 3,
      deadline: 'D-9',
      tags: ['MV', 'Jazz', 'Female'],
      title: 'Daisy McKenzie · "GLOSS" MV',
      poster: 'Independent · Choreo. Aliya Janell',
      pay: '₩ 650,000 · day rate',
      schedule: '4/30 · 1 day',
    },
    {
      id: 4,
      deadline: 'D-11',
      tags: ['Audition', 'Contemporary'],
      title: 'LDP Co. — Ensemble Audition',
      poster: 'LDP Dance Company',
      pay: 'Salaried · ₩ 32M / yr',
      schedule: 'Open call · May 4',
    },
  ];

  return (
    <Phone>
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                fontFamily: CUE.serif,
                fontSize: 32,
                lineHeight: 1,
                fontStyle: 'italic',
                letterSpacing: -0.5,
              }}
            >
              Casting<span style={{ color: CUE.accent }}>.</span>
            </div>
            <div style={{ fontSize: 12, color: CUE.ink3, marginTop: 6, letterSpacing: 0.2 }}>
              247 OPEN · 12 MATCH YOUR PROFILE
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={iconBtn}>{Ico.search(CUE.ink, 18)}</button>
            <button style={iconBtn}>{Ico.bell(CUE.ink, 18)}</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '0 20px 14px', overflowX: 'auto' }}>
        {[
          { l: 'For you', on: true },
          { l: 'Backup' },
          { l: 'MV' },
          { l: 'Tour' },
          { l: 'Audition' },
          { l: 'Lessons' },
        ].map((c, i) => (
          <div
            key={i}
            style={{
              padding: '7px 13px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 500,
              background: c.on ? CUE.accent : 'transparent',
              color: c.on ? CUE.accentInk : CUE.ink2,
              border: c.on ? 'none' : `1px solid ${CUE.hairline2}`,
              whiteSpace: 'nowrap',
            }}
          >
            {c.l}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        <div
          style={{
            background: CUE.accent,
            color: CUE.accentInk,
            borderRadius: 20,
            padding: 18,
            marginBottom: 14,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2 }}>
              ↳ FEATURED · CLOSING SOON
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 8px',
                background: CUE.accentInk,
                color: CUE.accent,
                borderRadius: 999,
              }}
            >
              D-2
            </div>
          </div>
          <div
            style={{
              fontFamily: CUE.serif,
              fontSize: 26,
              lineHeight: 1.05,
              marginTop: 14,
              fontStyle: 'italic',
            }}
          >
            Hyein <span style={{ fontStyle: 'normal' }}>solo stage</span>
            <br />
            backup × 4
          </div>
          <div style={{ fontSize: 13, marginTop: 12, opacity: 0.75, fontWeight: 500 }}>
            ADOR · Choreo. Lia Kim
          </div>
          <div
            style={{
              marginTop: 14,
              padding: '12px 0 0',
              borderTop: '1px solid rgba(14,14,12,0.18)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontFamily: CUE.mono, fontSize: 14, fontWeight: 600 }}>₩1,800,000</div>
              <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>2 rehearsals · 1 shoot</div>
            </div>
            <button
              style={{
                padding: '10px 16px',
                background: CUE.accentInk,
                color: CUE.accent,
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              Apply {Ico.arrow(CUE.accent, 14)}
            </button>
          </div>
        </div>

        {projects.slice(1).map((p) => (
          <div
            key={p.id}
            style={{
              background: CUE.surface,
              borderRadius: 18,
              padding: 16,
              marginBottom: 12,
              border: `1px solid ${CUE.hairline}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <div style={{ display: 'flex', gap: 6 }}>
                {p.tags.slice(0, 2).map((t, i) => (
                  <Tag key={i} tone={i === 0 ? 'accent' : 'default'}>
                    {t}
                  </Tag>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: CUE.ink3, fontFamily: CUE.mono }}>{p.deadline}</span>
                <button>{Ico.bookmark(CUE.ink3, 18)}</button>
              </div>
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.25, letterSpacing: -0.2 }}>
              {p.title}
            </div>
            <div style={{ fontSize: 12, color: CUE.ink3, marginTop: 4 }}>{p.poster}</div>
            <div
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: `1px dashed ${CUE.hairline}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontFamily: CUE.mono, fontSize: 13, fontWeight: 600, color: CUE.ink }}>
                  {p.pay}
                </div>
                <div style={{ fontSize: 11, color: CUE.ink3, marginTop: 2 }}>{p.schedule}</div>
              </div>
              {Ico.arrow(CUE.ink2, 16)}
            </div>
          </div>
        ))}
        <div style={{ height: 16 }} />
      </div>
      <TabBar active="feed" />
    </Phone>
  );
}
