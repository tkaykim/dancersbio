'use client'

import { useMemo, useState, useEffect } from 'react'
import { Plus, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ClientFilterBar from './ClientFilterBar'
import ClientProposalTable, { type ProposalRow } from './ClientProposalTable'
import DrawerAddSubProject from '@/components/projects/DrawerAddSubProject'
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
  refetch,
}: ClientProjectDetailProps) {
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [dancerNameFilter, setDancerNameFilter] = useState('')
  const [showSubProjectDrawer, setShowSubProjectDrawer] = useState(false)
  const [childProjects, setChildProjects] = useState<Array<{
    id: string; title: string; budget?: number | null;
    confirmation_status?: string; progress_status?: string;
    proposals?: Array<{ id: string; dancer_id: string; fee?: number | null; status: string; dancers?: { stage_name: string } }>
  }>>([])

  useEffect(() => {
    if (!project?.id) return
    supabase
      .from('projects')
      .select(`
        id, title, confirmation_status, progress_status, budget,
        proposals (id, dancer_id, fee, status, dancers (id, stage_name))
      `)
      .eq('parent_project_id', project.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .then(({ data }) => setChildProjects((data as any) || []))
  }, [project?.id])

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
      choreo: '안무제작/댄서참여',
      broadcast: '방송 출연',
      performance: '공연',
      workshop: '워크샵',
      judge: '심사',
      other: '기타',
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

      {/* 서브 프로젝트 섹션 */}
      <div className="border border-neutral-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/50">서브 프로젝트</h3>
          <button
            type="button"
            onClick={() => setShowSubProjectDrawer(true)}
            className="text-xs text-primary/70 hover:text-primary flex items-center gap-0.5"
          >
            <Plus className="w-3.5 h-3.5" /> 추가
          </button>
        </div>
        {childProjects.length === 0 ? (
          <p className="text-xs text-white/25 text-center py-3">
            서브 프로젝트가 없습니다. 시안 제작, 디렉팅, 출연 등을 추가할 수 있습니다.
          </p>
        ) : (
          <ul className="space-y-2">
            {childProjects.map((child) => {
              const prop = child.proposals?.[0]
              const statusLabel = !prop ? '미배정' : prop.status === 'accepted' ? '수락' : prop.status === 'declined' ? '거절' : prop.status === 'cancelled' ? '취소됨' : prop.status === 'negotiating' ? '협상중' : '대기'
              const statusColor = prop?.status === 'accepted' ? 'text-green-500' : prop?.status === 'declined' || prop?.status === 'cancelled' ? 'text-red-400' : prop?.status === 'negotiating' ? 'text-blue-400' : !prop ? 'text-white/30' : 'text-yellow-400'
              const feeDisplay = prop?.fee ? `${prop.fee.toLocaleString()}원` : child.budget ? `${child.budget.toLocaleString()}원` : null
              return (
                <li key={child.id}>
                  <Link
                    href={`/my/projects/${child.id}`}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/50 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-white block truncate">{child.title}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {prop?.dancers?.stage_name && (
                          <span className="text-[11px] text-white/50">{prop.dancers.stage_name}</span>
                        )}
                        <span className={`text-[11px] font-medium ${statusColor}`}>{statusLabel}</span>
                        {feeDisplay && <span className="text-[11px] text-primary/60">{feeDisplay}</span>}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30 shrink-0 ml-2" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <DrawerAddSubProject
        isOpen={showSubProjectDrawer}
        onClose={() => setShowSubProjectDrawer(false)}
        parentProject={{
          id: project.id,
          owner_id: project.owner_id,
          client_profile_id: project.client_profile_id,
          category: project.category,
          title: project.title,
        }}
        onSuccess={() => {
          setShowSubProjectDrawer(false)
          supabase
            .from('projects')
            .select(`
              id, title, confirmation_status, progress_status, budget,
              proposals (id, dancer_id, fee, status, dancers (id, stage_name))
            `)
            .eq('parent_project_id', project.id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .then(({ data }) => setChildProjects((data as any) || []))
          refetch?.()
        }}
      />
    </div>
  )
}
