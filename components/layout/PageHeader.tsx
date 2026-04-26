'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PageHeaderProps {
  title: string
  /** Fallback URL when there is no history (e.g. opened in new tab). "뒤로가기" prefers router.back() first. */
  backHref?: string
  /** Optional subtitle/description */
  subtitle?: string
  /** Optional right-side content (e.g. action button) */
  rightContent?: React.ReactNode
}

function handleBack(router: ReturnType<typeof useRouter>, backHref?: string) {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
  } else if (backHref) {
    router.push(backHref)
  } else {
    router.back()
  }
}

export default function PageHeader({ title, backHref, subtitle, rightContent }: PageHeaderProps) {
  const router = useRouter()

  return (
    <div
      className="sticky top-0 z-10 pt-header-safe"
      style={{
        background: 'color-mix(in srgb, var(--cue-bg) 92%, transparent)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--cue-hairline)',
      }}
    >
      <div className="px-6 pb-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => handleBack(router, backHref)}
            className="p-1 -ml-1 flex-shrink-0 touch-manipulation"
            aria-label="뒤로 가기"
            style={{ color: 'var(--cue-ink)' }}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1
            className="flex-1 min-w-0"
            style={{
              fontFamily: 'var(--font-cue-serif), serif',
              fontStyle: 'italic',
              fontSize: 22,
              letterSpacing: -0.4,
              color: 'var(--cue-ink)',
            }}
          >
            {title}
          </h1>
          {rightContent}
        </div>
        {subtitle && (
          <p style={{ fontSize: 12, color: 'var(--cue-ink-3)', marginTop: 6, paddingLeft: 36 }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
