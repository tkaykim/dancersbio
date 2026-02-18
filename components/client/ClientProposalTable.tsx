'use client'

import Image from 'next/image'
import type { ProjectProposal } from '@/lib/types'

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: { label: '대기', className: 'bg-amber-500/20 text-amber-400' },
  accepted: { label: '수락', className: 'bg-green-500/20 text-green-400' },
  declined: { label: '거절', className: 'bg-red-500/20 text-red-400' },
  negotiating: { label: '협상중', className: 'bg-blue-500/20 text-blue-400' },
  cancelled: { label: '취소', className: 'bg-neutral-600/50 text-white/50' },
}

export interface ProposalRow extends ProjectProposal {
  dancers: { id: string; stage_name: string; profile_img: string | null; genres: string[] | null }
}

interface ClientProposalTableProps {
  proposals: ProposalRow[]
  onCancel?: (proposalId: string) => void
  onSelectProposal?: (proposal: ProposalRow) => void
}

export default function ClientProposalTable({
  proposals,
  onCancel,
  onSelectProposal,
}: ClientProposalTableProps) {
  return (
    <div className="rounded-xl border border-neutral-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-900/50">
              <th className="text-left py-3 px-4 font-medium text-white/80">댄서</th>
              <th className="text-left py-3 px-4 font-medium text-white/80">역할</th>
              <th className="text-left py-3 px-4 font-medium text-white/80">제안 일정</th>
              <th className="text-right py-3 px-4 font-medium text-white/80">금액</th>
              <th className="text-left py-3 px-4 font-medium text-white/80">상태</th>
              <th className="text-left py-3 px-4 font-medium text-white/80">보낸 일시</th>
              {onCancel && <th className="w-20" />}
            </tr>
          </thead>
          <tbody>
            {proposals.length === 0 ? (
              <tr>
                <td colSpan={onCancel ? 7 : 6} className="py-8 text-center text-white/50">
                  제안 내역이 없습니다.
                </td>
              </tr>
            ) : (
              proposals.map((p) => {
                const statusInfo = STATUS_MAP[p.status] ?? {
                  label: p.status,
                  className: 'bg-neutral-600/50 text-white/60',
                }
                const canCancel =
                  onCancel &&
                  (p.status === 'pending' || p.status === 'negotiating')
                return (
                  <tr
                    key={p.id}
                    className="border-b border-neutral-800/50 hover:bg-neutral-800/30"
                  >
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => onSelectProposal?.(p)}
                        className="flex items-center gap-2 text-left w-full"
                      >
                        {p.dancers?.profile_img ? (
                          <Image
                            src={p.dancers.profile_img}
                            alt=""
                            width={32}
                            height={32}
                            className="rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-neutral-700 shrink-0" />
                        )}
                        <span className="font-medium text-white">
                          {p.dancers?.stage_name ?? '—'}
                        </span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-white/80">{p.role ?? '미정'}</td>
                    <td className="py-3 px-4 text-white/80">{p.scheduled_date ?? '미정'}</td>
                    <td className="py-3 px-4 text-right text-white/80">
                      {p.fee != null ? `${(p.fee / 10000).toFixed(0)}만` : '미정'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white/50">
                      {p.created_at
                        ? new Date(p.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                    {onCancel && (
                      <td className="py-3 px-4">
                        {canCancel ? (
                          <button
                            type="button"
                            onClick={() => onCancel(p.id)}
                            className="text-xs text-red-400/80 hover:text-red-400"
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
