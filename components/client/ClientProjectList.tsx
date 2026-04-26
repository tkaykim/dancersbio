'use client'

import { Ico } from '@/components/cue'
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
    <div
      style={{
        width: 256,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--cue-hairline)',
        paddingRight: 16,
      }}
    >
      <button
        type="button"
        onClick={onCreateProject}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '10px 12px',
          borderRadius: 10,
          background: 'var(--cue-accent-dim)',
          border: '1px solid var(--cue-accent)',
          color: 'var(--cue-ink)',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
          fontFamily: 'inherit',
          marginBottom: 12,
        }}
      >
        {Ico.plus('currentColor', 14)} 새 프로젝트
      </button>
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {loading ? (
          <div style={{ color: 'var(--cue-ink-3)', fontSize: 12, padding: '16px 0' }}>로딩 중...</div>
        ) : projects.length === 0 ? (
          <div style={{ color: 'var(--cue-ink-3)', fontSize: 12, padding: '16px 0' }}>
            <div style={{ marginBottom: 8, opacity: 0.5 }}>{Ico.send('currentColor', 28)}</div>
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
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: isSelected ? 'var(--cue-surface)' : 'transparent',
                  color: isSelected ? 'var(--cue-ink)' : 'var(--cue-ink-2)',
                  fontWeight: isSelected ? 600 : 500,
                  border: isSelected ? '1px solid var(--cue-hairline)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 13,
                }}
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {project.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--cue-ink-3)',
                    marginTop: 2,
                    fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                  }}
                >
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
