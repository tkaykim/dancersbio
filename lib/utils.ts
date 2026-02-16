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
