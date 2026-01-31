'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, User, CheckCircle2, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MobileContainer from "@/components/layout/MobileContainer"

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
}

export default function OnboardingPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState<DancerSearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    useEffect(() => {
        if (searchQuery.length >= 2) {
            const debounce = setTimeout(() => {
                performSearch()
            }, 300)
            return () => clearTimeout(debounce)
        } else {
            setResults([])
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
            setResults(data || [])
        } catch (err) {
            console.error('Search error:', err)
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    const getSimilarityLabel = (score: number) => {
        if (score >= 0.7) return { label: '정확히 일치', color: 'text-green-500' }
        if (score >= 0.4) return { label: '유사함', color: 'text-yellow-500' }
        return { label: '부분 일치', color: 'text-blue-500' }
    }

    return (
        <MobileContainer>
            <div className={`flex flex-col h-full bg-background p-6 transition-all duration-300 ${searched ? 'justify-start pt-10' : 'justify-center items-center -mt-20'}`}>
                <div className="w-full max-w-md">
                    <div className={`text-center mb-8 transition-all ${searched ? 'hidden' : 'block'}`}>
                        <h1 className="text-3xl font-bold mb-2">Find Your Name</h1>
                        <p className="text-muted-foreground text-sm">
                            활동명을 검색하여 프로필을 찾거나 새로 만드세요.
                        </p>
                    </div>

                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="활동명 입력 (예: J-HO)"
                            className="w-full h-14 pl-12 pr-4 rounded-xl border border-input bg-background shadow-sm focus:ring-2 focus:ring-primary focus:outline-none text-lg"
                        />
                    </div>

                    {/* Search Info */}
                    {!searched && searchQuery.length > 0 && searchQuery.length < 2 && (
                        <p className="text-white/40 text-sm mt-2 text-center">최소 2글자 이상 입력하세요</p>
                    )}

                    {/* Results Area */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-10">
                                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                            </div>
                        ) : searched && results.length === 0 ? (
                            <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-2">
                                <p className="text-white/60 mb-2">&apos;{searchQuery}&apos; 검색 결과가 없습니다</p>
                                <p className="text-sm text-white/40 mb-6">새로운 댄서 프로필을 만들어보세요!</p>
                                <Link
                                    href="/onboarding/create"
                                    className="w-full block py-4 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-colors"
                                >
                                    새 프로필 만들기
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {results.map((dancer) => {
                                    const similarity = getSimilarityLabel(dancer.similarity_score)
                                    return (
                                        <Link
                                            key={dancer.id}
                                            href={`/profile/${dancer.id}`}
                                            className="block bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 hover:border-primary/50 transition-colors animate-in fade-in slide-in-from-bottom-2"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-14 h-14 bg-neutral-800 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                    {dancer.profile_img ? (
                                                        <img
                                                            src={dancer.profile_img}
                                                            alt={dancer.stage_name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="w-6 h-6 text-white/40" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-white font-bold truncate">
                                                            {dancer.stage_name}
                                                            {dancer.korean_name && (
                                                                <span className="text-white/60 ml-2 text-sm font-normal">
                                                                    {dancer.korean_name}
                                                                </span>
                                                            )}
                                                        </h3>
                                                        {dancer.is_verified && (
                                                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/5 ${similarity.color}`}>
                                                            {similarity.label}
                                                        </span>
                                                        <span className="text-white/40 text-[10px]">
                                                            {Math.round(dancer.similarity_score * 100)}% 일치
                                                        </span>
                                                    </div>

                                                    {dancer.genres && dancer.genres.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {dancer.genres.slice(0, 3).map((genre) => (
                                                                <span
                                                                    key={genre}
                                                                    className="px-2 py-0.5 bg-neutral-800 text-white/60 text-[10px] rounded"
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

                                {searched && results.length > 0 && (
                                    <div className="pt-4 border-t border-white/5 mt-4">
                                        <p className="text-white/40 text-xs text-center mb-3">찾으시는 프로필이 없나요?</p>
                                        <Link
                                            href="/onboarding/create"
                                            className="w-full block py-3 rounded-xl bg-neutral-800 text-white text-center text-sm font-medium hover:bg-neutral-700 transition-colors"
                                        >
                                            새 프로필 만들기
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MobileContainer>
    )
}
