'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAdmin } from '@/hooks/useAdmin'
import { supabase } from '@/lib/supabase'
import { getRelativeTime, getProjectStatuses } from '@/lib/utils'
import { Loader2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

const CONFIRMATION_LABELS: Record<string, { label: string; color: string }> = {
    negotiating: { label: '협상 중', color: 'bg-yellow-500/10 text-yellow-400' },
    confirmed: { label: '진행 확정', color: 'bg-green-500/10 text-green-400' },
    declined: { label: '거절됨', color: 'bg-red-500/10 text-red-400' },
    cancelled: { label: '취소됨', color: 'bg-red-500/10 text-red-400' },
    completed: { label: '완료', color: 'bg-white/5 text-white/40' },
}

const PROGRESS_LABELS: Record<string, { label: string; color: string }> = {
    idle: { label: '대기', color: 'bg-white/5 text-white/30' },
    recruiting: { label: '모집 중', color: 'bg-blue-500/10 text-blue-400' },
    in_progress: { label: '진행 중', color: 'bg-green-500/10 text-green-400' },
    completed: { label: '진행 완료', color: 'bg-white/5 text-white/40' },
    cancelled: { label: '취소됨', color: 'bg-red-500/10 text-red-400' },
}

const CATEGORY_LABELS: Record<string, string> = {
    choreo: '안무',
    broadcast: '방송',
    performance: '공연',
    workshop: '워크샵',
    judge: '심사',
}

type StatusFilter = 'all' | 'active' | 'completed' | 'cancelled'

interface ProjectRow {
    id: string
    title: string
    category: string | null
    confirmation_status: string | null
    progress_status: string | null
    status?: string
    budget: number | null
    start_date: string | null
    end_date: string | null
    created_at: string
    owner_id: string
    owner?: { name: string | null }
    clients?: { company_name: string | null; contact_person: string | null } | null
}

export default function AdminProjectsPage() {
    const { isAdmin } = useAdmin()
    const [projects, setProjects] = useState<ProjectRow[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await supabase
                .from('projects')
                .select('id, title, category, confirmation_status, progress_status, status, budget, start_date, end_date, created_at, owner_id, owner:users!owner_id(name), clients(company_name, contact_person)')
                .is('deleted_at', null)
                .order('created_at', { ascending: false })
            const normalized = (data ?? []).map((row: Record<string, unknown>) => {
                const owner = Array.isArray(row.owner) ? row.owner[0] : row.owner
                const clients = Array.isArray(row.clients) ? row.clients[0] : row.clients
                return { ...row, owner, clients } as ProjectRow
            })
            setProjects(normalized)
        } catch (err) {
            console.error('Admin projects fetch error:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (isAdmin) fetchData()
    }, [isAdmin, fetchData])

    const filtered = projects.filter((p) => {
        const { confirmation, progress } = getProjectStatuses(p)
        if (statusFilter === 'all') return true
        if (statusFilter === 'active') {
            if (confirmation === 'completed' || confirmation === 'declined' || confirmation === 'cancelled') return false
            if (progress === 'completed' || progress === 'cancelled') return false
            return true
        }
        if (statusFilter === 'completed') return confirmation === 'completed' || progress === 'completed'
        if (statusFilter === 'cancelled') return confirmation === 'cancelled' || progress === 'cancelled'
        return true
    })

    if (!isAdmin) return null

    return (
        <div className="w-full space-y-6">
            <AdminPageHeader title="프로젝트" description="전체 프로젝트 목록과 상태별 필터입니다." />
            <div className="flex flex-wrap gap-2">
                {(['all', 'active', 'completed', 'cancelled'] as const).map((key) => (
                    <button
                        key={key}
                        onClick={() => setStatusFilter(key)}
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-sm font-medium transition',
                            statusFilter === key
                                ? 'bg-primary text-black'
                                : 'bg-neutral-800 text-white/70 hover:bg-neutral-700 hover:text-white'
                        )}
                    >
                        {key === 'all' ? '전체' : key === 'active' ? '진행 중' : key === 'completed' ? '완료' : '취소'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <p className="text-center py-16 text-white/40 text-sm">프로젝트가 없습니다.</p>
            ) : (
                <div className="space-y-2">
                    {filtered.map((p) => {
                        const { confirmation, progress } = getProjectStatuses(p)
                        const confLabel = CONFIRMATION_LABELS[confirmation] ?? { label: confirmation, color: 'bg-white/5 text-white/40' }
                        const progLabel = PROGRESS_LABELS[progress] ?? { label: progress, color: 'bg-white/5 text-white/40' }
                        return (
                            <Link
                                key={p.id}
                                href={`/my/projects/${p.id}`}
                                className="flex items-center gap-3 p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">{p.title}</p>
                                    <p className="text-xs text-white/50 mt-0.5">
                                        {p.owner?.name ?? '—'} · {p.clients?.company_name ?? p.clients?.contact_person ?? '개인'}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {p.category && (
                                            <span className="text-[10px] bg-white/5 text-white/50 px-1.5 py-0.5 rounded">
                                                {CATEGORY_LABELS[p.category] ?? p.category}
                                            </span>
                                        )}
                                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded', confLabel.color)}>{confLabel.label}</span>
                                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded', progLabel.color)}>{progLabel.label}</span>
                                    </div>
                                    <p className="text-[11px] text-white/30 mt-1">
                                        {p.budget != null ? `${(p.budget / 10000).toFixed(0)}만원` : '—'} · {p.created_at ? getRelativeTime(p.created_at) : ''}
                                    </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-white/30 shrink-0" />
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
