'use client'

import { Ico } from '@/components/cue'
import { isEmbargoActive } from '@/lib/utils'
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
            const recruiting = project.progress_status === 'recruiting'
            const embargoActive = isEmbargoActive(project.embargo_date)
            const isPublic = project.visibility === 'public' && !embargoActive
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <span
                    aria-hidden
                    title={recruiting ? '모집중' : '모집 마감'}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: recruiting ? 'var(--cue-accent)' : 'var(--cue-ink-4)',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {project.title}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--cue-ink-3)',
                    marginTop: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <span>제안 {proposals.length}건</span>
                  <span style={{ color: 'var(--cue-ink-4)' }}>·</span>
                  <span
                    style={{
                      color: embargoActive
                        ? 'var(--cue-warn)'
                        : isPublic
                          ? 'var(--cue-accent)'
                          : 'var(--cue-ink-3)',
                    }}
                  >
                    {embargoActive ? '엠바고' : isPublic ? '공개' : '비공개'}
                  </span>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
