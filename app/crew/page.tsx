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
                        .limit(10),
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

    const getSimilarityTone = (score: number) => {
        if (score >= 0.7) return 'var(--cue-ok)'
        if (score >= 0.4) return 'var(--cue-warn)'
        return 'var(--cue-info)'
    }

    const getSimilarityLabel = (score: number) => {
        if (score >= 0.7) return '정확히 일치'
        if (score >= 0.4) return '유사함'
        return '부분 일치'
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
                    <div className="px-6 pb-5">
                        <div
                            style={{
                                fontSize: 11,
                                letterSpacing: 1.4,
                                textTransform: 'uppercase',
                                color: 'var(--cue-ink-3)',
                                fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                                marginBottom: 4,
                            }}
                        >
                            CREW · 댄서·팀 발견
                        </div>
                        <h1
                            style={{
                                fontFamily: 'var(--font-cue-serif), serif',
                                fontStyle: 'italic',
                                fontSize: 28,
                                lineHeight: 1.05,
                                letterSpacing: -0.6,
                                color: 'var(--cue-ink)',
                            }}
                        >
                            Find your crew<span style={{ color: 'var(--cue-accent)' }}>.</span>
                        </h1>
                        <p style={{ fontSize: 12, color: 'var(--cue-ink-3)', marginTop: 6 }}>
                            활동명으로 댄서·팀을 찾거나 새 프로필을 만드세요
                        </p>
                    </div>
                </div>

                {/* Search Input */}
                <div className="px-6 pt-6">
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
                <div className="px-6 pt-6 pb-10">
                    {loading ? (
                        <div className="text-center py-12" style={{ color: 'var(--cue-ink-3)', fontSize: 13 }}>
                            검색 중...
                        </div>
                    ) : searched && results.length === 0 && teamResults.length === 0 ? (
                        <div className="text-center py-16">
                            <User className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--cue-ink-4)' }} />
                            <h3
                                style={{
                                    fontFamily: 'var(--font-cue-serif), serif',
                                    fontStyle: 'italic',
                                    fontSize: 20,
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
                    ) : searched ? (
                        <div className="space-y-6">
                            {teamResults.length > 0 && (
                                <div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            letterSpacing: 1.4,
                                            textTransform: 'uppercase',
                                            color: 'var(--cue-ink-3)',
                                            fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                                            marginBottom: 10,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                        }}
                                    >
                                        <Users className="w-3 h-3" />
                                        TEAMS · 팀
                                    </div>
                                    <div className="space-y-2">
                                        {teamResults.map((team) => (
                                            <Link
                                                key={team.id}
                                                href={`/team/${team.slug || team.id}`}
                                                className="block rounded-xl p-4 transition-colors"
                                                style={{
                                                    background: 'var(--cue-surface)',
                                                    border: '1px solid var(--cue-hairline)',
                                                }}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className="w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden relative"
                                                        style={{
                                                            background: 'var(--cue-surface-2)',
                                                            border: '1px solid var(--cue-hairline)',
                                                        }}
                                                    >
                                                        {team.profile_img ? (
                                                            <Image src={team.profile_img} alt={team.name} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Users className="w-6 h-6" style={{ color: 'var(--cue-ink-4)' }} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3
                                                                className="truncate"
                                                                style={{ color: 'var(--cue-ink)', fontSize: 14, fontWeight: 600 }}
                                                            >
                                                                {team.name}
                                                            </h3>
                                                            {team.is_verified && (
                                                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--cue-accent)' }} />
                                                            )}
                                                            <span
                                                                style={{
                                                                    padding: '2px 6px',
                                                                    fontSize: 10,
                                                                    borderRadius: 4,
                                                                    background: 'var(--cue-surface-2)',
                                                                    color: 'var(--cue-ink-3)',
                                                                    fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                                                                    letterSpacing: 0.4,
                                                                    textTransform: 'uppercase',
                                                                }}
                                                            >
                                                                팀
                                                            </span>
                                                        </div>
                                                        <p style={{ fontSize: 11, color: 'var(--cue-ink-3)', marginTop: 4 }}>
                                                            멤버 {team.member_count}명
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {results.length > 0 && (
                                <div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            letterSpacing: 1.4,
                                            textTransform: 'uppercase',
                                            color: 'var(--cue-ink-3)',
                                            fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                                            marginBottom: 10,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                        }}
                                    >
                                        <User className="w-3 h-3" />
                                        DANCERS · 댄서
                                    </div>
                                    <div className="space-y-2">
                                        {results.map((dancer) => {
                                            const tone = getSimilarityTone(dancer.similarity_score)
                                            const label = getSimilarityLabel(dancer.similarity_score)
                                            return (
                                                <Link
                                                    key={dancer.id}
                                                    href={`/profile/${dancer.slug || dancer.id}`}
                                                    className="block rounded-xl p-4"
                                                    style={{
                                                        background: 'var(--cue-surface)',
                                                        border: '1px solid var(--cue-hairline)',
                                                    }}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div
                                                            className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                                                            style={{
                                                                background: 'var(--cue-surface-2)',
                                                                border: '1px solid var(--cue-hairline)',
                                                            }}
                                                        >
                                                            {dancer.profile_img ? (
                                                                <img
                                                                    src={dancer.profile_img}
                                                                    alt={dancer.stage_name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <User className="w-7 h-7" style={{ color: 'var(--cue-ink-4)' }} />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3
                                                                    className="truncate"
                                                                    style={{ color: 'var(--cue-ink)', fontSize: 14, fontWeight: 600 }}
                                                                >
                                                                    {dancer.stage_name}
                                                                    {dancer.korean_name && (
                                                                        <span style={{ color: 'var(--cue-ink-3)', marginLeft: 8, fontSize: 12, fontWeight: 400 }}>
                                                                            {dancer.korean_name}
                                                                        </span>
                                                                    )}
                                                                </h3>
                                                                {dancer.is_verified && (
                                                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--cue-accent)' }} />
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mb-2" style={{ fontFamily: 'var(--font-cue-mono), ui-monospace, monospace' }}>
                                                                <span style={{ fontSize: 10, color: tone, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                                                                    {label}
                                                                </span>
                                                                <span style={{ fontSize: 10, color: 'var(--cue-ink-3)' }}>
                                                                    · {Math.round(dancer.similarity_score * 100)}%
                                                                </span>
                                                            </div>
                                                            {dancer.genres && dancer.genres.length > 0 && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {dancer.genres.slice(0, 3).map((genre) => (
                                                                        <span
                                                                            key={genre}
                                                                            style={{
                                                                                padding: '2px 8px',
                                                                                background: 'var(--cue-surface-2)',
                                                                                color: 'var(--cue-ink-2)',
                                                                                fontSize: 10,
                                                                                borderRadius: 999,
                                                                                border: '1px solid var(--cue-hairline)',
                                                                            }}
                                                                        >
                                                                            {genre}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}

                    {searched && (results.length > 0 || teamResults.length > 0) && (
                        <div
                            className="mt-8 p-4 rounded-xl"
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
                className="rounded-xl p-6 text-center"
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
        <div className="space-y-6">
            <div>
                <div
                    style={{
                        fontSize: 11,
                        letterSpacing: 1.4,
                        textTransform: 'uppercase',
                        color: 'var(--cue-ink-3)',
                        fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                        marginBottom: 10,
                    }}
                >
                    ↳ FOR YOU · 추천
                </div>
                <p style={{ fontSize: 12, color: 'var(--cue-ink-3)', marginBottom: 16, lineHeight: 1.55 }}>
                    검증된 댄서·팀을 먼저 살펴보세요. 활동명을 입력하면 정확한 검색이 가능합니다.
                </p>
            </div>

            {teams.length > 0 && (
                <div>
                    <div
                        style={{
                            fontSize: 11,
                            letterSpacing: 1.4,
                            textTransform: 'uppercase',
                            color: 'var(--cue-ink-3)',
                            fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                            marginBottom: 10,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        <Users className="w-3 h-3" />
                        TEAMS · 팀
                    </div>
                    <div className="space-y-2">
                        {teams.map((team) => (
                            <Link
                                key={team.id}
                                href={`/team/${team.slug || team.id}`}
                                className="block rounded-xl p-4 transition-colors"
                                style={{
                                    background: 'var(--cue-surface)',
                                    border: '1px solid var(--cue-hairline)',
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden relative"
                                        style={{
                                            background: 'var(--cue-surface-2)',
                                            border: '1px solid var(--cue-hairline)',
                                        }}
                                    >
                                        {team.profile_img ? (
                                            <Image src={team.profile_img} alt={team.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Users className="w-6 h-6" style={{ color: 'var(--cue-ink-4)' }} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3
                                                className="truncate"
                                                style={{ color: 'var(--cue-ink)', fontSize: 14, fontWeight: 600 }}
                                            >
                                                {team.name}
                                            </h3>
                                            {team.is_verified && (
                                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--cue-accent)' }} />
                                            )}
                                        </div>
                                        <p style={{ fontSize: 11, color: 'var(--cue-ink-3)', marginTop: 4 }}>
                                            멤버 {team.member_count}명
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {dancers.length > 0 && (
                <div>
                    <div
                        style={{
                            fontSize: 11,
                            letterSpacing: 1.4,
                            textTransform: 'uppercase',
                            color: 'var(--cue-ink-3)',
                            fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                            marginBottom: 10,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        <User className="w-3 h-3" />
                        DANCERS · 댄서
                    </div>
                    <div className="space-y-2">
                        {dancers.map((dancer) => (
                            <Link
                                key={dancer.id}
                                href={`/profile/${dancer.slug || dancer.id}`}
                                className="block rounded-xl p-4"
                                style={{
                                    background: 'var(--cue-surface)',
                                    border: '1px solid var(--cue-hairline)',
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                                        style={{
                                            background: 'var(--cue-surface-2)',
                                            border: '1px solid var(--cue-hairline)',
                                        }}
                                    >
                                        {dancer.profile_img ? (
                                            <img
                                                src={dancer.profile_img}
                                                alt={dancer.stage_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-7 h-7" style={{ color: 'var(--cue-ink-4)' }} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3
                                                className="truncate"
                                                style={{ color: 'var(--cue-ink)', fontSize: 14, fontWeight: 600 }}
                                            >
                                                {dancer.stage_name}
                                                {dancer.korean_name && (
                                                    <span style={{ color: 'var(--cue-ink-3)', marginLeft: 8, fontSize: 12, fontWeight: 400 }}>
                                                        {dancer.korean_name}
                                                    </span>
                                                )}
                                            </h3>
                                            {dancer.is_verified && (
                                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--cue-accent)' }} />
                                            )}
                                        </div>
                                        {dancer.genres && dancer.genres.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {dancer.genres.slice(0, 3).map((genre) => (
                                                    <span
                                                        key={genre}
                                                        style={{
                                                            padding: '2px 8px',
                                                            background: 'var(--cue-surface-2)',
                                                            color: 'var(--cue-ink-2)',
                                                            fontSize: 10,
                                                            borderRadius: 999,
                                                            border: '1px solid var(--cue-hairline)',
                                                        }}
                                                    >
                                                        {genre}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
