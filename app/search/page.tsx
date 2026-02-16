'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, User, CheckCircle2, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

export default function FindYourNamePage() {
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
            // Use the fuzzy search function
            const { data, error } = await supabase.rpc('search_dancers_fuzzy', {
                search_query: searchQuery,
                similarity_threshold: 0.2
            })

            if (error) throw error
            const verified = (data || []).filter((d: any) => d.is_verified !== false)
            setResults(verified)
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
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-10">
                <div className="px-6 py-6">
                    <h1 className="text-2xl font-bold text-white mb-2">활동명 찾기</h1>
                    <p className="text-white/60 text-sm">
                        활동명을 검색하여 프로필을 찾거나 새로 만드세요
                    </p>
                </div>
            </div>

            {/* Search Input */}
            <div className="p-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="예: J-Ho, 제이호, Lia Kim..."
                        className="w-full pl-12 pr-4 py-4 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary text-lg"
                        autoFocus
                    />
                </div>

                {/* Search Info */}
                {searchQuery.length > 0 && searchQuery.length < 2 && (
                    <p className="text-white/40 text-sm mt-3">최소 2글자 이상 입력하세요</p>
                )}
            </div>

            {/* Results */}
            <div className="px-6 pb-6">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-white/60">검색 중...</div>
                    </div>
                ) : searched && results.length === 0 ? (
                    <div className="text-center py-12">
                        <User className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <h3 className="text-white font-semibold mb-2">
                            &quot;{searchQuery}&quot; 검색 결과가 없습니다
                        </h3>
                        <p className="text-white/60 text-sm mb-6">
                            새로운 프로필을 만들어보세요
                        </p>
                        <button
                            onClick={() => router.push('/onboarding/create')}
                            className="px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            프로필 만들기
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {results.map((dancer) => {
                            const similarity = getSimilarityLabel(dancer.similarity_score)
                            return (
                                <Link
                                    key={dancer.id}
                                    href={`/profile/${dancer.id}`}
                                    className="block bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-primary/50 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Profile Image */}
                                        <div className="w-16 h-16 bg-neutral-800 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {dancer.profile_img ? (
                                                <img
                                                    src={dancer.profile_img}
                                                    alt={dancer.stage_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-8 h-8 text-white/40" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-white font-semibold truncate">
                                                    {dancer.stage_name}
                                                    {dancer.korean_name && (
                                                        <span className="text-white/60 ml-2 text-sm">
                                                            {dancer.korean_name}
                                                        </span>
                                                    )}
                                                </h3>
                                                {dancer.is_verified && (
                                                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                                )}
                                            </div>

                                            {/* Similarity Score */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-xs font-medium ${similarity.color}`}>
                                                    {similarity.label}
                                                </span>
                                                <span className="text-white/40 text-xs">
                                                    {Math.round(dancer.similarity_score * 100)}% 일치
                                                </span>
                                            </div>

                                            {/* Genres */}
                                            {dancer.genres && dancer.genres.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {dancer.genres.slice(0, 3).map((genre) => (
                                                        <span
                                                            key={genre}
                                                            className="px-2 py-0.5 bg-neutral-800 text-white/60 text-xs rounded"
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
                )}

                {/* Create New Profile CTA */}
                {searched && results.length > 0 && (
                    <div className="mt-6 p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg">
                        <p className="text-white/60 text-sm mb-3">
                            찾으시는 프로필이 없나요?
                        </p>
                        <button
                            onClick={() => router.push('/onboarding/create')}
                            className="w-full py-3 bg-primary/10 border border-primary/50 text-primary font-medium rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            새 프로필 만들기
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
