'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

/**
 * "뒤로가기" 동작: 브라우저 히스토리가 있으면 router.back(), 없으면 fallbackHref로 이동.
 * 직전 페이지로 돌아가도록 하려면 이 훅을 사용하세요.
 */
export function useBackWithFallback(fallbackHref?: string) {
  const router = useRouter()
  return useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else if (fallbackHref) {
      router.push(fallbackHref)
    } else {
      router.back()
    }
  }, [router, fallbackHref])
}
