'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Users, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'

interface MyTeam {
    id: string
    name: string
    slug: string | null
    profile_img: string | null
    is_verified: boolean
    member_count: number
}

export default function MyTeamsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [leaderTeams, setLeaderTeams] = useState<MyTeam[]>([])
    const [memberTeams, setMemberTeams] = useState<MyTeam[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) router.push('/auth/signin')
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) fetchTeams()
    }, [user])

    const fetchTeams = async () => {
        // Teams where user is leader
        const { data: led } = await supabase
            .from('teams')
            .select('id, name, slug, profile_img, is_verified, team_members(id)')
            .eq('leader_id', user!.id)
            .order('created_at', { ascending: false })

        if (led) {
            setLeaderTeams(led.map((t: any) => ({
                ...t,
                member_count: t.team_members?.length || 0,
            })))
        }

        // Teams where user's dancers are members
        const { data: ownedDancers } = await supabase
            .from('dancers')
            .select('id')
            .eq('owner_id', user!.id)

        if (ownedDancers && ownedDancers.length > 0) {
            const dancerIds = ownedDancers.map(d => d.id)
            const { data: memberships } = await supabase
                .from('team_members')
                .select(`
                    team_id,
                    teams:team_id (id, name, slug, profile_img, is_verified, team_members(id))
                `)
                .in('dancer_id', dancerIds)
                .eq('is_active', true)

            if (memberships) {
                const leaderIds = new Set(led?.map(t => t.id) || [])
                const unique = new Map<string, MyTeam>()
                for (const m of memberships) {
                    const t = m.teams as any
                    if (t && !leaderIds.has(t.id) && !unique.has(t.id)) {
                        unique.set(t.id, {
                            ...t,
                            member_count: t.team_members?.length || 0,
                        })
                    }
                }
                setMemberTeams(Array.from(unique.values()))
            }
        }

        setLoading(false)
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    const TeamCard = ({ team, isLeader }: { team: MyTeam; isLeader: boolean }) => (
        <Link
            href={isLeader ? `/my/teams/${team.id}/edit` : `/team/${team.slug || team.id}`}
            className="flex items-center gap-4 p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl hover:bg-neutral-800/50 transition-colors"
        >
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0">
                {team.profile_img ? (
                    <Image src={team.profile_img} alt={team.name} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 font-bold text-lg">
                        {team.name.slice(0, 2)}
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white flex items-center gap-1 truncate">
                    {team.name}
                    {team.is_verified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-900/40 flex-shrink-0" />}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-white/40 flex items-center gap-1">
                        <Users className="w-3 h-3" />{team.member_count}명
                    </span>
                    {isLeader && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">
                            리더
                        </span>
                    )}
                </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
        </Link>
    )

    return (
        <div className="min-h-screen bg-background pb-24">
            <PageHeader title="내 팀" />

            <div className="px-6 pt-4 space-y-6">
                <Link
                    href="/my/teams/new"
                    className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl text-primary hover:bg-primary/10 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span className="text-sm font-semibold">새 팀 만들기</span>
                </Link>

                {leaderTeams.length > 0 && (
                    <div>
                        <h2 className="text-sm font-semibold text-white/60 mb-3">내가 리더인 팀</h2>
                        <div className="space-y-2">
                            {leaderTeams.map(t => <TeamCard key={t.id} team={t} isLeader />)}
                        </div>
                    </div>
                )}

                {memberTeams.length > 0 && (
                    <div>
                        <h2 className="text-sm font-semibold text-white/60 mb-3">소속된 팀</h2>
                        <div className="space-y-2">
                            {memberTeams.map(t => <TeamCard key={t.id} team={t} isLeader={false} />)}
                        </div>
                    </div>
                )}

                {leaderTeams.length === 0 && memberTeams.length === 0 && (
                    <div className="text-center py-16">
                        <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40 text-sm">소속된 팀이 없습니다</p>
                        <p className="text-white/30 text-xs mt-1">새 팀을 만들거나 팀 리더에게 초대를 요청하세요</p>
                    </div>
                )}
            </div>
        </div>
    )
}
