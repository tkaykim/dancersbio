'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAdmin } from '@/hooks/useAdmin'
import { supabase } from '@/lib/supabase'
import { getRelativeTime } from '@/lib/utils'
import { Loader2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: '대기', color: 'bg-yellow-500/10 text-yellow-400' },
    accepted: { label: '수락', color: 'bg-green-500/10 text-green-400' },
    declined: { label: '거절', color: 'bg-red-500/10 text-red-400' },
    negotiating: { label: '협상 중', color: 'bg-blue-500/10 text-blue-400' },
    cancelled: { label: '취소', color: 'bg-white/5 text-white/40' },
}

interface ProposalRow {
    id: string
    project_id: string
    dancer_id: string
    sender_id: string
    role: string | null
    fee: number | null
    status: string
    details: string | null
    created_at: string
    projects?: { title: string; category: string | null }
    dancers?: { id: string; stage_name: string; profile_img: string | null }
    sender?: { name: string | null; email: string | null }
}

export default function AdminProposalsPage() {
    const { isAdmin } = useAdmin()
    const [proposals, setProposals] = useState<ProposalRow[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await supabase
                .from('proposals')
                .select(
                    'id, project_id, dancer_id, sender_id, role, fee, status, details, created_at, projects(title, category), dancers(id, stage_name, profile_img), sender:users!sender_id(name, email)'
                )
                .order('created_at', { ascending: false })
            const normalized = (data ?? []).map((row: Record<string, unknown>) => ({
                ...row,
                projects: Array.isArray(row.projects) ? row.projects[0] : row.projects,
                dancers: Array.isArray(row.dancers) ? row.dancers[0] : row.dancers,
                sender: Array.isArray(row.sender) ? row.sender[0] : row.sender,
            })) as ProposalRow[]
            setProposals(normalized)
        } catch (err) {
            console.error('Admin proposals fetch error:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (isAdmin) fetchData()
    }, [isAdmin, fetchData])

    const filtered =
        statusFilter === 'all'
            ? proposals
            : proposals.filter((p) => p.status === statusFilter)

    if (!isAdmin) return null

    return (
        <div className="w-full space-y-6">
            <AdminPageHeader title="제안" description="전체 제안 목록과 상태별 필터입니다." />
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setStatusFilter('all')}
                    className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition',
                        statusFilter === 'all' ? 'bg-primary text-black' : 'bg-neutral-800 text-white/70 hover:bg-neutral-700 hover:text-white'
                    )}
                >
                    전체
                </button>
                {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
                    <button
                        key={key}
                        onClick={() => setStatusFilter(key)}
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-sm font-medium transition',
                            statusFilter === key ? 'bg-primary text-black' : 'bg-neutral-800 text-white/70 hover:bg-neutral-700 hover:text-white'
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <p className="text-center py-16 text-white/40 text-sm">제안이 없습니다.</p>
            ) : (
                <div className="space-y-2">
                    {filtered.map((p) => {
                        const statusInfo = STATUS_LABELS[p.status] ?? { label: p.status, color: 'bg-white/5 text-white/40' }
                        return (
                            <Link
                                key={p.id}
                                href={`/my/projects/${p.project_id}`}
                                className="flex items-center gap-3 p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">{p.projects?.title ?? '—'}</p>
                                    <p className="text-xs text-white/50 mt-0.5">
                                        댄서: {p.dancers?.stage_name ?? '—'} · 발신: {p.sender?.name ?? p.sender?.email ?? '—'}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {p.role && (
                                            <span className="text-[10px] bg-white/5 text-white/50 px-1.5 py-0.5 rounded">
                                                {p.role}
                                            </span>
                                        )}
                                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded', statusInfo.color)}>
                                            {statusInfo.label}
                                        </span>
                                        {p.fee != null && (
                                            <span className="text-[10px] text-white/40">{(p.fee / 10000).toFixed(0)}만원</span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-white/30 mt-1">{getRelativeTime(p.created_at)}</p>
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
