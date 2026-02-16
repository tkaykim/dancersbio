import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 프로젝트 상태를 양쪽 스키마(마이그레이션 전/후)에서 안전하게 읽기
 * 마이그레이션 전: status 컬럼만 존재
 * 마이그레이션 후: confirmation_status + progress_status 존재
 */
export function getProjectStatuses(project: any): { confirmation: string; progress: string } {
  if (project.confirmation_status) {
    return {
      confirmation: project.confirmation_status,
      progress: project.progress_status || 'idle',
    }
  }
  // 마이그레이션 전: 기존 status에서 추론
  const s = project.status || 'recruiting'
  switch (s) {
    case 'recruiting': return { confirmation: 'negotiating', progress: 'idle' }
    case 'active': return { confirmation: 'confirmed', progress: 'recruiting' }
    case 'done':
    case 'completed': return { confirmation: 'completed', progress: 'completed' }
    case 'cancelled': return { confirmation: 'cancelled', progress: 'cancelled' }
    default: return { confirmation: 'negotiating', progress: 'idle' }
  }
}

/** 진행 불가 상태(취소/거절/완료)일 때만 삭제 가능 */
export function isProjectDeletable(project: any): boolean {
  const { confirmation } = getProjectStatuses(project)
  return confirmation === 'declined' || confirmation === 'cancelled' || confirmation === 'completed'
}

// ─────────────────────────────────────────────────
// 엠바고 / 공개여부 관련 유틸리티 (KST 기준)
// ─────────────────────────────────────────────────

/**
 * 현재 한국시각(KST, UTC+9) 날짜를 YYYY-MM-DD 형태로 반환
 */
export function getKSTDateString(): string {
  const now = new Date()
  const kst = new Date(now.getTime() + (9 * 60 * 60 * 1000))
  return kst.toISOString().split('T')[0]
}

/**
 * 한국시각(KST) 기준으로 엠바고가 아직 유효한지 확인
 * 엠바고 날짜 당일까지 비공개, 다음날 00:00 KST부터 공개
 * 
 * @param embargoDate - 엠바고 날짜 (YYYY-MM-DD), null이면 엠바고 없음
 * @returns true = 아직 엠바고 중 (비공개 유지), false = 엠바고 해제됨/없음
 */
export function isEmbargoActive(embargoDate: string | null | undefined): boolean {
  if (!embargoDate) return false
  const todayKST = getKSTDateString()
  return todayKST <= embargoDate
}

/**
 * 프로젝트가 공개 가능한 상태인지 확인 (KST 기준)
 * - visibility가 'public'이고 엠바고가 해제되었으면 공개
 * - visibility가 'private'여도 엠바고가 만료되었으면 자동 공개 대상
 */
export function isProjectPublic(visibility: string, embargoDate: string | null | undefined): boolean {
  if (isEmbargoActive(embargoDate)) return false
  if (visibility === 'public') return true
  // 엠바고가 만료된 private 프로젝트 → 자동 공개 대상
  if (embargoDate && !isEmbargoActive(embargoDate)) return true
  return false
}

/**
 * 엠바고 날짜를 KST 기준 사람이 읽기 좋은 형태로 포맷
 */
export function formatEmbargoDate(embargoDate: string): string {
  const d = new Date(embargoDate + 'T00:00:00+09:00')
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  })
}

export function getRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)
  const diffMonth = Math.floor(diffDay / 30)

  if (diffMin < 1) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHr < 24) return `${diffHr}시간 전`
  if (diffDay < 30) return `${diffDay}일 전`
  if (diffMonth < 12) return `${diffMonth}개월 전`
  return date.toLocaleDateString('ko-KR')
}
