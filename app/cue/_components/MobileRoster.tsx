import * as React from 'react';
import { CUE } from './tokens';
import { Avatar } from './Primitives';
import { Ico } from './Icons';
import { Phone, iconBtn } from './Frames';

export function MobileRoster() {
  return (
    <Phone>
      <div style={{ padding: '8px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={iconBtn}>{Ico.chev(CUE.ink, 16)}</button>
          <div>
            <div style={{ fontSize: 11, color: CUE.ink3, letterSpacing: 0.4 }}>
              ROSTER · CHOREOGRAPHER VIEW
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, marginTop: 2 }}>Hyein Solo · Backup × 4</div>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              color: CUE.ink3,
              marginBottom: 6,
            }}
          >
            <span>3 / 4 confirmed</span>
            <span style={{ fontFamily: CUE.mono }}>47 applied · 12 shortlisted</span>
          </div>
          <div
            style={{
              height: 6,
              background: CUE.surface2,
              borderRadius: 999,
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            <div style={{ width: '75%', background: CUE.accent }} />
            <div style={{ width: '12%', background: CUE.warn, opacity: 0.5 }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 14, fontSize: 12, fontWeight: 500 }}>
          {[
            { l: 'Shortlist', n: 12, on: true },
            { l: 'New', n: 23 },
            { l: 'Confirmed', n: 3 },
            { l: 'Passed', n: 9 },
          ].map((t, i) => (
            <button
              key={i}
              style={{
                padding: '7px 12px',
                borderRadius: 999,
                background: t.on ? CUE.accent : 'transparent',
                color: t.on ? CUE.accentInk : CUE.ink2,
                border: t.on ? 'none' : `1px solid ${CUE.hairline2}`,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {t.l}
              <span style={{ fontFamily: CUE.mono, opacity: 0.6, fontSize: 10 }}>{t.n}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {[
          {
            n: 'Park Jiyoon',
            meta: '7y · Hip-hop · Heels',
            loc: 'Seoul',
            star: 4.9,
            asked: '₩ 500K',
            their: 'their day rate',
            match: 96,
            note: 'aespa Spicy 백업, Lia Kim 작품 다수.',
            new: true,
          },
          {
            n: 'Min Hyejin',
            meta: '5y · Hip-hop · Jazz',
            loc: 'Seoul',
            star: 4.7,
            asked: '₩ 450K',
            their: 'matches budget',
            match: 91,
            note: 'IVE 월드투어 메인. 컨디션 ★',
          },
          {
            n: 'Hwa Yeji',
            meta: '6y · Heels · Jazz Funk',
            loc: 'Seoul',
            star: 5.0,
            asked: '₩ 600K',
            their: '+₩100K over budget · counter?',
            match: 89,
            note: '제 라인업이랑 핏이 좋아요. 다만 페이 협상필요',
            warn: true,
          },
        ].map((d, i) => (
          <div
            key={i}
            style={{
              background: CUE.surface,
              borderRadius: 16,
              padding: 14,
              marginBottom: 10,
              border: `1px solid ${d.new ? CUE.accent : CUE.hairline}`,
            }}
          >
            <div style={{ display: 'flex', gap: 12 }}>
              <Avatar name={d.n} size={48} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{d.n}</div>
                  <div style={{ fontFamily: CUE.mono, fontSize: 11, color: CUE.accent, fontWeight: 700 }}>
                    {d.match}% match
                  </div>
                </div>
                <div style={{ fontSize: 11, color: CUE.ink3, marginTop: 2 }}>
                  {d.meta} · {d.loc} · ★ {d.star}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                padding: '10px 12px',
                background: CUE.bg,
                borderRadius: 10,
                fontSize: 12,
                color: CUE.ink2,
                lineHeight: 1.4,
                fontStyle: 'italic',
              }}
            >
              &ldquo;{d.note}&rdquo;
            </div>

            <div
              style={{
                marginTop: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                background: d.warn ? 'rgba(255,192,97,0.08)' : 'transparent',
                border: `1px solid ${d.warn ? 'rgba(255,192,97,0.2)' : CUE.hairline}`,
                borderRadius: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: CUE.ink3,
                    letterSpacing: 0.4,
                    textTransform: 'uppercase',
                  }}
                >
                  Asked
                </div>
                <div style={{ fontFamily: CUE.mono, fontSize: 14, fontWeight: 600, marginTop: 2 }}>
                  {d.asked}
                </div>
              </div>
              <div style={{ fontSize: 11, color: d.warn ? CUE.warn : CUE.ink3, textAlign: 'right' }}>
                {d.their}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              <button
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 10,
                  background: CUE.accent,
                  color: CUE.accentInk,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Confirm
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 10,
                  border: `1px solid ${CUE.hairline2}`,
                  color: CUE.ink,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                Counter
              </button>
              <button
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: `1px solid ${CUE.hairline2}`,
                  color: CUE.ink2,
                }}
              >
                {Ico.msg(CUE.ink2, 16)}
              </button>
              <button
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: `1px solid ${CUE.hairline2}`,
                  color: CUE.ink3,
                }}
              >
                {Ico.x(CUE.ink3, 16)}
              </button>
            </div>
          </div>
        ))}
        <div style={{ height: 16 }} />
      </div>
    </Phone>
  );
}
