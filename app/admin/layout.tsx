'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAdmin } from '@/hooks/useAdmin'
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Send,
    UserCheck,
    ClipboardList,
    ShieldCheck,
    Bell,
    Menu,
    X,
} from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
    { label: '대시보드', href: '/admin', icon: LayoutDashboard },
    { label: '회원 목록', href: '/admin/users', icon: Users },
    { label: '푸시 관리', href: '/admin/push', icon: Bell },
    { label: '프로젝트', href: '/admin/projects', icon: Briefcase },
    { label: '제안', href: '/admin/proposals', icon: Send },
    { label: '프로필 승인', href: '/admin/profiles-pending', icon: UserCheck },
    { label: '권한 요청', href: '/admin/requests', icon: ClipboardList },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname() ?? ''
    const { isAdmin, loading } = useAdmin()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        if (loading) return
        if (!isAdmin) {
            router.replace('/my')
        }
    }, [isAdmin, loading, router])

    useEffect(() => {
        setSidebarOpen(false)
    }, [pathname])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    if (!isAdmin) return null

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin'
        return pathname.startsWith(href)
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 md:justify-start md:gap-3">
                <ShieldCheck className="w-7 h-7 text-primary shrink-0" />
                <span className="text-lg font-bold text-white">관리자</span>
                <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white md:hidden"
                    aria-label="메뉴 닫기"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                            isActive(item.href)
                                ? 'bg-primary/15 text-primary'
                                : 'text-white/70 hover:bg-white/5 hover:text-white'
                        )}
                    >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {item.label}
                    </Link>
                ))}
            </nav>
        </div>
    )

    return (
        <div className="min-h-screen bg-background flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden
                />
            )}

            {/* Sidebar - fixed on PC, drawer on mobile */}
            <aside
                className={cn(
                    'fixed top-0 left-0 z-50 h-full w-64 bg-neutral-900/95 backdrop-blur border-r border-neutral-800 flex flex-col transition-transform duration-200 md:translate-x-0 md:static md:z-auto',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <SidebarContent />
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar - mobile menu button + optional breadcrumb on PC */}
                <header className="sticky top-0 z-30 flex items-center gap-4 px-4 py-3 bg-background/80 backdrop-blur border-b border-neutral-800 md:px-6 md:py-4">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white md:hidden"
                        aria-label="메뉴 열기"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex-1 min-w-0" />
                </header>

                <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    )
}
