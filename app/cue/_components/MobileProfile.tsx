import * as React from 'react';
import { CUE } from './tokens';
import { Tag } from './Primitives';
import { Ico } from './Icons';
import { Phone, iconBtn } from './Frames';

export function MobileProfile() {
  return (
    <Phone>
      <div style={{ position: 'relative', height: 360, flexShrink: 0 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse at 30% 30%, rgba(34,197,94,0.12), transparent 60%),
              repeating-linear-gradient(135deg, rgba(255,250,235,0.04) 0 12px, rgba(255,250,235,0.08) 12px 24px)
            `,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '8px 16px 0',
            display: 'flex',
            justifyContent: 'space-between',
            zIndex: 5,
          }}
        >
          <button style={iconBtn}>{Ico.chev(CUE.ink, 16)}</button>
          <button style={iconBtn}>{Ico.more(CUE.ink, 18)}</button>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '0 20px 22px',
            background: 'linear-gradient(to top, rgba(14,14,12,1) 30%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <Tag tone="accent">Available</Tag>
            <Tag tone="ghost">Verified ✓</Tag>
          </div>
          <div style={{ fontFamily: CUE.serif, fontSize: 38, lineHeight: 1, letterSpacing: -0.8 }}>
            Park Jiyoon
          </div>
          <div style={{ fontSize: 13, color: CUE.ink2, marginTop: 8, fontWeight: 500 }}>
            Hip-hop · Heels · Jazz Funk &nbsp;·&nbsp; Seoul, KR
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            margin: '0 16px',
            padding: '14px 4px',
            background: CUE.surface,
            borderRadius: 16,
            border: `1px solid ${CUE.hairline}`,
          }}
        >
          {[
            { n: '94', l: 'Projects' },
            { n: '4.9', l: 'Rating', star: true },
            { n: '7y', l: 'Experience' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                textAlign: 'center',
                padding: '4px 0',
                borderRight: i < 2 ? `1px solid ${CUE.hairline}` : 'none',
              }}
            >
              <div style={{ fontFamily: CUE.serif, fontSize: 24, fontStyle: 'italic' }}>
                {s.n}
                {s.star && <span style={{ color: CUE.accent, marginLeft: 2 }}>★</span>}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: CUE.ink3,
                  marginTop: 2,
                  letterSpacing: 0.4,
                  textTransform: 'uppercase',
                }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            padding: '24px 20px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: CUE.ink3 }}>↳ REEL</div>
          <div style={{ fontSize: 11, color: CUE.ink3, fontFamily: CUE.mono }}>3 / 8</div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '0 20px 8px', overflowX: 'auto' }}>
          {[
            { l: 'aespa · Spicy', tag: '2024' },
            { l: 'Dance Crew Battle', tag: '2024' },
            { l: 'Studio Cypher', tag: '2023' },
          ].map((r, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                width: 130,
                height: 200,
                borderRadius: 14,
                position: 'relative',
                overflow: 'hidden',
                background: `repeating-linear-gradient(${135 + i * 30}deg, rgba(255,250,235,0.08) 0 10px, rgba(255,250,235,0.14) 10px 20px)`,
                border: `1px solid ${CUE.hairline}`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%,-50%)',
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  background: 'rgba(14,14,12,0.6)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {Ico.play(CUE.ink, 14)}
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: 10,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                <div style={{ fontFamily: CUE.mono, fontSize: 9, opacity: 0.7 }}>{r.tag}</div>
                <div style={{ marginTop: 2 }}>{r.l}</div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            padding: '20px 20px 6px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.2,
            color: CUE.ink3,
          }}
        >
          ↳ ABOUT
        </div>
        <div style={{ padding: '0 20px', fontSize: 14, color: CUE.ink2, lineHeight: 1.55 }}>
          7년차 댄서. JYPe, SM, HYBE 메인 백업 다수. 헤이키한 무드와 클린한 라인을 다 잡아요. 최근엔
          컨템포러리 브릿지 작업도 시작했음.
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
          ↳ SPECS
        </div>
        <div
          style={{
            margin: '0 16px',
            background: CUE.surface,
            borderRadius: 16,
            border: `1px solid ${CUE.hairline}`,
            overflow: 'hidden',
          }}
        >
          {[
            ['Height', '167 cm'],
            ['Build', 'Slim · Athletic'],
            ['Day rate', '₩ 450,000+'],
            ['Booking lead', '3 days'],
            ['Languages', 'KR · EN · JP'],
          ].map(([k, v], i, arr) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '13px 16px',
                borderBottom: i < arr.length - 1 ? `1px solid ${CUE.hairline}` : 'none',
                fontSize: 13,
              }}
            >
              <span style={{ color: CUE.ink3 }}>{k}</span>
              <span
                style={{
                  fontWeight: 500,
                  color: CUE.ink,
                  fontFamily: i === 2 ? CUE.mono : CUE.sans,
                }}
              >
                {v}
              </span>
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
          ↳ RECENT CREDITS
        </div>
        <div style={{ padding: '0 20px 24px' }}>
          {[
            ['NewJeans · "Supernatural"', 'Backup · 2024', '★ 5.0'],
            ['IVE World Tour', 'Tour dancer · 2024', '★ 5.0'],
            ['Heize · "Falling"', 'Featured · 2023', '★ 4.8'],
          ].map(([t, r, s], i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: i < 2 ? `1px solid ${CUE.hairline}` : 'none',
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{t}</div>
                <div style={{ fontSize: 11, color: CUE.ink3, marginTop: 2 }}>{r}</div>
              </div>
              <div style={{ fontFamily: CUE.mono, fontSize: 11, color: CUE.ink2 }}>{s}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 80 }} />
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
          }}
        >
          Send offer
        </button>
        <button
          style={{
            padding: '14px 18px',
            borderRadius: 999,
            background: CUE.surface,
            border: `1px solid ${CUE.hairline2}`,
            color: CUE.ink,
          }}
        >
          {Ico.msg(CUE.ink, 18)}
        </button>
        <button
          style={{
            padding: '14px 16px',
            borderRadius: 999,
            background: CUE.surface,
            border: `1px solid ${CUE.hairline2}`,
            color: CUE.ink,
          }}
        >
          {Ico.bookmark(CUE.ink, 18)}
        </button>
      </div>
    </Phone>
  );
}
