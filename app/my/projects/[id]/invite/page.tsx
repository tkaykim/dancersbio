'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import type { Dancer } from '@/lib/supabase'
import {
    ArrowLeft, Loader2, Search, X, Send, Check, ChevronDown,
    Users, Star, User as UserIcon, Filter,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const GENRE_OPTIONS = ['HipHop', 'Popping', 'Locking', 'Waacking', 'Voguing', 'Krump', 'House', 'Breaking', 'Contemporary', 'Jazz']
const GENDER_OPTIONS = [
    { value: 'male', label: '남성' },
    { value: 'female', label: '여성' },
    { value: 'other', label: '기타' },
]

interface FrequentDancer {
    dancer: Dancer
    count: number
}

export default function InviteDancerPage() {
    const { id: projectId } = useParams<{ id: string }>()
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    const [projectTitle, setProjectTitle] = useState('')
    const [existingDancerIds, setExistingDancerIds] = useState<Set<string>>(new Set())

    const [searchQuery, setSearchQuery] = useState('')
    const [genderFilter, setGenderFilter] = useState<string | null>(null)
    const [genreFilter, setGenreFilter] = useState<string | null>(null)
    const [showFilters, setShowFilters] = useState(false)

    const [allDancers, setAllDancers] = useState<Dancer[]>([])
    const [frequentDancers, setFrequentDancers] = useState<FrequentDancer[]>([])
    const [selectedDancerIds, setSelectedDancerIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    const [feeInput, setFeeInput] = useState('')
    const [roleInput, setRoleInput] = useState('')
    const [messageInput, setMessageInput] = useState('')

    const [activeTab, setActiveTab] = useState<'frequent' | 'search'>('frequent')

    const fetchData = useCallback(async () => {
        if (!user || !projectId) return
        setLoading(true)
        try {
            // Fetch project info & existing proposals
            const { data: project } = await supabase
                .from('projects')
                .select('title, proposals (dancer_id)')
                .eq('id', projectId)
                .single()

            if (project) {
                setProjectTitle(project.title)
                const ids = new Set((project.proposals as any[])?.map((p: any) => p.dancer_id) || [])
                setExistingDancerIds(ids)
            }

            // Fetch all verified dancers
            const { data: dancers } = await supabase
                .from('dancers')
                .select('*')
                .eq('is_verified', true)
                .order('stage_name')

            setAllDancers((dancers as Dancer[]) || [])

            // Calculate frequently collaborated dancers
            // Find all projects this user was involved in
            const { data: pastProjects } = await supabase
                .from('projects')
                .select('id')
                .eq('owner_id', user.id)

            if (pastProjects && pastProjects.length > 0) {
                const pastProjectIds = pastProjects.map(p => p.id)
                const { data: pastProposals } = await supabase
                    .from('proposals')
                    .select('dancer_id, status')
                    .in('project_id', pastProjectIds)
                    .eq('status', 'accepted')

                if (pastProposals) {
                    const countMap = new Map<string, number>()
                    pastProposals.forEach(p => {
                        countMap.set(p.dancer_id, (countMap.get(p.dancer_id) || 0) + 1)
                    })

                    const dancerMap = new Map<string, Dancer>()
                    ;(dancers || []).forEach(d => dancerMap.set(d.id, d as Dancer))

                    const freq: FrequentDancer[] = []
                    countMap.forEach((count, dancerId) => {
                        const d = dancerMap.get(dancerId)
                        if (d) freq.push({ dancer: d, count })
                    })
                    freq.sort((a, b) => b.count - a.count)
                    setFrequentDancers(freq.slice(0, 20))
                }
            }
        } catch (err) {
            console.error('Error loading invite data:', err)
        } finally {
            setLoading(false)
        }
    }, [user, projectId])

    useEffect(() => {
        if (!authLoading && !user) router.push('/auth/signin')
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) fetchData()
    }, [user, fetchData])

    const filteredDancers = useMemo(() => {
        let results = allDancers.filter(d => !existingDancerIds.has(d.id))
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            results = results.filter(d =>
                d.stage_name.toLowerCase().includes(q) ||
                d.genres?.some(g => g.toLowerCase().includes(q)) ||
                d.location?.toLowerCase().includes(q)
            )
        }
        if (genderFilter) {
            results = results.filter(d => d.gender === genderFilter)
        }
        if (genreFilter) {
            results = results.filter(d => d.genres?.includes(genreFilter))
        }
        return results
    }, [allDancers, existingDancerIds, searchQuery, genderFilter, genreFilter])

    const toggleSelect = (dancerId: string) => {
        setSelectedDancerIds(prev => {
            const next = new Set(prev)
            if (next.has(dancerId)) next.delete(dancerId)
            else next.add(dancerId)
            return next
        })
    }

    const sendInvites = async () => {
        if (selectedDancerIds.size === 0 || !user) return
        setSending(true)
        try {
            const proposals = Array.from(selectedDancerIds).map(dancerId => ({
                project_id: projectId,
                dancer_id: dancerId,
                sender_id: user.id,
                fee: feeInput ? parseInt(feeInput) : null,
                role: roleInput || null,
                details: messageInput || null,
                status: 'pending',
            }))

            const { error } = await supabase.from('proposals').insert(proposals)
            if (error) throw error

            alert(`${selectedDancerIds.size}명의 댄서에게 제안을 보냈습니다!`)
            router.push(`/my/projects/${projectId}`)
        } catch (err: any) {
            alert('오류: ' + err.message)
        } finally {
            setSending(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    const frequentFiltered = frequentDancers.filter(fd => !existingDancerIds.has(fd.dancer.id))

    return (
        <div className={`min-h-screen bg-background ${selectedDancerIds.size > 0 ? 'pb-64' : 'pb-20'}`}>
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-20">
                <div className="px-6 py-4 flex items-center gap-4">
                    <Link href={`/my/projects/${projectId}`}><ArrowLeft className="w-6 h-6 text-white" /></Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold text-white">댄서 초대</h1>
                        <p className="text-xs text-white/40 truncate">{projectTitle}</p>
                    </div>
                    {selectedDancerIds.size > 0 && (
                        <span className="text-xs bg-primary/20 text-primary px-2.5 py-1 rounded-full font-semibold">
                            {selectedDancerIds.size}명 선택
                        </span>
                    )}
                </div>

                {/* Tabs */}
                <div className="px-6 flex gap-1">
                    <button
                        onClick={() => setActiveTab('frequent')}
                        className={`flex-1 py-2.5 text-sm font-medium text-center transition border-b-2 ${activeTab === 'frequent'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-white/40 hover:text-white/60'
                        }`}
                    >
                        <Star className="w-3.5 h-3.5 inline mr-1" />
                        자주 함께한 댄서
                    </button>
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`flex-1 py-2.5 text-sm font-medium text-center transition border-b-2 ${activeTab === 'search'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-white/40 hover:text-white/60'
                        }`}
                    >
                        <Search className="w-3.5 h-3.5 inline mr-1" />
                        검색하여 찾기
                    </button>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'frequent' ? (
                <div className="p-4">
                    {frequentFiltered.length === 0 ? (
                        <div className="text-center py-16">
                            <Users className="w-12 h-12 text-white/10 mx-auto mb-3" />
                            <p className="text-white/40 text-sm">이전에 함께 작업한 댄서가 없습니다</p>
                            <button onClick={() => setActiveTab('search')} className="text-primary text-xs mt-2 hover:underline">
                                검색으로 댄서 찾기
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {frequentFiltered.map(({ dancer, count }) => (
                                <DancerSelectRow
                                    key={dancer.id}
                                    dancer={dancer}
                                    selected={selectedDancerIds.has(dancer.id)}
                                    onToggle={() => toggleSelect(dancer.id)}
                                    badge={`${count}회 협업`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-0">
                    {/* Search & Filters */}
                    <div className="px-4 pt-3 space-y-2.5 sticky top-[105px] bg-background z-10 pb-2">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="이름, 장르, 지역 검색..."
                                    className="w-full pl-9 pr-8 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <X className="w-4 h-4 text-white/30" />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-3 py-2 rounded-lg border transition flex-shrink-0 ${showFilters || genderFilter || genreFilter
                                    ? 'bg-primary/10 border-primary/30 text-primary'
                                    : 'bg-neutral-900 border-neutral-800 text-white/40'
                                }`}
                            >
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>

                        {showFilters && (
                            <div className="space-y-2.5 pb-1">
                                {/* Gender Filter */}
                                <div>
                                    <p className="text-[11px] text-white/30 mb-1.5">성별</p>
                                    <div className="flex gap-1.5 flex-wrap">
                                        <button
                                            onClick={() => setGenderFilter(null)}
                                            className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition ${!genderFilter ? 'bg-white/10 text-white' : 'bg-neutral-800 text-white/30'}`}
                                        >
                                            전체
                                        </button>
                                        {GENDER_OPTIONS.map(g => (
                                            <button
                                                key={g.value}
                                                onClick={() => setGenderFilter(genderFilter === g.value ? null : g.value)}
                                                className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition ${genderFilter === g.value ? 'bg-white/10 text-white' : 'bg-neutral-800 text-white/30'}`}
                                            >
                                                {g.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Genre Filter */}
                                <div>
                                    <p className="text-[11px] text-white/30 mb-1.5">장르</p>
                                    <div className="flex gap-1.5 flex-wrap">
                                        <button
                                            onClick={() => setGenreFilter(null)}
                                            className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition ${!genreFilter ? 'bg-white/10 text-white' : 'bg-neutral-800 text-white/30'}`}
                                        >
                                            전체
                                        </button>
                                        {GENRE_OPTIONS.map(g => (
                                            <button
                                                key={g}
                                                onClick={() => setGenreFilter(genreFilter === g ? null : g)}
                                                className={`text-[11px] px-3 py-1.5 rounded-full font-medium transition ${genreFilter === g ? 'bg-white/10 text-white' : 'bg-neutral-800 text-white/30'}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {(genderFilter || genreFilter) && (
                                    <button
                                        onClick={() => { setGenderFilter(null); setGenreFilter(null) }}
                                        className="text-[11px] text-primary hover:underline"
                                    >
                                        필터 초기화
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Results */}
                    <div className="px-4 pb-4 space-y-2">
                        <p className="text-[11px] text-white/30 px-1 py-1">
                            {filteredDancers.length}명의 댄서
                        </p>
                        {filteredDancers.length === 0 ? (
                            <div className="text-center py-12">
                                <Search className="w-10 h-10 text-white/10 mx-auto mb-2" />
                                <p className="text-white/30 text-sm">검색 결과가 없습니다</p>
                            </div>
                        ) : (
                            filteredDancers.map(dancer => (
                                <DancerSelectRow
                                    key={dancer.id}
                                    dancer={dancer}
                                    selected={selectedDancerIds.has(dancer.id)}
                                    onToggle={() => toggleSelect(dancer.id)}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Bottom Sheet: Invite Details & Send Button — 내비게이션 바 위에 표시 */}
            {selectedDancerIds.size > 0 && (
                <div className="fixed bottom-16 left-0 right-0 bg-neutral-900 border-t border-neutral-800 p-4 pb-5 space-y-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
                    {/* 역할 빠른 선택 */}
                    <div className="flex gap-1.5 flex-wrap">
                        {['메인 댄서', '백업 댄서', '공동 안무', '게스트', '디렉터'].map(r => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setRoleInput(r)}
                                className={`text-[11px] px-2.5 py-1 rounded-full transition ${roleInput === r
                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                    : 'bg-neutral-800 text-white/40 border border-neutral-700 hover:text-white/60'
                                }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={roleInput}
                            onChange={(e) => setRoleInput(e.target.value)}
                            placeholder="역할 (예: 메인 댄서)"
                            className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-white/25 focus:outline-none focus:border-primary"
                        />
                        <input
                            type="number"
                            value={feeInput}
                            onChange={(e) => setFeeInput(e.target.value)}
                            placeholder="금액 (원)"
                            className="w-28 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-white/25 focus:outline-none focus:border-primary"
                        />
                    </div>
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="메시지 (선택)"
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-white/25 focus:outline-none focus:border-primary"
                    />
                    <button
                        onClick={sendInvites}
                        disabled={sending}
                        className="w-full py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {sending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        {selectedDancerIds.size}명에게 제안 보내기
                    </button>
                </div>
            )}
        </div>
    )
}

function DancerSelectRow({
    dancer,
    selected,
    onToggle,
    badge,
}: {
    dancer: Dancer
    selected: boolean
    onToggle: () => void
    badge?: string
}) {
    return (
        <button
            onClick={onToggle}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-left ${selected
                ? 'bg-primary/10 border border-primary/30'
                : 'bg-neutral-900/50 border border-neutral-800/50 hover:bg-neutral-800/30'
            }`}
        >
            <div className="w-10 h-10 bg-neutral-800 rounded-full overflow-hidden flex-shrink-0 relative">
                {dancer.profile_img ? (
                    <Image src={dancer.profile_img} alt={dancer.stage_name} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-white/20" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{dancer.stage_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    {dancer.genres && dancer.genres.length > 0 && (
                        <p className="text-[10px] text-white/30 truncate">{dancer.genres.slice(0, 3).join(', ')}</p>
                    )}
                    {dancer.gender && (
                        <span className="text-[10px] text-white/20">
                            {dancer.gender === 'male' ? '남' : dancer.gender === 'female' ? '여' : '기타'}
                        </span>
                    )}
                </div>
            </div>
            {badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 font-medium flex-shrink-0">
                    {badge}
                </span>
            )}
            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${selected
                ? 'border-primary bg-primary'
                : 'border-neutral-600'
            }`}>
                {selected && <Check className="w-3 h-3 text-black" />}
            </div>
        </button>
    )
}
