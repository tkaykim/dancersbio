'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import { getRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

interface UserRow {
    id: string
    email: string | null
    name: string | null
    created_at: string | null
    role: string | null
    dancer_count?: number
    client_count?: number
}

export default function AdminUsersPage() {
    const { isAdmin } = useAdmin()
    const [users, setUsers] = useState<UserRow[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState<'created_at' | 'name'>('created_at')

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const { data: usersData } = await supabase
                .from('users')
                .select('id, email, name, created_at, role')
                .order(sortBy === 'created_at' ? 'created_at' : 'name', { ascending: false })

            const list = (usersData ?? []) as UserRow[]
            const ids = list.map((u) => u.id)

            const [dancersRes, clientsRes] = await Promise.all([
                supabase.from('dancers').select('owner_id').not('owner_id', 'is', null),
                supabase.from('clients').select('owner_id'),
            ])
            const dancerCountByOwner: Record<string, number> = {}
            ;(dancersRes.data ?? []).forEach((r: { owner_id: string }) => {
                dancerCountByOwner[r.owner_id] = (dancerCountByOwner[r.owner_id] ?? 0) + 1
            })
            const clientCountByOwner: Record<string, number> = {}
            ;(clientsRes.data ?? []).forEach((r: { owner_id: string }) => {
                clientCountByOwner[r.owner_id] = (clientCountByOwner[r.owner_id] ?? 0) + 1
            })

            const merged = list.map((u) => ({
                ...u,
                dancer_count: dancerCountByOwner[u.id] ?? 0,
                client_count: clientCountByOwner[u.id] ?? 0,
            }))
            setUsers(merged)
        } catch (err) {
            console.error('Admin users fetch error:', err)
        } finally {
            setLoading(false)
        }
    }, [sortBy])

    useEffect(() => {
        if (isAdmin) fetchData()
    }, [isAdmin, fetchData])

    const filtered = users.filter((u) => {
        const q = search.trim().toLowerCase()
        if (!q) return true
        return (u.email ?? '').toLowerCase().includes(q) || (u.name ?? '').toLowerCase().includes(q)
    })

    if (!isAdmin) return null

    return (
        <div className="w-full space-y-6">
            <AdminPageHeader title="회원 목록" description="가입 회원과 댄서·클라이언트 보유 현황입니다." />
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="search"
                    placeholder="이메일 또는 이름 검색..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder:text-white/40 text-sm"
                />
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'created_at' | 'name')}
                    className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-sm"
                >
                    <option value="created_at">가입일 순</option>
                    <option value="name">이름 순</option>
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.length === 0 ? (
                        <p className="text-center py-16 text-white/40 text-sm">유저가 없습니다.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-800 text-white/60 text-left">
                                        <th className="py-2 px-2 font-medium">이름</th>
                                        <th className="py-2 px-2 font-medium">이메일</th>
                                        <th className="py-2 px-2 font-medium">역할</th>
                                        <th className="py-2 px-2 font-medium">댄서</th>
                                        <th className="py-2 px-2 font-medium">클라이언트</th>
                                        <th className="py-2 px-2 font-medium">가입일</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((u) => (
                                        <tr key={u.id} className="border-b border-neutral-800/50 hover:bg-neutral-900/50">
                                            <td className="py-3 px-2 text-white font-medium">{u.name ?? '—'}</td>
                                            <td className="py-3 px-2 text-white/80 truncate max-w-[180px]">{u.email ?? '—'}</td>
                                            <td className="py-3 px-2">
                                                <span
                                                    className={cn(
                                                        'text-[10px] px-2 py-0.5 rounded-full font-medium',
                                                        u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/60'
                                                    )}
                                                >
                                                    {u.role ?? 'user'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-white/80">{u.dancer_count ?? 0}</td>
                                            <td className="py-3 px-2 text-white/80">{u.client_count ?? 0}</td>
                                            <td className="py-3 px-2 text-white/50 text-xs">{u.created_at ? getRelativeTime(u.created_at) : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
