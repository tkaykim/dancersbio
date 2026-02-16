'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Loader2, User as UserIcon, Users, Inbox, Send, Wallet, Settings, LogOut, Briefcase } from 'lucide-react'
import { useMyProfiles } from '@/hooks/useMyProfiles'
import { useProposals } from '@/hooks/useProposals'
import { useProjects } from '@/hooks/useProjects'
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
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
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
            badgeColor: 'bg-green-500/20 text-green-400'
        },
        {
            label: '정산 관리',
            href: '/my/settlements',
            icon: Wallet,
        },
    ]

    const settingsMenuItems: MenuItem[] = [
        {
            label: '앱 설정',
            href: '/my/settings',
            icon: Settings,
        },
    ]

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-10">
                <div className="px-6 py-4">
                    <h1 className="text-2xl font-bold text-white">MY</h1>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* User Profile Card */}
                <UserProfileCard user={user} primaryDancer={primaryDancer} />

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-2.5">
                    <QuickStatCard label="활성 제안" value={activeProposals} />
                    <QuickStatCard label="프로젝트" value={activeProjectCount} accent="text-green-400" />
                    <QuickStatCard label="프로필" value={totalProfiles} accent="text-blue-400" />
                    <QuickStatCard label="정산 대기" value="0원" accent="text-yellow-400" />
                </div>

                {/* Main Menu */}
                <MenuSection items={profileMenuItems} />

                {/* Settings Menu */}
                <MenuSection items={settingsMenuItems} />

                {/* Sign Out */}
                <button
                    onClick={handleSignOut}
                    className="w-full py-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    로그아웃
                </button>

                <p className="text-center text-white/20 text-[10px]">
                    dancers.bio v2.2.0
                </p>
            </div>
        </div>
    )
}
