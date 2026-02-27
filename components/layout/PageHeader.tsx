'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface PageHeaderProps {
  title: string
  /** href for back navigation. If not provided, uses router.back() */
  backHref?: string
  /** Optional subtitle/description */
  subtitle?: string
  /** Optional right-side content (e.g. action button) */
  rightContent?: React.ReactNode
}

export default function PageHeader({ title, backHref, subtitle, rightContent }: PageHeaderProps) {
  const router = useRouter()

  const backButton = (
    <button
      type="button"
      onClick={() => !backHref && router.back()}
      className="p-1 -ml-1 flex-shrink-0 touch-manipulation"
      aria-label="뒤로 가기"
    >
      <ArrowLeft className="w-6 h-6 text-white" />
    </button>
  )

  return (
    <div className="sticky top-0 bg-background border-b border-neutral-800 z-10 pt-header-safe">
      <div className="px-6 pb-4">
        <div className="flex items-center gap-4">
          {backHref ? (
            <Link href={backHref} className="-ml-1 flex-shrink-0" aria-label="뒤로 가기">
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
          ) : (
            backButton
          )}
          <h1 className="text-xl font-bold text-white flex-1 min-w-0">{title}</h1>
          {rightContent}
        </div>
        {subtitle && (
          <p className="text-white/60 text-sm mt-2 pl-9">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
