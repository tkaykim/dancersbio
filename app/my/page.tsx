'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Loader2, User as UserIcon, Users, Inbox, Send, Wallet, Settings, LogOut, Briefcase, Bell, Bookmark } from 'lucide-react'
import { useMyProfiles } from '@/hooks/useMyProfiles'
import { useProposals } from '@/hooks/useProposals'
import { useProjects } from '@/hooks/useProjects'
import { useBookmarkCount, useIsHydrated } from '@/hooks/useBookmarks'
import { getProjectStatuses } from '@/lib/utils'
import UserProfileCard from '@/components/my/UserProfileCard'
import QuickStatCard from '@/components/my/QuickStatCard'
import MenuSection from '@/components/my/MenuSection'
import type { MenuItem } from '@/components/my/MenuSection'

export default function MyPage() {
    const { user, loading: authLoading, signOut } = useAuth()
    const router = useRouter()
    const { ownedDancers, managedDancers, allProfiles, loading: profilesLoading } = useMyProfiles()
    const { proposals, getTotalUnreadCount } = useProposals(allProfiles, 'inbox', 'all')
    const { projects, loading: projectsLoading } = useProjects()
    const bookmarkCount = useBookmarkCount()
    const hydrated = useIsHydrated()

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin')
        }
    }, [user, authLoading, router])

    const handleSignOut = async () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            await signOut()
            router.push('/')
        }
    }

    if (authLoading || profilesLoading || projectsLoading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ background: 'var(--cue-bg)' }}
            >
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--cue-accent)' }} />
            </div>
        )
    }

    if (!user) return null

    const primaryDancer = ownedDancers[0] || null
    const totalProfiles = ownedDancers.length + managedDancers.length
    const activeProposals = proposals.filter(p => p.status === 'pending' || p.status === 'negotiating').length
    const totalUnread = getTotalUnreadCount()
    const activeProjectCount = projects.filter(p => {
        const { confirmation, progress } = getProjectStatuses(p)
        if (confirmation === 'completed' || confirmation === 'declined' || confirmation === 'cancelled') return false
        if (progress === 'completed' || progress === 'cancelled') return false
        return true
    }).length

    const profileMenuItems: MenuItem[] = [
        {
            label: '내 프로필 관리',
            href: '/my/profiles',
            icon: UserIcon,
            badge: totalProfiles > 0 ? `${totalProfiles}개` : undefined
        },
        {
            label: '내 팀 관리',
            href: '/my/teams',
            icon: Users,
        },
        {
            label: '받은 제안',
            href: '/my/proposals?tab=inbox',
            icon: Inbox,
            badge: totalUnread > 0 ? totalUnread : undefined,
            badgeColor: 'bg-red-500/20 text-red-400'
        },
        {
            label: '보낸 제안',
            href: '/my/proposals?tab=outbox',
            icon: Send,
        },
        {
            label: '프로젝트 관리',
            href: '/my/projects',
            icon: Briefcase,
            badge: activeProjectCount > 0 ? `${activeProjectCount}건` : undefined,
            badgeColor: 'bg-green-500/20 text-green-500'
        },
        {
            label: '정산 관리',
            href: '/my/settlements',
            icon: Wallet,
        },
        {
            label: '저장한 항목',
            href: '/my/saved',
            icon: Bookmark,
            badge: hydrated && bookmarkCount > 0 ? `${bookmarkCount}건` : undefined,
        },
    ]

    const settingsMenuItems: MenuItem[] = [
        {
            label: '앱 설정',
            href: '/my/settings',
            icon: Settings,
        },
        {
            label: '알림 설정',
            href: '/my/settings#notification',
            icon: Bell,
        },
    ]

    return (
        <div
            className="min-h-screen pb-20"
            style={{ background: 'var(--cue-bg)', color: 'var(--cue-ink)' }}
        >
            {/* Header */}
            <div
                className="sticky top-0 z-10 pt-header-safe"
                style={{
                    background: 'color-mix(in srgb, var(--cue-bg) 92%, transparent)',
                    backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)',
                    borderBottom: '1px solid var(--cue-hairline)',
                }}
            >
                <div className="px-6 pb-4 pt-2">
                    <h1
                        style={{
                            fontSize: 24,
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            color: 'var(--cue-ink)',
                        }}
                    >
                        마이페이지
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                <UserProfileCard user={user} primaryDancer={primaryDancer} />

                <div className="grid grid-cols-4 gap-2.5">
                    <QuickStatCard label="활성 제안" value={activeProposals} />
                    <QuickStatCard label="프로젝트" value={activeProjectCount} />
                    <QuickStatCard label="프로필" value={totalProfiles} accent="ink" />
                    <QuickStatCard label="정산 대기" value="0원" accent="ink-3" />
                </div>

                <MenuSection items={profileMenuItems} />
                <MenuSection items={settingsMenuItems} />

                <button
                    onClick={handleSignOut}
                    className="w-full py-4 rounded-2xl font-semibold transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                    style={{
                        background: 'color-mix(in srgb, var(--cue-bad) 12%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--cue-bad) 35%, transparent)',
                        color: 'var(--cue-bad)',
                        fontSize: 13,
                        letterSpacing: 0.4,
                    }}
                >
                    <LogOut className="w-5 h-5" />
                    로그아웃
                </button>

                <p
                    className="text-center"
                    style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: 'var(--cue-ink-4)',
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: 0.2,
                    }}
                >
                    dancers.bio v2.2.0
                </p>
            </div>
        </div>
    )
}
