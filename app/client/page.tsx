'use client'

import { Suspense, useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useClientProjects } from '@/hooks/useClientProjects'
import { useMyClients } from '@/hooks/useMyClients'
import { supabase } from '@/lib/supabase'
import {
  Loader2,
  Send,
  Building2,
  ChevronRight,
  Search,
} from 'lucide-react'
import type { ClientProject } from '@/hooks/useClientProjects'
import ClientProjectList from '@/components/client/ClientProjectList'
import ClientProjectDetail from '@/components/client/ClientProjectDetail'
import ModalNewProject from '@/components/client/ModalNewProject'
import DrawerAddProposal from '@/components/client/DrawerAddProposal'
import ProposalDetailModal from '@/components/proposals/ProposalDetailModal'
import type { Proposal } from '@/lib/types'
import type { ProposalRow } from '@/components/client/ClientProposalTable'

function ProjectCard({
  project,
  onSelect,
}: {
  project: ClientProject
  onSelect: () => void
}) {
  const proposals = project.proposals || []
  const pending = proposals.filter((p) => p.status === 'pending').length
  const accepted = proposals.filter((p) => p.status === 'accepted').length
  const declined = proposals.filter((p) => p.status === 'declined').length
  const negotiating = proposals.filter((p) => p.status === 'negotiating').length

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-800/50 transition"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white truncate">{project.title}</h3>
          <p className="text-sm text-white/50 mt-0.5">
            {project.category ?? '—'} · 제안 {proposals.length}건
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {accepted > 0 && (
              <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                수락 {accepted}
              </span>
            )}
            {pending > 0 && (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                대기 {pending}
              </span>
            )}
            {negotiating > 0 && (
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                협상 {negotiating}
              </span>
            )}
            {declined > 0 && (
              <span className="text-xs px-2 py-0.5 rounded bg-neutral-600/50 text-white/60">
                거절 {declined}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/40 shrink-0" />
      </div>
    </button>
  )
}

function ClientDashboardPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectIdFromUrl = searchParams.get('project')

  const { projects, loading, refetch } = useClientProjects()
  const { clients } = useMyClients()

  const [selectedProjectId, setSelectedProjectIdState] = useState<string | null>(
    null
  )
  const [modalNewProject, setModalNewProject] = useState(false)
  const [drawerAddProposal, setDrawerAddProposal] = useState(false)
  const [projectListSearch, setProjectListSearch] = useState('')
  const [selectedProposalForDetail, setSelectedProposalForDetail] =
    useState<Proposal | null>(null)

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
    return new Set(
      selectedProject.proposals.map((p) => p.dancer_id)
    )
  }, [selectedProject])

  const handleCancelProposal = useCallback(
    async (proposalId: string) => {
      if (!confirm('이 제안을 취소하시겠습니까?')) return
      const { error } = await supabase
        .from('proposals')
        .update({ status: 'cancelled' })
        .eq('id', proposalId)
      if (!error) refetch()
    },
    [refetch]
  )

  const handleProjectCreated = useCallback(
    (newProjectId: string) => {
      refetch()
      setSelectedProjectId(newProjectId)
    },
    [refetch]
  )

  const handleSelectProposal = useCallback(
    async (row: ProposalRow) => {
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
    },
    []
  )

  return (
    <div className="flex gap-6 h-full min-h-0 flex-1">
      <ClientProjectList
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        onCreateProject={() => setModalNewProject(true)}
        loading={loading}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {selectedProjectId ? (
          selectedProject ? (
            <ClientProjectDetail
              project={selectedProject}
              onAddProposal={() => setDrawerAddProposal(true)}
              onCancelProposal={handleCancelProposal}
              onSelectProposal={handleSelectProposal}
              refetch={refetch}
            />
          ) : (
            <div className="text-white/60 py-8">프로젝트를 불러오는 중...</div>
          )
        ) : (
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-white">보낸 제안 현황</h1>
                <p className="text-white/60 text-sm mt-1">
                  프로젝트를 선택하거나 새 프로젝트를 만드세요.
                </p>
              </div>
              {projects.length > 0 && (
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={projectListSearch}
                    onChange={(e) => setProjectListSearch(e.target.value)}
                    placeholder="프로젝트 검색..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-sm placeholder-white/40 focus:outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>

            {clients.length === 0 && (
              <Link
                href="/client/onboarding"
                className="flex items-center gap-3 p-4 rounded-xl border border-primary/50 bg-primary/5 text-primary hover:bg-primary/10 transition"
              >
                <Building2 className="w-8 h-8 shrink-0" />
                <div className="text-left">
                  <p className="font-medium">회사 정보를 등록하세요</p>
                  <p className="text-sm text-white/70 mt-0.5">
                    제안 발송 시 회사 명의로 보낼 수 있어 더 편리합니다.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 shrink-0 ml-auto" />
              </Link>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : filteredProjectsForList.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-neutral-800 bg-neutral-900/30">
                <Send className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">
                  {projectListSearch
                    ? '검색 결과가 없습니다.'
                    : '보낸 제안이 없습니다.'}
                </p>
                <p className="text-white/40 text-sm mt-1">
                  새 프로젝트를 만들고 댄서에게 제안을 보내보세요.
                </p>
                <button
                  type="button"
                  onClick={() => setModalNewProject(true)}
                  className="inline-block mt-4 px-5 py-2 bg-primary text-black font-medium rounded-lg text-sm hover:bg-primary/90 transition"
                >
                  새 프로젝트 만들기
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProjectsForList.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={() => setSelectedProjectId(project.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ModalNewProject
        isOpen={modalNewProject}
        onClose={() => setModalNewProject(false)}
        onCreated={handleProjectCreated}
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
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <ClientDashboardPage />
    </Suspense>
  )
}
