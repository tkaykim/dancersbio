'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User as UserIcon, Users, Edit, ExternalLink, Share2, Loader2, Plus, CheckCircle, AlertCircle, Mail, Clock, Crown, Shield } from 'lucide-react'
import Link from 'next/link'
import { useMyProfiles } from '@/hooks/useMyProfiles'
import type { ProfileStats } from '@/hooks/useMyProfiles'
import { getRelativeTime } from '@/lib/utils'

function calcCompleteness(dancer: any, careerCount: number): { score: number; total: number; missing: string[] } {
    const checks: { field: string; label: string; check: boolean }[] = [
        { field: 'profile_img', label: '프로필 사진', check: !!dancer.profile_img },
        { field: 'bio', label: '자기소개', check: !!dancer.bio },
        { field: 'specialties', label: '전문분야', check: Array.isArray(dancer.specialties) && dancer.specialties.length > 0 },
        { field: 'genres', label: '장르', check: Array.isArray(dancer.genres) && dancer.genres.length > 0 },
        { field: 'social_links', label: 'SNS 링크', check: dancer.social_links && typeof dancer.social_links === 'object' && Object.values(dancer.social_links).some((v: any) => !!v) },
        { field: 'portfolio', label: '포트폴리오', check: Array.isArray(dancer.portfolio) && dancer.portfolio.length > 0 },
        { field: 'careers', label: '경력', check: careerCount > 0 },
    ]

    const score = checks.filter(c => c.check).length
    const missing = checks.filter(c => !c.check).map(c => c.label)
    return { score, total: checks.length, missing }
}

export default function ProfilesPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const { ownedDancers, managedDancers, profileStats, loading } = useMyProfiles()

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin')
        }
    }, [user, authLoading, router])

    const handleShare = (dancer: any) => {
        const url = `${window.location.origin}/profile/${dancer.slug || dancer.id}`
        navigator.clipboard.writeText(url)
        alert('프로필 링크가 복사되었습니다!')
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-10">
                <div className="px-6 py-4 flex items-center gap-4">
                    <Link href="/my">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </Link>
                    <h1 className="text-xl font-bold text-white">프로필 관리</h1>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Profile Count Summary Chips */}
                {(ownedDancers.length > 0 || managedDancers.length > 0) && (
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                            <Crown className="w-3 h-3" />
                            내 프로필 {ownedDancers.length}
                        </span>
                        {managedDancers.length > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                                <Shield className="w-3 h-3" />
                                관리 중 {managedDancers.length}
                            </span>
                        )}
                    </div>
                )}

                {/* All Profiles */}
                {ownedDancers.length === 0 && managedDancers.length === 0 ? (
                    <div className="bg-neutral-900/50 border border-dashed border-neutral-800 rounded-2xl p-8 text-center">
                        <p className="text-white/40 text-sm mb-4">등록된 댄서 프로필이 없습니다.</p>
                        <Link
                            href="/onboarding"
                            className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-black font-bold rounded-full text-sm"
                        >
                            프로필 만들기
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {ownedDancers.map((dancer) => (
                            <DancerProfileCard
                                key={dancer.id}
                                dancer={dancer}
                                role="owner"
                                stats={profileStats[dancer.id]}
                                onShare={() => handleShare(dancer)}
                            />
                        ))}
                        {managedDancers.map((dancer) => (
                            <DancerProfileCard
                                key={dancer.id}
                                dancer={dancer}
                                role="manager"
                                stats={profileStats[dancer.id]}
                                onShare={() => handleShare(dancer)}
                            />
                        ))}
                    </div>
                )}

                {/* Add Profile Button */}
                <Link
                    href="/onboarding"
                    className="flex items-center justify-center gap-2 w-full py-4 border border-dashed border-neutral-700 rounded-2xl text-white/60 hover:text-white hover:border-primary/50 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium text-sm">새 프로필 추가</span>
                </Link>
            </div>
        </div>
    )
}

function DancerProfileCard({ dancer, role, stats, onShare }: {
    dancer: any
    role: 'owner' | 'manager'
    stats?: ProfileStats
    onShare: () => void
}) {
    const careerCount = stats?.careerCount ?? 0
    const { score, total, missing } = calcCompleteness(dancer, careerCount)
    const pct = Math.round((score / total) * 100)
    const proposalCount = stats?.proposalCount ?? 0

    return (
        <div className={`bg-neutral-900 border rounded-2xl p-4 space-y-3 ${role === 'manager' ? 'border-blue-500/20' : 'border-neutral-800'}`}>
            {/* Role & Status Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
                {role === 'owner' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                        <Crown className="w-3 h-3" />
                        내 프로필
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[11px] font-semibold">
                        <Shield className="w-3 h-3" />
                        매니저 권한
                    </span>
                )}
                {dancer.is_verified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-400/10 text-green-400 text-[11px] font-medium">
                        <CheckCircle className="w-3 h-3" />
                        승인됨 · 공개
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-400/10 text-orange-400 text-[11px] font-medium">
                        <AlertCircle className="w-3 h-3" />
                        승인 대기 · 비공개
                    </span>
                )}
                {proposalCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 text-white/50 text-[11px] font-medium">
                        <Mail className="w-3 h-3" />
                        제안 {proposalCount}건
                    </span>
                )}
            </div>

            {/* Avatar + Info + Actions */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-neutral-800 rounded-xl overflow-hidden flex-shrink-0">
                    {dancer.profile_img ? (
                        <img src={dancer.profile_img} alt={dancer.stage_name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-white/20" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold truncate">{dancer.stage_name}</h3>
                    <p className="text-xs text-white/40 truncate">
                        {dancer.location || '위치 미지정'}
                    </p>
                    {dancer.genres && dancer.genres.length > 0 && (
                        <div className="flex gap-1 mt-1 overflow-hidden">
                            {dancer.genres.slice(0, 3).map((g: string) => (
                                <span key={g} className="text-[10px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded">{g}</span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={onShare}
                        className="p-2 bg-neutral-800 rounded-lg text-white/60 hover:text-white transition-colors"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                    <Link
                        href={`/my/profiles/${dancer.id}/edit`}
                        className="p-2 bg-neutral-800 rounded-lg text-white/60 hover:text-white transition-colors"
                    >
                        <Edit className="w-5 h-5" />
                    </Link>
                    <Link
                        href={`/profile/${dancer.slug || dancer.id}`}
                        className="p-2 bg-neutral-800 rounded-lg text-white/60 hover:text-white transition-colors"
                    >
                        <ExternalLink className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            {/* Completeness bar */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">프로필 완성도</span>
                    <span className={`font-semibold ${pct === 100 ? 'text-green-400' : pct >= 70 ? 'text-primary' : 'text-orange-400'}`}>
                        {pct}%
                    </span>
                </div>
                <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-400' : pct >= 70 ? 'bg-primary' : 'bg-orange-400'}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                {pct < 100 && (
                    <p className="text-[11px] text-white/30">
                        <AlertCircle className="w-3 h-3 inline mr-1 -mt-0.5" />
                        미완성: {missing.join(', ')}
                    </p>
                )}
                {pct < 100 && (
                    <Link href={`/my/profiles/${dancer.id}/edit`} className="text-[11px] text-primary hover:underline">
                        프로필을 완성하면 더 많은 제안을 받을 수 있어요 →
                    </Link>
                )}
            </div>

            {/* Last updated */}
            {dancer.updated_at && (
                <div className="flex items-center gap-1 text-xs text-white/25 pt-1 border-t border-neutral-800/50">
                    <Clock className="w-3 h-3" />
                    <span>마지막 수정 {getRelativeTime(dancer.updated_at)}</span>
                </div>
            )}
        </div>
    )
}
