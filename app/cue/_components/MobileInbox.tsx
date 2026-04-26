'use client';

import * as React from 'react';
import { CUE } from './tokens';
import { Avatar, Tag } from './Primitives';
import { Ico } from './Icons';
import { Phone, TabBar, iconBtn } from './Frames';

type Status = 'pending' | 'negotiating' | 'shortlisted' | 'declined' | 'accepted';

type Item = {
  id: number;
  status: Status;
  from?: string;
  to?: string;
  role?: string;
  applicants?: string;
  project: string;
  pay: string;
  dates?: string;
  preview: string;
  time: string;
  new?: boolean;
  urgent?: boolean;
};

const RECEIVED: Item[] = [
  {
    id: 1,
    urgent: true,
    status: 'pending',
    new: true,
    from: 'Lia Kim',
    role: 'Choreographer · ADOR',
    project: 'NewJeans Hyein · Solo Stage backup',
    pay: '₩ 1,800,000',
    dates: 'May 12 · 2 reh + 1 shoot',
    preview: 'Hyein 솔로 무대 백업 4명 모집 중. 우선 컨택드려요!',
    time: '2m',
  },
  {
    id: 2,
    status: 'negotiating',
    from: 'JYP Casting',
    role: 'Production',
    project: 'STRAY KIDS · DOMINATE Tour',
    pay: '₩ 12,400,000 → ₩ 14,000,000?',
    dates: 'Jun-Sep · 6 cities',
    preview: '제안하신 페이 봤습니다. 회사 내부 컨펌 중이에요.',
    time: '1h',
  },
  {
    id: 3,
    status: 'pending',
    from: 'Aliya Janell',
    role: 'Choreographer',
    project: 'Daisy McKenzie · "GLOSS" MV',
    pay: '₩ 650,000',
    dates: 'Apr 30 · 1 day',
    preview: 'IG에서 봤어요. 같이 하면 너무 좋을 것 같아서요 :)',
    time: '3h',
  },
  {
    id: 4,
    status: 'declined',
    from: 'Sungho Kang',
    role: 'Director',
    project: 'CGV CF · 30sec',
    pay: '₩ 800,000',
    dates: 'Apr 28',
    preview: '아쉽지만 다음 기회에 꼭 같이 해요.',
    time: '2d',
  },
];

const SENT: Item[] = [
  {
    id: 1,
    status: 'pending',
    to: 'IVE Backup Pool',
    project: 'IVE World Tour - Asia Leg',
    pay: '₩ 8,200,000',
    applicants: '23 dancers · 2 spots',
    preview: '지원서 제출됨',
    time: '1d',
  },
  {
    id: 2,
    status: 'shortlisted',
    to: 'Lia Kim',
    project: 'aespa Karina · Solo',
    pay: '₩ 2,100,000',
    applicants: 'You + 5',
    preview: '쇼트리스트 진입 — 영상 추가 요청',
    time: '4d',
  },
];

function statusTag(s: Status) {
  switch (s) {
    case 'pending':
      return <Tag tone="warn">Pending</Tag>;
    case 'negotiating':
      return <Tag tone="info">Negotiating</Tag>;
    case 'shortlisted':
      return <Tag tone="accent">Shortlisted</Tag>;
    case 'declined':
      return <Tag tone="bad">Declined</Tag>;
    case 'accepted':
      return <Tag tone="ok">Accepted</Tag>;
  }
}

export function MobileInbox() {
  const [tab, setTab] = React.useState<'received' | 'sent'>('received');
  const list = tab === 'received' ? RECEIVED : SENT;

  return (
    <Phone>
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: CUE.serif, fontSize: 32, fontStyle: 'italic', letterSpacing: -0.5 }}>
            Inbox<span style={{ color: CUE.accent }}>.</span>
          </div>
          <button style={iconBtn}>{Ico.filter(CUE.ink, 18)}</button>
        </div>

        <div
          style={{
            marginTop: 16,
            display: 'flex',
            background: CUE.surface,
            borderRadius: 999,
            padding: 4,
            border: `1px solid ${CUE.hairline}`,
          }}
        >
          {[
            { k: 'received' as const, l: 'Received', n: 12 },
            { k: 'sent' as const, l: 'Sent', n: 4 },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 999,
                background: tab === t.k ? CUE.accent : 'transparent',
                color: tab === t.k ? CUE.accentInk : CUE.ink2,
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {t.l}
              <span style={{ fontSize: 10, fontFamily: CUE.mono, opacity: 0.65 }}>{t.n}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {list.map((it) => (
          <div
            key={it.id}
            style={{
              background: CUE.surface,
              borderRadius: 16,
              padding: 14,
              marginBottom: 10,
              border: `1px solid ${it.new ? CUE.accent : CUE.hairline}`,
              position: 'relative',
            }}
          >
            {it.new && (
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: CUE.accent,
                }}
              />
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <Avatar name={it.from || it.to || ''} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{it.from || it.to}</div>
                  <div style={{ fontSize: 10, color: CUE.ink3, fontFamily: CUE.mono }}>{it.time}</div>
                </div>
                <div style={{ fontSize: 11, color: CUE.ink3, marginTop: 1 }}>
                  {it.role || it.applicants}
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: 12,
                padding: 12,
                background: CUE.bg,
                borderRadius: 12,
                border: `1px solid ${CUE.hairline}`,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{it.project}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontFamily: CUE.mono, fontSize: 12, color: CUE.accent, fontWeight: 600 }}>
                  {it.pay}
                </span>
                <span style={{ fontSize: 11, color: CUE.ink3 }}>{it.dates}</span>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 12,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: CUE.ink2,
                  flex: 1,
                  marginRight: 12,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {it.preview}
              </div>
              {statusTag(it.status)}
            </div>
            {it.status === 'pending' && tab === 'received' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
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
                  Accept
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 10,
                    background: 'transparent',
                    border: `1px solid ${CUE.hairline2}`,
                    color: CUE.ink,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  Counter offer
                </button>
                <button
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: 'transparent',
                    border: `1px solid ${CUE.hairline2}`,
                    color: CUE.ink3,
                    fontSize: 12,
                  }}
                >
                  Pass
                </button>
              </div>
            )}
          </div>
        ))}
        <div style={{ height: 16 }} />
      </div>
      <TabBar active="inbox" />
    </Phone>
  );
}
