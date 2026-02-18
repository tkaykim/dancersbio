'use client'

import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import ClientFilterBar from './ClientFilterBar'
import ClientProposalTable, { type ProposalRow } from './ClientProposalTable'
import type { ClientProject } from '@/hooks/useClientProjects'

interface ClientProjectDetailProps {
  project: ClientProject
  onAddProposal: () => void
  onCancelProposal: (proposalId: string) => void
  onSelectProposal?: (proposal: ProposalRow) => void
  refetch?: () => void
}

export default function ClientProjectDetail({
  project,
  onAddProposal,
  onCancelProposal,
  onSelectProposal,
}: ClientProjectDetailProps) {
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [dancerNameFilter, setDancerNameFilter] = useState('')

  const proposals = (project.proposals || []) as ProposalRow[]
  const filteredProposals = useMemo(() => {
    let list = proposals
    if (statusFilter) {
      list = list.filter((p) => p.status === statusFilter)
    }
    if (roleFilter.trim()) {
      const q = roleFilter.toLowerCase()
      list = list.filter((p) => (p.role ?? '').toLowerCase().includes(q))
    }
    if (dancerNameFilter.trim()) {
      const q = dancerNameFilter.toLowerCase()
      list = list.filter((p) =>
        (p.dancers?.stage_name ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [proposals, statusFilter, roleFilter, dancerNameFilter])

  const categoryLabel =
    {
      choreo: '안무 제작',
      broadcast: '방송 출연',
      performance: '공연',
      workshop: '워크샵',
      judge: '심사',
    }[project.category ?? ''] ?? project.category ?? '—'

  return (
    <div className="space-y-4 flex-1 min-w-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">{project.title}</h1>
          <p className="text-sm text-white/50 mt-0.5">
            {categoryLabel} · 제안 {proposals.length}건
          </p>
          {(project.event_dates?.length
            ? (
                <p className="text-xs text-white/40 mt-1">
                  {project.event_dates
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((ed) => `${ed.event_date}${ed.event_time ? ` ${ed.event_time.slice(0, 5)}` : ''}${ed.label ? ` (${ed.label})` : ''}`)
                    .join(' · ')}
                </p>
              )
            : project.start_date && (
                <p className="text-xs text-white/40 mt-1">
                  {project.start_date}
                  {project.end_date && ` ~ ${project.end_date}`}
                </p>
              )
          )}
        </div>
        <button
          type="button"
          onClick={onAddProposal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-black font-medium text-sm hover:bg-primary/90 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          제안 추가
        </button>
      </div>

      <ClientFilterBar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        dancerNameFilter={dancerNameFilter}
        onDancerNameFilterChange={setDancerNameFilter}
      />

      <ClientProposalTable
        proposals={filteredProposals}
        onCancel={onCancelProposal}
        onSelectProposal={onSelectProposal}
      />
    </div>
  )
}
