'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, User, CheckCircle2, Plus, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import MobileContainer from '@/components/layout/MobileContainer'

interface DancerSearchResult {
    id: string
    stage_name: string
    korean_name: string | null
    profile_img: string | null
    bio: string | null
    specialties: string[] | null
    genres: string[] | null
    location: string | null
    is_verified: boolean
    similarity_score: number
    slug: string | null
}

interface TeamSearchResult {
    id: string
    name: string
    slug: string | null
    profile_img: string | null
    is_verified: boolean
    member_count: number
}

export default function CrewPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState<DancerSearchResult[]>([])
    const [teamResults, setTeamResults] = useState<TeamSearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [recDancers, setRecDancers] = useState<DancerSearchResult[]>([])
    const [recTeams, setRecTeams] = useState<TeamSearchResult[]>([])
    const [recLoading, setRecLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        const loadRecommendations = async () => {
            try {
                const [dancersRes, teamsRes] = await Promise.all([
                    supabase
                        .from('dancers')
                        .select('id, stage_name, korean_name, profile_img, bio, specialties, genres, location, is_verified, slug')
                        .eq('is_verified', true)
                        .order('created_at', { ascending: false })
                        .limit(12),
                    supabase
                        .from('teams')
                        .select('id, name, slug, profile_img, is_verified, team_members(id)')
                        .eq('is_verified', true)
                        .order('created_at', { ascending: false })
                        .limit(6),
                ])
                if (cancelled) return
                if (dancersRes.data) {
                    setRecDancers(
                        dancersRes.data.map((d: any) => ({ ...d, similarity_score: 1 })),
                    )
                }
                if (teamsRes.data) {
                    setRecTeams(
                        teamsRes.data.map((t: any) => ({
                            ...t,
                            member_count: t.team_members?.length || 0,
                        })),
                    )
                }
            } catch (err) {
                console.error('Recommendation load error:', err)
            } finally {
                if (!cancelled) setRecLoading(false)
            }
        }
        loadRecommendations()
        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        if (searchQuery.length >= 2) {
            const debounce = setTimeout(() => {
                performSearch()
            }, 300)
            return () => clearTimeout(debounce)
        } else {
            setResults([])
            setTeamResults([])
            setSearched(false)
        }
    }, [searchQuery])

    const performSearch = async () => {
        setLoading(true)
        setSearched(true)

        try {
            const { data, error } = await supabase.rpc('search_dancers_fuzzy', {
                search_query: searchQuery,
                similarity_threshold: 0.2
            })

            if (error) throw error
            const verified = (data || []).filter((d: any) => d.is_verified !== false)
            setResults(verified)

            const { data: teams } = await supabase
                .from('teams')
                .select('id, name, slug, profile_img, is_verified, team_members(id)')
                .eq('is_verified', true)
                .ilike('name', `%${searchQuery}%`)
                .order('name', { ascending: true })
                .limit(20)

            if (teams) {
                setTeamResults(teams.map((t: any) => ({
                    ...t,
                    member_count: t.team_members?.length || 0,
                })))
            }
        } catch (err) {
            console.error('Search error:', err)
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    return (
        <MobileContainer>
            <div className="min-h-screen pb-24" style={{ background: 'var(--cue-bg)', color: 'var(--cue-ink)' }}>
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
                            크루
                        </h1>
                        <p style={{ fontSize: 13, color: 'var(--cue-ink-3)', marginTop: 2 }}>
                            활동명으로 댄서·팀을 찾거나 새 프로필을 만드세요
                        </p>
                    </div>
                </div>

                {/* Search Input */}
                <div className="px-4 pt-4">
                    <div className="relative">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                            style={{ color: 'var(--cue-ink-3)' }}
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="예: J-Ho, 제이호, Lia Kim..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl text-base focus:outline-none"
                            style={{
                                background: 'var(--cue-surface)',
                                border: '1px solid var(--cue-hairline)',
                                color: 'var(--cue-ink)',
                            }}
                        />
                    </div>

                    {searchQuery.length > 0 && searchQuery.length < 2 && (
                        <p style={{ fontSize: 12, color: 'var(--cue-ink-3)', marginTop: 12 }}>
                            최소 2글자 이상 입력하세요
                        </p>
                    )}
                </div>

                {/* Results */}
                <div className="px-4 pt-5 pb-10">
                    {loading ? (
                        <div className="text-center py-12" style={{ color: 'var(--cue-ink-3)', fontSize: 13 }}>
                            검색 중...
                        </div>
                    ) : searched && results.length === 0 && teamResults.length === 0 ? (
                        <div className="text-center py-16">
                            <User className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--cue-ink-4)' }} />
                            <h3
                                style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    letterSpacing: '-0.02em',
                                    color: 'var(--cue-ink)',
                                    marginBottom: 8,
                                }}
                            >
                                &quot;{searchQuery}&quot; 검색 결과가 없습니다
                            </h3>
                            <p style={{ fontSize: 13, color: 'var(--cue-ink-3)', marginBottom: 24 }}>
                                새로운 프로필을 만들어보세요
                            </p>
                            <button
                                onClick={() => router.push('/onboarding/create')}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-opacity hover:opacity-90"
                                style={{
                                    background: 'var(--cue-accent)',
                                    color: 'var(--cue-accent-ink)',
                                    fontSize: 13,
                                    letterSpacing: 0.4,
                                }}
                            >
                                <Plus className="w-4 h-4" />
                                프로필 만들기
                            </button>
                        </div>
                    ) : !searched ? (
                        <RecommendationsBlock
                            loading={recLoading}
                            dancers={recDancers}
                            teams={recTeams}
                        />
                    ) : (
                        <div className="space-y-7">
                            {teamResults.length > 0 && (
                                <Section title="팀" count={teamResults.length}>
                                    <TeamGrid teams={teamResults} />
                                </Section>
                            )}

                            {results.length > 0 && (
                                <Section title="댄서" count={results.length}>
                                    <DancerGrid dancers={results} />
                                </Section>
                            )}
                        </div>
                    )}

                    {searched && (results.length > 0 || teamResults.length > 0) && (
                        <div
                            className="mt-8 p-4 rounded-2xl"
                            style={{
                                background: 'var(--cue-surface)',
                                border: '1px solid var(--cue-hairline)',
                            }}
                        >
                            <p style={{ fontSize: 12, color: 'var(--cue-ink-3)', marginBottom: 12 }}>
                                찾으시는 프로필이 없나요?
                            </p>
                            <button
                                onClick={() => router.push('/onboarding/create')}
                                className="w-full py-3 rounded-full font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                                style={{
                                    background: 'var(--cue-accent)',
                                    color: 'var(--cue-accent-ink)',
                                    fontSize: 13,
                                    letterSpacing: 0.4,
                                }}
                            >
                                <Plus className="w-4 h-4" />
                                새 프로필 만들기
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </MobileContainer>
    )
}

function Section({
    title,
    count,
    children,
}: {
    title: string
    count?: number
    children: React.ReactNode
}) {
    return (
        <section>
            <div
                className="px-2 mb-3 flex items-baseline gap-2"
            >
                <h2
                    style={{
                        fontSize: 16,
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        color: 'var(--cue-ink)',
                    }}
                >
                    {title}
                </h2>
                {typeof count === 'number' && (
                    <span
                        style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: 'var(--cue-ink-3)',
                            fontVariantNumeric: 'tabular-nums',
                        }}
                    >
                        {count}
                    </span>
                )}
            </div>
            {children}
        </section>
    )
}

function DancerGrid({ dancers }: { dancers: DancerSearchResult[] }) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {dancers.map((dancer) => (
                <DancerCard key={dancer.id} dancer={dancer} />
            ))}
        </div>
    )
}

function DancerCard({ dancer }: { dancer: DancerSearchResult }) {
    return (
        <Link
            href={`/profile/${dancer.slug || dancer.id}`}
            className="block relative rounded-2xl overflow-hidden"
            style={{
                aspectRatio: '3 / 4',
                background: 'var(--cue-surface-2)',
                border: '1px solid var(--cue-hairline)',
            }}
        >
            {dancer.profile_img ? (
                <img
                    src={dancer.profile_img}
                    alt={dancer.stage_name}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <User className="w-10 h-10" style={{ color: 'var(--cue-ink-4)' }} />
                </div>
            )}

            {/* Bottom gradient + name */}
            <div
                className="absolute inset-x-0 bottom-0 px-3 pt-8 pb-3"
                style={{
                    background:
                        'linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0.35) 60%, transparent)',
                }}
            >
                <div className="flex items-center gap-1">
                    <span
                        className="truncate"
                        style={{
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                        }}
                    >
                        {dancer.stage_name}
                    </span>
                    {dancer.is_verified && (
                        <CheckCircle2
                            className="w-3.5 h-3.5 flex-shrink-0"
                            style={{ color: 'var(--cue-accent)' }}
                        />
                    )}
                </div>
                {dancer.korean_name && (
                    <div
                        className="truncate"
                        style={{
                            color: 'rgba(255,255,255,0.65)',
                            fontSize: 11,
                            fontWeight: 500,
                            marginTop: 1,
                        }}
                    >
                        {dancer.korean_name}
                    </div>
                )}
            </div>
        </Link>
    )
}

function TeamGrid({ teams }: { teams: TeamSearchResult[] }) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
            ))}
        </div>
    )
}

function TeamCard({ team }: { team: TeamSearchResult }) {
    return (
        <Link
            href={`/team/${team.slug || team.id}`}
            className="block relative rounded-2xl overflow-hidden"
            style={{
                aspectRatio: '3 / 4',
                background: 'var(--cue-surface-2)',
                border: '1px solid var(--cue-hairline)',
            }}
        >
            {team.profile_img ? (
                <Image
                    src={team.profile_img}
                    alt={team.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 480px) 50vw, 240px"
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Users className="w-10 h-10" style={{ color: 'var(--cue-ink-4)' }} />
                </div>
            )}

            <div
                className="absolute inset-x-0 bottom-0 px-3 pt-8 pb-3"
                style={{
                    background:
                        'linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0.35) 60%, transparent)',
                }}
            >
                <div className="flex items-center gap-1">
                    <span
                        className="truncate"
                        style={{
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                        }}
                    >
                        {team.name}
                    </span>
                    {team.is_verified && (
                        <CheckCircle2
                            className="w-3.5 h-3.5 flex-shrink-0"
                            style={{ color: 'var(--cue-accent)' }}
                        />
                    )}
                </div>
                <div
                    style={{
                        color: 'rgba(255,255,255,0.65)',
                        fontSize: 11,
                        fontWeight: 500,
                        marginTop: 1,
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    멤버 {team.member_count}명
                </div>
            </div>
        </Link>
    )
}

function RecommendationsBlock({
    loading,
    dancers,
    teams,
}: {
    loading: boolean
    dancers: DancerSearchResult[]
    teams: TeamSearchResult[]
}) {
    if (loading) {
        return (
            <div className="text-center py-12" style={{ color: 'var(--cue-ink-3)', fontSize: 13 }}>
                추천 프로필 불러오는 중...
            </div>
        )
    }
    if (dancers.length === 0 && teams.length === 0) {
        return (
            <div
                className="rounded-2xl p-6 text-center"
                style={{
                    background: 'var(--cue-surface)',
                    border: '1px dashed var(--cue-hairline)',
                }}
            >
                <p style={{ fontSize: 13, color: 'var(--cue-ink-3)', lineHeight: 1.6 }}>
                    검증된 프로필이 아직 없어요.
                    <br />
                    위에서 활동명으로 검색해보세요.
                </p>
            </div>
        )
    }
    return (
        <div className="space-y-7">
            {teams.length > 0 && (
                <Section title="팀">
                    <TeamGrid teams={teams} />
                </Section>
            )}

            {dancers.length > 0 && (
                <Section title="댄서">
                    <DancerGrid dancers={dancers} />
                </Section>
            )}
        </div>
    )
}
