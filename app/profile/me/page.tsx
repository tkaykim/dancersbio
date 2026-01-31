'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogOut, User as UserIcon, Mail, Edit, ExternalLink, Loader2, Users } from 'lucide-react'
import Link from 'next/link'

export default function ProfileMePage() {
    const { user, loading: authLoading, signOut } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [ownedDancers, setOwnedDancers] = useState<any[]>([])
    const [managedDancers, setManagedDancers] = useState<any[]>([])

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            fetchUserProfiles()
        }
    }, [user])

    const fetchUserProfiles = async () => {
        setLoading(true)
        try {
            // Fetch owned profiles
            const { data: owned, error: ownedError } = await supabase
                .from('dancers')
                .select('*')
                .eq('owner_id', user!.id)

            if (ownedError) throw ownedError

            // Fetch managed profiles
            const { data: managed, error: managedError } = await supabase
                .from('dancers')
                .select('*')
                .eq('manager_id', user!.id)

            if (managedError) throw managedError

            setOwnedDancers(owned || [])
            setManagedDancers(managed || [])
        } catch (err) {
            console.error('Error fetching profiles:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSignOut = async () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            await signOut()
            router.push('/')
        }
    }

    if (authLoading || (loading && !ownedDancers.length && !managedDancers.length)) {
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
                <div className="px-6 py-4">
                    <h1 className="text-2xl font-bold text-white">내 정보</h1>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
                {/* User Info Card */}
                <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                            <UserIcon className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {user.user_metadata?.name || '사용자'}
                            </h2>
                            <p className="text-white/60 text-sm mt-1 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {user.email}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-neutral-800/50">
                            <span className="text-white/60">가입일</span>
                            <span className="text-white">
                                {new Date(user.created_at).toLocaleDateString('ko-KR')}
                            </span>
                        </div>
                    </div>
                </section>

                {/* My Dancer Profiles */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-primary" />
                            내 댄서 프로필
                        </h2>
                    </div>

                    {ownedDancers.length > 0 ? (
                        <div className="grid gap-4">
                            {ownedDancers.map((dancer) => (
                                <div key={dancer.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center gap-4">
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
                                        <p className="text-white/40 text-xs truncate">{dancer.location || '위치 미지정'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/dashboard/edit/${dancer.id}`}
                                            className="p-2 bg-neutral-800 rounded-lg text-white/60 hover:text-white transition-colors"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </Link>
                                        <Link
                                            href={`/profile/${dancer.id}`}
                                            className="p-2 bg-neutral-800 rounded-lg text-white/60 hover:text-white transition-colors"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-neutral-900/50 border border-dashed border-neutral-800 rounded-2xl p-8 text-center">
                            <p className="text-white/40 text-sm mb-4">등록된 댄서 프로필이 없습니다.</p>
                            <Link
                                href="/search"
                                className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-black font-bold rounded-full text-sm"
                            >
                                프로필 만들기
                            </Link>
                        </div>
                    )}
                </section>

                {/* Managed Profiles */}
                {managedDancers.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-400" />
                            관리 중인 프로필
                        </h2>
                        <div className="grid gap-4">
                            {managedDancers.map((dancer) => (
                                <div key={dancer.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center gap-4">
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
                                        <p className="text-blue-400/60 text-xs truncate">매니저 권한</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/dashboard/edit/${dancer.id}`}
                                            className="p-2 bg-neutral-800 rounded-lg text-white/60 hover:text-white transition-colors"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </Link>
                                        <Link
                                            href={`/profile/${dancer.id}`}
                                            className="p-2 bg-neutral-800 rounded-lg text-white/60 hover:text-white transition-colors"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Actions */}
                <div className="pt-4">
                    <button
                        onClick={handleSignOut}
                        className="w-full py-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-500 font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-5 h-5" />
                        로그아웃
                    </button>
                    <p className="text-center text-white/20 text-[10px] mt-6">
                        dancers.bio v2.1.0
                    </p>
                </div>
            </div>
        </div>
    )
}
