'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/hooks/useAdmin'
import { supabase } from '@/lib/supabase'
import { Loader2, ShieldCheck, CheckCircle, XCircle, User as UserIcon, Eye } from 'lucide-react'
import Link from 'next/link'
import { getRelativeTime } from '@/lib/utils'
import type { ProfileRequest } from '@/lib/types'

type AdminTab = 'profiles' | 'requests'

interface PendingDancer {
    id: string
    stage_name: string
    korean_name: string | null
    profile_img: string | null
    owner_id: string | null
    genres: string[] | null
    specialties: string[] | null
    created_at: string
    owner?: { name: string | null; email: string | null }
}

export default function AdminPage() {
    const router = useRouter()
    const { isAdmin, loading: adminLoading, user } = useAdmin()
    const [activeTab, setActiveTab] = useState<AdminTab>('profiles')
    const [pendingDancers, setPendingDancers] = useState<PendingDancer[]>([])
    const [requests, setRequests] = useState<ProfileRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)

    useEffect(() => {
        if (!adminLoading && !isAdmin) {
            router.replace('/my')
        }
    }, [isAdmin, adminLoading, router])

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            if (activeTab === 'profiles') {
                const { data } = await supabase
                    .from('dancers')
                    .select('id, stage_name, korean_name, profile_img, owner_id, genres, specialties, created_at, owner:users!owner_id(name, email)')
                    .eq('is_verified', false)
                    .order('created_at', { ascending: false })

                setPendingDancers((data as any) || [])
            } else {
                const { data } = await supabase
                    .from('profile_requests')
                    .select('*, dancers(id, stage_name, profile_img), requester:users!requester_id(name, email)')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })

                setRequests((data as any) || [])
            }
        } catch (err) {
            console.error('Admin fetch error:', err)
        } finally {
            setLoading(false)
        }
    }, [activeTab])

    useEffect(() => {
        if (isAdmin) {
            fetchData()
        }
    }, [isAdmin, fetchData])

    const approveProfile = async (dancerId: string) => {
        setProcessing(dancerId)
        try {
            const { error } = await supabase
                .from('dancers')
                .update({ is_verified: true })
                .eq('id', dancerId)

            if (error) throw error
            setPendingDancers(prev => prev.filter(d => d.id !== dancerId))
        } catch (err) {
            console.error('Approve error:', err)
            alert('승인에 실패했습니다.')
        } finally {
            setProcessing(null)
        }
    }

    const handleRequest = async (request: ProfileRequest, action: 'approved' | 'rejected') => {
        setProcessing(request.id)
        try {
            const { error: reqError } = await supabase
                .from('profile_requests')
                .update({
                    status: action,
                    reviewed_by: user!.id,
                    reviewed_at: new Date().toISOString(),
                })
                .eq('id', request.id)

            if (reqError) throw reqError

            if (action === 'approved') {
                const updateField = request.type === 'claim' ? 'owner_id' : 'manager_id'
                const { error: dancerError } = await supabase
                    .from('dancers')
                    .update({ [updateField]: request.requester_id })
                    .eq('id', request.dancer_id)

                if (dancerError) throw dancerError
            }

            setRequests(prev => prev.filter(r => r.id !== request.id))
        } catch (err) {
            console.error('Handle request error:', err)
            alert('처리에 실패했습니다.')
        } finally {
            setProcessing(null)
        }
    }

    if (adminLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    if (!isAdmin) return null

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-10">
                <div className="px-6 py-4 flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    <h1 className="text-xl font-bold text-white">관리자</h1>
                </div>

                <div className="flex border-t border-neutral-800">
                    <button
                        onClick={() => setActiveTab('profiles')}
                        className={`flex-1 py-3 text-sm font-medium relative ${activeTab === 'profiles' ? 'text-primary' : 'text-white/60'}`}
                    >
                        프로필 승인
                        {activeTab === 'profiles' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 py-3 text-sm font-medium relative ${activeTab === 'requests' ? 'text-primary' : 'text-white/60'}`}
                    >
                        권한 요청
                        {activeTab === 'requests' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary" />}
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-3">
                {loading ? (
                    <div className="text-center py-16 text-white/40">로딩 중...</div>
                ) : activeTab === 'profiles' ? (
                    /* Pending Profiles */
                    pendingDancers.length === 0 ? (
                        <div className="text-center py-16">
                            <CheckCircle className="w-12 h-12 text-green-400/30 mx-auto mb-3" />
                            <p className="text-white/40 text-sm">승인 대기 중인 프로필이 없습니다</p>
                        </div>
                    ) : (
                        pendingDancers.map(dancer => (
                            <div key={dancer.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                                        {dancer.profile_img ? (
                                            <img src={dancer.profile_img} alt={dancer.stage_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <UserIcon className="w-5 h-5 text-white/20" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-bold truncate">
                                            {dancer.stage_name}
                                            {dancer.korean_name && <span className="text-white/40 font-normal ml-2 text-sm">{dancer.korean_name}</span>}
                                        </h3>
                                        <p className="text-xs text-white/40 truncate">
                                            {dancer.owner?.name ? `등록자: ${dancer.owner.name} (${dancer.owner.email})` : '소유자 미연결'}
                                        </p>
                                        <p className="text-[11px] text-white/25">{getRelativeTime(dancer.created_at)}</p>
                                    </div>
                                    <Link
                                        href={`/profile/${dancer.id}`}
                                        className="p-2 bg-neutral-800 rounded-lg text-white/40 hover:text-white"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                </div>

                                {dancer.genres && dancer.genres.length > 0 && (
                                    <div className="flex gap-1 flex-wrap">
                                        {dancer.genres.slice(0, 5).map(g => (
                                            <span key={g} className="text-[10px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded">{g}</span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => approveProfile(dancer.id)}
                                        disabled={processing === dancer.id}
                                        className="flex-1 py-2.5 bg-green-500/10 text-green-400 font-semibold text-sm rounded-lg hover:bg-green-500/20 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                                    >
                                        {processing === dancer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        승인
                                    </button>
                                </div>
                            </div>
                        ))
                    )
                ) : (
                    /* Pending Requests */
                    requests.length === 0 ? (
                        <div className="text-center py-16">
                            <CheckCircle className="w-12 h-12 text-green-400/30 mx-auto mb-3" />
                            <p className="text-white/40 text-sm">처리 대기 중인 요청이 없습니다</p>
                        </div>
                    ) : (
                        requests.map(req => (
                            <div key={req.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                                        {req.dancers?.profile_img ? (
                                            <img src={req.dancers.profile_img} alt={req.dancers.stage_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <UserIcon className="w-5 h-5 text-white/20" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${req.type === 'claim'
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                {req.type === 'claim' ? '소유권 요청' : '매니저 요청'}
                                            </span>
                                        </div>
                                        <h3 className="text-white font-bold text-sm truncate">{req.dancers?.stage_name}</h3>
                                        <p className="text-xs text-white/40 truncate">
                                            요청자: {req.requester?.name || '알 수 없음'} ({req.requester?.email})
                                        </p>
                                        {req.note && <p className="text-[11px] text-white/30 mt-1">"{req.note}"</p>}
                                        <p className="text-[11px] text-white/25">{getRelativeTime(req.created_at)}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRequest(req, 'approved')}
                                        disabled={processing === req.id}
                                        className="flex-1 py-2.5 bg-green-500/10 text-green-400 font-semibold text-sm rounded-lg hover:bg-green-500/20 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                                    >
                                        {processing === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        승인
                                    </button>
                                    <button
                                        onClick={() => handleRequest(req, 'rejected')}
                                        disabled={processing === req.id}
                                        className="flex-1 py-2.5 bg-red-500/10 text-red-400 font-semibold text-sm rounded-lg hover:bg-red-500/20 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        거절
                                    </button>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    )
}
