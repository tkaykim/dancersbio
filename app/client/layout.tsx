'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Ico } from '@/components/cue'

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname() ?? ''

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
    return () => {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [])

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cue-bg)' }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: '2px solid var(--cue-hairline-2)',
            borderTopColor: 'var(--cue-accent)',
            animation: 'cue-spin 0.7s linear infinite',
          }}
        />
        <style>{`@keyframes cue-spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!user) return null

  const navItems: { href: string; label: string; icon: keyof typeof Ico; active: boolean }[] = [
    { href: '/client', label: '대시보드', icon: 'dashboard', active: pathname === '/client' },
    { href: '/client/onboarding', label: '회사 정보', icon: 'building', active: pathname.startsWith('/client/onboarding') },
  ]

  const userName = (user.user_metadata?.name as string | undefined) ?? user.email ?? '사용자'
  const initials = userName
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--cue-bg)', color: 'var(--cue-ink)' }}>
      {/* Sidebar */}
      <aside
        className="w-56 shrink-0 flex flex-col"
        style={{
          background: 'var(--cue-surface-2)',
          borderRight: '1px solid var(--cue-hairline)',
          padding: '20px 14px',
        }}
      >
        <Link href="/client" className="flex items-center gap-2.5" style={{ padding: '0 6px 24px' }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'var(--cue-ink)',
              color: 'var(--cue-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '-0.03em',
            }}
          >
            d
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>Dancers.bio</div>
            <div className="cue-eyebrow" style={{ fontSize: 9.5, marginTop: 1 }}>CLIENT</div>
          </div>
        </Link>

        <nav className="flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 8,
                marginBottom: 2,
                background: item.active ? 'var(--cue-surface)' : 'transparent',
                color: item.active ? 'var(--cue-ink)' : 'var(--cue-ink-2)',
                fontSize: 13,
                fontWeight: item.active ? 600 : 500,
                border: item.active ? '1px solid var(--cue-hairline)' : '1px solid transparent',
                textDecoration: 'none',
              }}
            >
              {Ico[item.icon]('currentColor', 16)}
              <span style={{ flex: 1 }}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="space-y-2 mt-2">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 8px',
              borderRadius: 10,
              background: 'var(--cue-surface)',
              border: '1px solid var(--cue-hairline)',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, oklch(0.78 0.12 200), oklch(0.62 0.14 240))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0E0E0C',
                fontWeight: 600,
                fontSize: 11,
              }}
            >
              {initials || '·'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userName}
              </div>
              <div style={{ fontSize: 10, color: 'var(--cue-ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user.email ?? ''}>
                {user.email}
              </div>
            </div>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--cue-ink-2)',
              textDecoration: 'none',
            }}
          >
            {Ico.ext('currentColor', 14)}
            메인 사이트
          </a>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--cue-ink-2)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {Ico.logout('currentColor', 14)}
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  )
}
