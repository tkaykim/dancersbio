'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAdmin } from '@/hooks/useAdmin'
import { supabase } from '@/lib/supabase'
import { getProjectStatuses, cn } from '@/lib/utils'
import {
    Users,
    UserCheck,
    Briefcase,
    Send,
    ClipboardList,
    ChevronRight,
    Loader2,
    Bell,
} from 'lucide-react'

interface DashboardStats {
    usersCount: number
    dancersVerified: number
    dancersPending: number
    projectsActive: number
    proposalsPending: number
    proposalsAccepted: number
    proposalsDeclined: number
    proposalsNegotiating: number
    proposalsCancelled: number
    requestsPending: number
    pushTokensCount: number
    pushMemberCount: number
}

export default function AdminDashboardPage() {
    const { isAdmin } = useAdmin()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isAdmin) return
        loadStats()
    }, [isAdmin])

    async function loadStats() {
        setLoading(true)
        try {
            const [usersRes, dancersRes, projectsRes, proposalsRes, requestsRes, pushRes] = await Promise.all([
                supabase.from('users').select('id', { count: 'exact', head: true }),
                supabase.from('dancers').select('id, is_verified', { count: 'exact' }),
                supabase.from('projects').select('id, confirmation_status, progress_status, status').is('deleted_at', null),
                supabase.from('proposals').select('id, status'),
                supabase.from('profile_requests').select('id').eq('status', 'pending'),
                supabase.from('push_tokens').select('id, user_id'),
            ])

            const usersCount = usersRes.count ?? 0
            const dancers = (dancersRes.data ?? []) as { id: string; is_verified: boolean }[]
            const dancersVerified = dancers.filter((d) => d.is_verified).length
            const dancersPending = dancers.filter((d) => !d.is_verified).length
            const projects = (projectsRes.data ?? []) as any[]
            const projectsActive = projects.filter((p) => {
                const { confirmation, progress } = getProjectStatuses(p)
                if (confirmation === 'completed' || confirmation === 'declined' || confirmation === 'cancelled') return false
                if (progress === 'completed' || progress === 'cancelled') return false
                return true
            }).length
            const proposals = (proposalsRes.data ?? []) as { status: string }[]
            const byStatus = (s: string) => proposals.filter((p) => p.status === s).length
            const requestsPending = (requestsRes.data ?? []).length
            const pushList = (pushRes.data ?? []) as { id: string; user_id: string }[]
            const pushTokensCount = pushList.length
            const pushMemberCount = new Set(pushList.map((p) => p.user_id)).size

            setStats({
                usersCount,
                dancersVerified,
                dancersPending,
                projectsActive,
                proposalsPending: byStatus('pending'),
                proposalsAccepted: byStatus('accepted'),
                proposalsDeclined: byStatus('declined'),
                proposalsNegotiating: byStatus('negotiating'),
                proposalsCancelled: byStatus('cancelled'),
                requestsPending,
                pushTokensCount,
                pushMemberCount,
            })
        } catch (err) {
            console.error('Admin dashboard stats error:', err)
        } finally {
            setLoading(false)
        }
    }

    if (!isAdmin) return null

    if (loading || !stats) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    const cards = [
        {
            title: '가입 회원',
            value: stats.usersCount,
            href: '/admin/users',
            icon: Users,
            desc: '전체 가입자',
        },
        {
            title: '푸시 연결',
            sub: `${stats.pushMemberCount}명 · ${stats.pushTokensCount}대`,
            href: '/admin/push',
            icon: Bell,
            desc: '앱 알림 등록 현황',
        },
        {
            title: '댄서 프로필 (승인)',
            value: stats.dancersVerified,
            href: '/admin/users',
            icon: UserCheck,
            desc: '공개 프로필',
        },
        {
            title: '프로필 승인 대기',
            value: stats.dancersPending,
            href: '/admin/profiles-pending',
            icon: UserCheck,
            desc: '승인 필요',
            highlight: stats.dancersPending > 0,
        },
        {
            title: '진행 중 프로젝트',
            value: stats.projectsActive,
            href: '/admin/projects',
            icon: Briefcase,
            desc: '활성 프로젝트',
        },
        {
            title: '제안 현황',
            sub: `대기 ${stats.proposalsPending} · 수락 ${stats.proposalsAccepted} · 협상 ${stats.proposalsNegotiating} · 거절 ${stats.proposalsDeclined}`,
            href: '/admin/proposals',
            icon: Send,
            desc: '제안서 상태별',
        },
        {
            title: '권한 요청 대기',
            value: stats.requestsPending,
            href: '/admin/requests',
            icon: ClipboardList,
            desc: 'claim/매니저 요청',
            highlight: stats.requestsPending > 0,
        },
    ]

    return (
        <div className="w-full space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white md:text-3xl">대시보드</h1>
                <p className="mt-1 text-sm text-white/50">서비스 현황 요약과 빠른 메뉴입니다.</p>
            </div>

            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {cards.map((card) => (
                    <Link
                        key={card.href + card.title}
                        href={card.href}
                        className={cn(
                            'group flex flex-col rounded-xl border bg-neutral-900/50 p-5 transition hover:border-neutral-600 hover:bg-neutral-900',
                            card.highlight && 'ring-1 ring-primary/40 border-primary/30'
                        )}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/5 text-primary group-hover:bg-primary/10 transition">
                                <card.icon className="h-5 w-5" />
                            </div>
                            <ChevronRight className="h-5 w-5 shrink-0 text-white/20 group-hover:text-white/50 transition" />
                        </div>
                        <div className="mt-4 flex-1 min-w-0">
                            <p className="text-sm font-medium text-white/60">{card.title}</p>
                            {card.value !== undefined && (
                                <p className="mt-1 text-2xl font-bold text-white md:text-3xl">{card.value}</p>
                            )}
                            {card.sub && <p className="mt-1 text-sm text-white/70">{card.sub}</p>}
                            {card.desc && (
                                <p className="mt-0.5 text-xs text-white/40">{card.desc}</p>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
