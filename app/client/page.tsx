'use client'

import { Suspense, useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useClientProjects } from '@/hooks/useClientProjects'
import { useMyClients } from '@/hooks/useMyClients'
import { supabase } from '@/lib/supabase'
import { Ico, CueTag, CueButton, CueEyebrow, CueSerif, CueMono } from '@/components/cue'
import type { ClientProject } from '@/hooks/useClientProjects'
import ClientProjectList from '@/components/client/ClientProjectList'
import ClientProjectDetail from '@/components/client/ClientProjectDetail'
import DrawerAddProposal from '@/components/client/DrawerAddProposal'
import ProjectFormModal from '@/components/projects/ProjectFormModal'
import ProposalDetailModal from '@/components/proposals/ProposalDetailModal'
import ProjectStatusChips from '@/components/client/ProjectStatusChips'
import type { Proposal } from '@/lib/types'
import type { ProposalRow } from '@/components/client/ClientProposalTable'

function ProjectCard({
  project,
  onSelect,
  onUpdated,
}: {
  project: ClientProject
  onSelect: () => void
  onUpdated?: () => void
}) {
  const proposals = project.proposals || []
  const pending = proposals.filter((p) => p.status === 'pending').length
  const accepted = proposals.filter((p) => p.status === 'accepted').length
  const declined = proposals.filter((p) => p.status === 'declined').length
  const negotiating = proposals.filter((p) => p.status === 'negotiating').length

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: 16,
        borderRadius: 14,
        background: 'var(--cue-surface)',
        border: '1px solid var(--cue-hairline)',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, justifyContent: 'space-between' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 600, color: 'var(--cue-ink)', fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {project.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--cue-ink-3)', marginTop: 2 }}>
            {project.category ?? '—'} · 제안 {proposals.length}건
          </div>
          <div style={{ marginTop: 10 }}>
            <ProjectStatusChips
              projectId={project.id}
              progressStatus={project.progress_status}
              visibility={project.visibility}
              embargoDate={project.embargo_date}
              onUpdated={onUpdated}
              stopPropagation
            />
          </div>
          {(accepted > 0 || pending > 0 || negotiating > 0 || declined > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {accepted > 0 && <CueTag tone="ok">수락 {accepted}</CueTag>}
              {pending > 0 && <CueTag tone="warn">대기 {pending}</CueTag>}
              {negotiating > 0 && <CueTag tone="info">협상 {negotiating}</CueTag>}
              {declined > 0 && <CueTag tone="ghost">거절 {declined}</CueTag>}
            </div>
          )}
        </div>
        <div style={{ color: 'var(--cue-ink-3)', flexShrink: 0 }}>{Ico.chev('currentColor', 16)}</div>
      </div>
    </div>
  )
}

function ClientDashboardPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectIdFromUrl = searchParams.get('project')

  const { projects, loading, refetch } = useClientProjects()
  const { clients } = useMyClients()

  const [selectedProjectId, setSelectedProjectIdState] = useState<string | null>(null)
  const [drawerAddProposal, setDrawerAddProposal] = useState(false)
  const [projectFormModal, setProjectFormModal] = useState<{ open: boolean; projectId?: string }>({ open: false })
  const openNewProject = useCallback(() => setProjectFormModal({ open: true }), [])
  const openEditProject = useCallback((id: string) => setProjectFormModal({ open: true, projectId: id }), [])
  const [projectListSearch, setProjectListSearch] = useState('')
  const [selectedProposalForDetail, setSelectedProposalForDetail] = useState<Proposal | null>(null)

  const setSelectedProjectId = useCallback(
    (id: string | null) => {
      setSelectedProjectIdState(id)
      if (id) router.replace('/client?project=' + id, { scroll: false })
      else router.replace('/client', { scroll: false })
    },
    [router]
  )

  useEffect(() => {
    if (projectIdFromUrl === null || projectIdFromUrl === undefined) {
      setSelectedProjectIdState(null)
      return
    }
    if (projectIdFromUrl && projects.some((p) => p.id === projectIdFromUrl)) {
      setSelectedProjectIdState(projectIdFromUrl)
    }
  }, [projectIdFromUrl, projects])

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  )

  const filteredProjectsForList = useMemo(() => {
    if (!projectListSearch.trim()) return projects
    const q = projectListSearch.toLowerCase()
    return projects.filter((p) => p.title.toLowerCase().includes(q))
  }, [projects, projectListSearch])

  const existingDancerIdsForProject = useMemo(() => {
    if (!selectedProject?.proposals) return new Set<string>()
    return new Set(selectedProject.proposals.map((p) => p.dancer_id))
  }, [selectedProject])

  const handleCancelProposal = useCallback(
    async (proposalId: string) => {
      if (!confirm('이 제안을 취소하시겠습니까?')) return
      const { error } = await supabase.from('proposals').update({ status: 'cancelled' }).eq('id', proposalId)
      if (!error) refetch()
    },
    [refetch]
  )

  const handleProjectCreated = useCallback(
    (newProjectId: string) => {
      refetch()
      setSelectedProjectId(newProjectId)
    },
    [refetch, setSelectedProjectId]
  )

  const handleSelectProposal = useCallback(async (row: ProposalRow) => {
    const { data, error } = await supabase
      .from('proposals')
      .select(
        `
        *,
        projects (title, category, confirmation_status, progress_status, clients (company_name)),
        dancers (id, stage_name, profile_img),
        sender:users!sender_id (name)
      `
      )
      .eq('id', row.id)
      .single()
    if (error || !data) return
    setSelectedProposalForDetail(data as Proposal)
  }, [])

  // KPI rollup
  const kpi = useMemo(() => {
    const allProps = projects.flatMap((p) => p.proposals || [])
    const accepted = allProps.filter((p) => p.status === 'accepted').length
    const pending = allProps.filter((p) => p.status === 'pending').length
    const negotiating = allProps.filter((p) => p.status === 'negotiating').length
    return {
      active: projects.length,
      accepted,
      pending,
      negotiating,
    }
  }, [projects])

  return (
    <div className="flex flex-col h-full min-h-0 flex-1">
      {/* Top header */}
      <div
        style={{
          padding: '18px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--cue-hairline)',
        }}
      >
        <div>
          <CueEyebrow>DANCERS.BIO · 클라이언트 포털</CueEyebrow>
          <div style={{ marginTop: 2 }}>
            <CueSerif size={28}>
              Projects<span style={{ color: 'var(--cue-accent)' }}>.</span>
            </CueSerif>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              background: 'var(--cue-surface)',
              borderRadius: 8,
              border: '1px solid var(--cue-hairline)',
              width: 280,
            }}
          >
            {Ico.search('var(--cue-ink-3)', 14)}
            <input
              type="text"
              value={projectListSearch}
              onChange={(e) => setProjectListSearch(e.target.value)}
              placeholder="프로젝트, 댄서, 일정 검색…"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--cue-ink)',
                fontSize: 12,
                fontFamily: 'inherit',
              }}
            />
            <CueMono style={{ fontSize: 10, color: 'var(--cue-ink-3)' }}>⌘K</CueMono>
          </div>
          <CueButton variant="primary" onClick={() => openNewProject()}>
            {Ico.plus('currentColor', 14)} 새 프로젝트
          </CueButton>
        </div>
      </div>

      {/* KPI strip */}
      {!selectedProjectId && (
        <div
          style={{
            padding: '20px 28px 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
          }}
        >
          {[
            { l: 'Active', n: String(kpi.active), sub: '진행 중 프로젝트' },
            { l: 'Pending', n: String(kpi.pending), sub: '댄서 응답 대기' },
            { l: 'Negotiating', n: String(kpi.negotiating), sub: '협상 진행중' },
            { l: 'Confirmed', n: String(kpi.accepted), sub: '확정된 캐스팅' },
          ].map((k, i) => (
            <div
              key={i}
              style={{
                padding: 18,
                background: 'var(--cue-surface)',
                borderRadius: 14,
                border: '1px solid var(--cue-hairline)',
              }}
            >
              <div style={{ fontSize: 11, color: 'var(--cue-ink-3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>{k.l}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                <CueSerif size={36}>{k.n}</CueSerif>
                <span style={{ fontSize: 11, color: 'var(--cue-ink-3)' }}>{k.sub}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, padding: 28, gap: 28 }}>
        <ClientProjectList
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          onCreateProject={() => openNewProject()}
          loading={loading}
        />

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {selectedProjectId ? (
            selectedProject ? (
              <ClientProjectDetail
                project={selectedProject}
                onAddProposal={() => setDrawerAddProposal(true)}
                onCancelProposal={handleCancelProposal}
                onSelectProposal={handleSelectProposal}
                onEditProject={openEditProject}
                refetch={refetch}
              />
            ) : (
              <div style={{ color: 'var(--cue-ink-3)', padding: '32px 0' }}>프로젝트를 불러오는 중...</div>
            )
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
              {clients.length === 0 && (
                <Link
                  href="/client/onboarding"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 16,
                    borderRadius: 14,
                    border: '1px solid var(--cue-accent)',
                    background: 'var(--cue-accent-dim)',
                    color: 'var(--cue-ink)',
                    textDecoration: 'none',
                  }}
                >
                  {Ico.building('var(--cue-ink)', 22)}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>회사 정보를 등록하세요</div>
                    <div style={{ fontSize: 12, color: 'var(--cue-ink-2)', marginTop: 2 }}>
                      제안 발송 시 회사 명의로 보낼 수 있어 더 편리합니다.
                    </div>
                  </div>
                  {Ico.chev('var(--cue-ink-2)', 16)}
                </Link>
              )}

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      border: '2px solid var(--cue-hairline-2)',
                      borderTopColor: 'var(--cue-accent)',
                      animation: 'cue-spin 0.7s linear infinite',
                    }}
                  />
                  <style>{`@keyframes cue-spin { to { transform: rotate(360deg) } }`}</style>
                </div>
              ) : filteredProjectsForList.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '48px 16px',
                    borderRadius: 14,
                    border: '1px solid var(--cue-hairline)',
                    background: 'var(--cue-surface)',
                  }}
                >
                  <div style={{ display: 'inline-flex', color: 'var(--cue-ink-4)', marginBottom: 12 }}>
                    {Ico.send('currentColor', 36)}
                  </div>
                  <div style={{ color: 'var(--cue-ink-2)' }}>
                    {projectListSearch ? '검색 결과가 없습니다.' : '보낸 제안이 없습니다.'}
                  </div>
                  <div style={{ color: 'var(--cue-ink-3)', fontSize: 12, marginTop: 4 }}>
                    새 프로젝트를 만들고 댄서에게 제안을 보내보세요.
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <CueButton onClick={() => openNewProject()}>새 프로젝트 만들기</CueButton>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filteredProjectsForList.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onSelect={() => setSelectedProjectId(project.id)}
                      onUpdated={refetch}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ProjectFormModal
        isOpen={projectFormModal.open}
        projectId={projectFormModal.projectId}
        onClose={() => setProjectFormModal({ open: false })}
        onSuccess={(id) => {
          refetch()
          setSelectedProjectId(id)
        }}
      />

      {selectedProject && (
        <DrawerAddProposal
          isOpen={drawerAddProposal}
          onClose={() => setDrawerAddProposal(false)}
          projectId={selectedProject.id}
          projectTitle={selectedProject.title}
          existingDancerIds={existingDancerIdsForProject}
          onSuccess={refetch}
        />
      )}

      {selectedProposalForDetail && (
        <ProposalDetailModal
          proposal={selectedProposalForDetail}
          activeTab="outbox"
          onClose={() => setSelectedProposalForDetail(null)}
          onUpdate={(updated) => setSelectedProposalForDetail(updated)}
          onRefresh={refetch}
        />
      )}
    </div>
  )
}

export default function ClientPageWrapper() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', padding: '96px 0' }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: '2px solid var(--cue-hairline-2)',
              borderTopColor: 'var(--cue-accent)',
              animation: 'cue-spin 0.7s linear infinite',
            }}
          />
          <style>{`@keyframes cue-spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      }
    >
      <ClientDashboardPage />
    </Suspense>
  )
}
