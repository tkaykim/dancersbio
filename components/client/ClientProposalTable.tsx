'use client'

import Image from 'next/image'
import { CueTag } from '@/components/cue'
import type { ProjectProposal } from '@/lib/types'

const STATUS_TONE: Record<string, { label: string; tone: 'warn' | 'ok' | 'bad' | 'info' | 'ghost' }> = {
  pending: { label: '대기', tone: 'warn' },
  accepted: { label: '수락', tone: 'ok' },
  declined: { label: '거절', tone: 'bad' },
  negotiating: { label: '협상중', tone: 'info' },
  cancelled: { label: '취소', tone: 'ghost' },
}

export interface ProposalRow extends ProjectProposal {
  dancers: { id: string; stage_name: string; profile_img: string | null; genres: string[] | null }
}

interface ClientProposalTableProps {
  proposals: ProposalRow[]
  onCancel?: (proposalId: string) => void
  onSelectProposal?: (proposal: ProposalRow) => void
}

export default function ClientProposalTable({ proposals, onCancel, onSelectProposal }: ClientProposalTableProps) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: '1px solid var(--cue-hairline)',
        overflow: 'hidden',
        background: 'var(--cue-surface)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--cue-hairline)',
                background: 'var(--cue-surface-2)',
                fontSize: 11,
                color: 'var(--cue-ink-3)',
                letterSpacing: 0.4,
                textTransform: 'uppercase',
                fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
              }}
            >
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500 }}>댄서</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500 }}>역할</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500 }}>제안 일정</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 500 }}>금액</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500 }}>상태</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500 }}>보낸 일시</th>
              {onCancel && <th style={{ width: 80 }} />}
            </tr>
          </thead>
          <tbody>
            {proposals.length === 0 ? (
              <tr>
                <td colSpan={onCancel ? 7 : 6} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--cue-ink-3)' }}>
                  제안 내역이 없습니다.
                </td>
              </tr>
            ) : (
              proposals.map((p, i) => {
                const statusInfo = STATUS_TONE[p.status] ?? { label: p.status, tone: 'ghost' as const }
                const canCancel = onCancel && (p.status === 'pending' || p.status === 'negotiating')
                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: i < proposals.length - 1 ? '1px solid var(--cue-hairline)' : 'none',
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        type="button"
                        onClick={() => onSelectProposal?.(p)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          textAlign: 'left',
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          color: 'inherit',
                          cursor: 'pointer',
                          padding: 0,
                          fontFamily: 'inherit',
                        }}
                      >
                        {p.dancers?.profile_img ? (
                          <Image
                            src={p.dancers.profile_img}
                            alt=""
                            width={32}
                            height={32}
                            style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: 'var(--cue-surface-3)',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <span style={{ fontWeight: 500, color: 'var(--cue-ink)' }}>
                          {p.dancers?.stage_name ?? '—'}
                        </span>
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--cue-ink-2)' }}>{p.role ?? '미정'}</td>
                    <td
                      style={{
                        padding: '14px 16px',
                        color: 'var(--cue-ink-2)',
                        fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                        fontSize: 12,
                      }}
                    >
                      {p.scheduled_date ?? '미정'}
                    </td>
                    <td
                      style={{
                        padding: '14px 16px',
                        textAlign: 'right',
                        color: 'var(--cue-ink)',
                        fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                        fontWeight: 500,
                      }}
                    >
                      {p.fee != null ? `${(p.fee / 10000).toFixed(0)}만` : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <CueTag tone={statusInfo.tone}>{statusInfo.label}</CueTag>
                    </td>
                    <td
                      style={{
                        padding: '14px 16px',
                        color: 'var(--cue-ink-3)',
                        fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                        fontSize: 11,
                      }}
                    >
                      {p.created_at
                        ? new Date(p.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                    {onCancel && (
                      <td style={{ padding: '14px 16px' }}>
                        {canCancel ? (
                          <button
                            type="button"
                            onClick={() => onCancel(p.id)}
                            style={{
                              fontSize: 12,
                              color: 'var(--cue-bad)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            취소
                          </button>
                        ) : null}
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
