'use client'

import { Plus, Send } from 'lucide-react'
import type { ClientProject } from '@/hooks/useClientProjects'

interface ClientProjectListProps {
  projects: ClientProject[]
  selectedProjectId: string | null
  onSelectProject: (id: string | null) => void
  onCreateProject: () => void
  loading: boolean
}

export default function ClientProjectList({
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  loading,
}: ClientProjectListProps) {
  return (
    <div className="w-64 shrink-0 flex flex-col border-r border-neutral-800 pr-4">
      <button
        type="button"
        onClick={onCreateProject}
        className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary font-medium text-sm hover:bg-primary/20 transition mb-3"
      >
        <Plus className="w-4 h-4" />
        새 프로젝트
      </button>
      <div className="flex-1 overflow-y-auto min-h-0 space-y-1">
        {loading ? (
          <div className="text-white/50 text-sm py-4">로딩 중...</div>
        ) : projects.length === 0 ? (
          <div className="text-white/50 text-sm py-4">
            <Send className="w-8 h-8 mb-2 opacity-50" />
            <p>프로젝트가 없습니다</p>
          </div>
        ) : (
          projects.map((project) => {
            const proposals = project.proposals || []
            const isSelected = selectedProjectId === project.id
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => onSelectProject(project.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition ${
                  isSelected
                    ? 'bg-neutral-800 text-primary font-medium'
                    : 'text-white/80 hover:bg-neutral-800/50 hover:text-white'
                }`}
              >
                <div className="truncate font-medium">{project.title}</div>
                <div className="text-xs text-white/50 mt-0.5">
                  제안 {proposals.length}건
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
