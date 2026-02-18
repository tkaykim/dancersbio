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

  return (
    <MobileContainer className="pb-16">
      {children}
      <BottomNav />
    </MobileContainer>
  )
}
