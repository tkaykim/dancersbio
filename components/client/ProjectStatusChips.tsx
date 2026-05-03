'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { isEmbargoActive } from '@/lib/utils'

type Size = 'sm' | 'md'

interface Props {
  projectId: string
  progressStatus?: string | null
  visibility?: string | null
  embargoDate?: string | null
  size?: Size
  onUpdated?: () => void
  /** 카드 안에서 chip 클릭이 카드 onClick으로 버블링되지 않도록 */
  stopPropagation?: boolean
}

const PADDING: Record<Size, string> = {
  sm: '3px 9px',
  md: '5px 12px',
}

const FONT_SIZE: Record<Size, number> = {
  sm: 11,
  md: 12,
}

/**
 * /client 카드/상세에서 공통으로 쓰는 두 개의 인라인 토글 칩.
 * - 모집상태(progress_status): 'recruiting' ↔ 'in_progress' (= 마감)
 * - 행사공개여부(visibility): 'public' ↔ 'private'
 *   엠바고 활성 중에는 비활성 상태로 잠금 표시.
 */
export default function ProjectStatusChips({
  projectId,
  progressStatus,
  visibility,
  embargoDate,
  size = 'sm',
  onUpdated,
  stopPropagation = false,
}: Props) {
  const [busy, setBusy] = useState<'progress' | 'visibility' | null>(null)

  const isRecruiting = progressStatus === 'recruiting'
  const isClosed =
    progressStatus === 'completed' || progressStatus === 'cancelled'
  const embargoActive = isEmbargoActive(embargoDate)
  const isPublic = visibility === 'public' && !embargoActive

  const stop = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const toggleProgress = async (e: React.MouseEvent) => {
    stop(e)
    if (busy) return
    if (isClosed) {
      // 종료/취소된 프로젝트는 다시 모집중으로 되돌리는 동작만 허용
      if (
        !confirm(
          progressStatus === 'cancelled'
            ? '취소된 프로젝트를 다시 모집중으로 되돌릴까요?'
            : '완료된 프로젝트를 다시 모집중으로 되돌릴까요?'
        )
      )
        return
    }
    setBusy('progress')
    const next = isRecruiting ? 'in_progress' : 'recruiting'
    const { error } = await supabase
      .from('projects')
      .update({ progress_status: next })
      .eq('id', projectId)
    setBusy(null)
    if (!error) onUpdated?.()
    else alert(`상태 변경 실패: ${error.message}`)
  }

  const toggleVisibility = async (e: React.MouseEvent) => {
    stop(e)
    if (busy) return
    if (embargoActive) {
      alert('엠바고 기간 중에는 공개로 전환할 수 없습니다.')
      return
    }
    setBusy('visibility')
    const next = visibility === 'public' ? 'private' : 'public'
    const { error } = await supabase
      .from('projects')
      .update({ visibility: next })
      .eq('id', projectId)
    setBusy(null)
    if (!error) onUpdated?.()
    else alert(`공개 설정 실패: ${error.message}`)
  }

  const baseChip: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: PADDING[size],
    borderRadius: 999,
    fontSize: FONT_SIZE[size],
    fontWeight: 600,
    letterSpacing: 0.1,
    cursor: busy ? 'wait' : 'pointer',
    fontFamily: 'inherit',
    transition: 'opacity 0.15s ease',
    opacity: busy ? 0.6 : 1,
    border: '1px solid transparent',
    lineHeight: 1.1,
  }

  // 모집상태 칩 색상
  const progressStyle: React.CSSProperties = isClosed
    ? {
        background: 'var(--cue-surface-2)',
        color: 'var(--cue-ink-3)',
        borderColor: 'var(--cue-hairline)',
      }
    : isRecruiting
      ? {
          background: 'var(--cue-accent-dim)',
          color: 'var(--cue-accent)',
          borderColor: 'transparent',
        }
      : {
          background: 'var(--cue-surface-2)',
          color: 'var(--cue-ink-2)',
          borderColor: 'var(--cue-hairline)',
        }

  // 공개여부 칩 색상
  const visStyle: React.CSSProperties = embargoActive
    ? {
        background: 'rgba(255, 192, 97, 0.12)',
        color: 'var(--cue-warn)',
        borderColor: 'rgba(255, 192, 97, 0.32)',
        cursor: 'not-allowed',
      }
    : isPublic
      ? {
          background: 'var(--cue-accent-dim)',
          color: 'var(--cue-accent)',
          borderColor: 'transparent',
        }
      : {
          background: 'var(--cue-surface-2)',
          color: 'var(--cue-ink-2)',
          borderColor: 'var(--cue-hairline)',
        }

  const dot = (color: string) => (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: color,
      }}
    />
  )

  const progressLabel = isClosed
    ? progressStatus === 'cancelled'
      ? '취소'
      : progressStatus === 'completed'
        ? '완료'
        : '마감'
    : isRecruiting
      ? '모집중'
      : '마감'

  const visLabel = embargoActive
    ? '엠바고'
    : isPublic
      ? '공개'
      : '비공개'

  return (
    <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
      <button
        type="button"
        onClick={toggleProgress}
        title="클릭하여 모집상태 전환"
        aria-label={`모집상태 ${progressLabel}, 클릭하여 전환`}
        style={{ ...baseChip, ...progressStyle }}
      >
        {isRecruiting
          ? dot('var(--cue-accent)')
          : isClosed
            ? dot('var(--cue-ink-4)')
            : dot('var(--cue-ink-3)')}
        {progressLabel}
      </button>

      <button
        type="button"
        onClick={toggleVisibility}
        title={
          embargoActive
            ? '엠바고 해제 후 공개 가능'
            : '클릭하여 공개여부 전환'
        }
        aria-label={`공개여부 ${visLabel}, 클릭하여 전환`}
        disabled={embargoActive}
        style={{ ...baseChip, ...visStyle }}
      >
        {embargoActive
          ? dot('var(--cue-warn)')
          : isPublic
            ? dot('var(--cue-accent)')
            : dot('var(--cue-ink-3)')}
        {visLabel}
      </button>
    </div>
  )
}
