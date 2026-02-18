'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { LayoutDashboard, Building2, LogOut, ExternalLink, Loader2, User } from 'lucide-react'

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname() ?? ''

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/auth/signin?redirect=${encodeURIComponent('/client')}`)
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await signOut()
    router.replace('/auth/signin?redirect=/client')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-neutral-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-neutral-800">
          <Link href="/client" className="font-bold text-lg text-white hover:text-primary transition">
            클라이언트 포털
          </Link>
        </div>
        <nav className="p-2 flex-1">
          <Link
            href="/client"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${pathname === '/client' ? 'bg-neutral-800 text-primary' : 'text-white/80 hover:bg-neutral-800/50 hover:text-white'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            대시보드
          </Link>
          <Link
            href="/client/onboarding"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${pathname.startsWith('/client/onboarding') ? 'bg-neutral-800 text-primary' : 'text-white/80 hover:bg-neutral-800/50 hover:text-white'}`}
          >
            <Building2 className="w-4 h-4" />
            회사 정보
          </Link>
        </nav>
        <div className="p-2 border-t border-neutral-800 space-y-2">
          <div className="px-3 py-2.5 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5 flex items-center gap-1">
              <User className="w-3 h-3" />
              접속 계정
            </p>
            {user.user_metadata?.name && (
              <p className="text-sm font-medium text-white truncate">{user.user_metadata.name}</p>
            )}
            <p className="text-xs text-white/60 truncate mt-0.5" title={user.email ?? ''}>
              {user.email}
            </p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-neutral-800/50 hover:text-white transition"
          >
            <ExternalLink className="w-4 h-4" />
            메인 사이트
          </a>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-neutral-800/50 hover:text-white transition"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-neutral-800 flex items-center justify-between px-6 shrink-0">
          <div className="text-white/60 text-sm truncate">
            {user.email}
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
