'use client'

import { usePathname } from 'next/navigation'
import MobileContainer from '@/components/layout/MobileContainer'
import BottomNav from '@/components/layout/BottomNav'

export default function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''

  if (pathname.startsWith('/client')) {
    return <>{children}</>
  }

  if (pathname.startsWith('/admin')) {
    return <>{children}</>
  }

  if (pathname.startsWith('/profile') || pathname.startsWith('/team/')) {
    return <>{children}</>
  }

  if (pathname.startsWith('/auth')) {
    return <>{children}</>
  }

  if (pathname.startsWith('/cue')) {
    return <>{children}</>
  }

  return (
    <MobileContainer className="pb-nav-safe">
      {children}
      <BottomNav />
    </MobileContainer>
  )
}
