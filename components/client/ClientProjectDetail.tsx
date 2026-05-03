'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Ico, CueButton, CueEyebrow, CueSerif, CueTag } from '@/components/cue'
import ClientFilterBar from './ClientFilterBar'
import ClientProposalTable, { type ProposalRow } from './ClientProposalTable'
import DrawerAddSubProject from '@/components/projects/DrawerAddSubProject'
import ProjectStatusChips from './ProjectStatusChips'
import type { ClientProject } from '@/hooks/useClientProjects'

interface ClientProjectDetailProps {
  project: ClientProject
  onAddProposal: () => void
  onCancelProposal: (proposalId: string) => void
  onSelectProposal?: (proposal: ProposalRow) => void
  onEditProject?: (projectId: string) => void
  refetch?: () => void
}

export default function ClientProjectDetail({
  project,
  onAddProposal,
  onCancelProposal,
  onSelectProposal,
  onEditProject,
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
    if (statusFilter) list = list.filter((p) => p.status === statusFilter)
    if (roleFilter.trim()) {
      const q = roleFilter.toLowerCase()
      list = list.filter((p) => (p.role ?? '').toLowerCase().includes(q))
    }
    if (dancerNameFilter.trim()) {
      const q = dancerNameFilter.toLowerCase()
      list = list.filter((p) => (p.dancers?.stage_name ?? '').toLowerCase().includes(q))
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <CueEyebrow>{categoryLabel} · 제안 {proposals.length}건</CueEyebrow>
          <div style={{ marginTop: 4 }}>
            <CueSerif size={26}>{project.title}</CueSerif>
          </div>
          <div style={{ marginTop: 8 }}>
            <ProjectStatusChips
              projectId={project.id}
              progressStatus={project.progress_status}
              visibility={project.visibility}
              embargoDate={project.embargo_date}
              size="md"
              onUpdated={refetch}
            />
          </div>
          {(project.event_dates?.length ? (
            <p
              style={{
                fontSize: 11,
                color: 'var(--cue-ink-3)',
                marginTop: 6,
                fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
              }}
            >
              {project.event_dates
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((ed) => `${ed.event_date}${ed.event_time ? ` ${ed.event_time.slice(0, 5)}` : ''}${ed.label ? ` (${ed.label})` : ''}`)
                .join(' · ')}
            </p>
          ) : (
            project.start_date && (
              <p
                style={{
                  fontSize: 11,
                  color: 'var(--cue-ink-3)',
                  marginTop: 6,
                  fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                }}
              >
                {project.start_date}
                {project.end_date && ` ~ ${project.end_date}`}
              </p>
            )
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <CueButton onClick={onAddProposal}>
            {Ico.plus('currentColor', 14)} 제안 추가
          </CueButton>
          {onEditProject && (
            <button
              type="button"
              onClick={() => onEditProject(project.id)}
              style={{
                fontSize: 11,
                color: 'var(--cue-ink-2)',
                background: 'transparent',
                border: '1px solid var(--cue-hairline)',
                borderRadius: 8,
                padding: '6px 10px',
                cursor: 'pointer',
              }}
            >
              프로젝트 수정
            </button>
          )}
        </div>
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
      <div
        style={{
          border: '1px solid var(--cue-hairline)',
          borderRadius: 14,
          padding: 16,
          background: 'var(--cue-surface)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <CueEyebrow>서브 프로젝트</CueEyebrow>
          <button
            type="button"
            onClick={() => setShowSubProjectDrawer(true)}
            style={{
              fontSize: 11,
              color: 'var(--cue-accent)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontFamily: 'inherit',
              padding: 0,
            }}
          >
            {Ico.plus('currentColor', 12)} 추가
          </button>
        </div>
        {childProjects.length === 0 ? (
          <p style={{ fontSize: 11, color: 'var(--cue-ink-3)', textAlign: 'center', padding: '12px 0' }}>
            서브 프로젝트가 없습니다. 시안 제작, 디렉팅, 출연 등을 추가할 수 있습니다.
          </p>
        ) : (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
            {childProjects.map((child) => {
              const prop = child.proposals?.[0]
              const statusLabel = !prop ? '미배정' : prop.status === 'accepted' ? '수락' : prop.status === 'declined' ? '거절' : prop.status === 'cancelled' ? '취소됨' : prop.status === 'negotiating' ? '협상중' : '대기'
              const tone =
                prop?.status === 'accepted' ? 'ok' :
                prop?.status === 'declined' || prop?.status === 'cancelled' ? 'bad' :
                prop?.status === 'negotiating' ? 'info' :
                !prop ? 'ghost' : 'warn'
              const feeDisplay = prop?.fee ? `${prop.fee.toLocaleString()}원` : child.budget ? `${child.budget.toLocaleString()}원` : null
              return (
                <li key={child.id}>
                  <Link
                    href={`/my/projects/${child.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: 'var(--cue-surface-2)',
                      border: '1px solid var(--cue-hairline)',
                      textDecoration: 'none',
                      color: 'var(--cue-ink)',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {child.title}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        {prop?.dancers?.stage_name && (
                          <span style={{ fontSize: 11, color: 'var(--cue-ink-3)' }}>{prop.dancers.stage_name}</span>
                        )}
                        <CueTag tone={tone as any}>{statusLabel}</CueTag>
                        {feeDisplay && (
                          <span
                            style={{
                              fontSize: 11,
                              color: 'var(--cue-ink-2)',
                              fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                            }}
                          >
                            {feeDisplay}
                          </span>
                        )}
                      </div>
                    </div>
                    <span style={{ color: 'var(--cue-ink-3)', flexShrink: 0, marginLeft: 8 }}>
                      {Ico.chev('currentColor', 14)}
                    </span>
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
