'use client'

import { useEffect, useState } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle2, XCircle, Users, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

interface TeamRow {
    id: string
    name: string
    slug: string | null
    profile_img: string | null
    is_verified: boolean
    leader_id: string | null
    location: string | null
    created_at: string
    member_count: number
}

export default function AdminTeamsPage() {
    const { isAdmin } = useAdmin()
    const [teams, setTeams] = useState<TeamRow[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isAdmin) return
        loadTeams()
    }, [isAdmin])

    async function loadTeams() {
        setLoading(true)
        const { data, error } = await supabase
            .from('teams')
            .select('id, name, slug, profile_img, is_verified, leader_id, location, created_at, team_members(id)')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setTeams(data.map((t: any) => ({
                ...t,
                member_count: t.team_members?.length || 0,
            })))
        }
        setLoading(false)
    }

    async function toggleVerify(team: TeamRow) {
        const { error } = await supabase
            .from('teams')
            .update({ is_verified: !team.is_verified })
            .eq('id', team.id)
        if (error) { alert('변경 실패: ' + error.message); return }
        setTeams(prev => prev.map(t => t.id === team.id ? { ...t, is_verified: !t.is_verified } : t))
    }

    async function deleteTeam(team: TeamRow) {
        if (!confirm(`"${team.name}" 팀을 삭제하시겠습니까?`)) return
        const { error } = await supabase.from('teams').delete().eq('id', team.id)
        if (error) { alert('삭제 실패: ' + error.message); return }
        setTeams(prev => prev.filter(t => t.id !== team.id))
    }

    if (!isAdmin) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="w-full space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white md:text-3xl">팀 관리</h1>
                <p className="mt-1 text-sm text-white/50">팀 인증 상태를 관리하고 팀을 삭제할 수 있습니다.</p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-neutral-800 bg-neutral-900 text-white/60">
                                <th className="px-4 py-3 font-medium">팀</th>
                                <th className="px-4 py-3 font-medium">이름</th>
                                <th className="px-4 py-3 font-medium">멤버</th>
                                <th className="px-4 py-3 font-medium">지역</th>
                                <th className="px-4 py-3 font-medium">인증</th>
                                <th className="px-4 py-3 font-medium text-right">작업</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-white/40">
                                        등록된 팀이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                teams.map((t) => (
                                    <tr key={t.id} className="border-b border-neutral-800/80 transition hover:bg-neutral-800/30">
                                        <td className="px-4 py-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-800 relative">
                                                {t.profile_img ? (
                                                    <Image src={t.profile_img} alt="" fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-bold">
                                                        {t.name.slice(0, 2)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-white">{t.name}</td>
                                        <td className="px-4 py-3 text-white/60">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5" />{t.member_count}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-white/50">{t.location || '-'}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => toggleVerify(t)}
                                                className={cn(
                                                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition',
                                                    t.is_verified
                                                        ? 'bg-primary/20 text-primary hover:bg-primary/30'
                                                        : 'bg-white/10 text-white/50 hover:bg-white/20'
                                                )}
                                            >
                                                {t.is_verified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                {t.is_verified ? '인증됨' : '미인증'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/team/${t.slug || t.id}`}
                                                    className="text-xs text-white/50 hover:text-white transition"
                                                >
                                                    보기
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteTeam(t)}
                                                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
