'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle, User as UserIcon, Eye } from 'lucide-react'
import Link from 'next/link'
import { getRelativeTime } from '@/lib/utils'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

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

export default function AdminProfilesPendingPage() {
    const { isAdmin } = useAdmin()
    const [pendingDancers, setPendingDancers] = useState<PendingDancer[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await supabase
                .from('dancers')
                .select('id, stage_name, korean_name, profile_img, owner_id, genres, specialties, created_at, owner:users!owner_id(name, email)')
                .eq('is_verified', false)
                .order('created_at', { ascending: false })
            const normalized = (data ?? []).map((row: Record<string, unknown>) => {
                const owner = row.owner
                const ownerObj = Array.isArray(owner) ? owner[0] : owner
                return { ...row, owner: ownerObj } as PendingDancer
            })
            setPendingDancers(normalized)
        } catch (err) {
            console.error('Admin fetch error:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (isAdmin) fetchData()
    }, [isAdmin, fetchData])

    const approveProfile = async (dancerId: string) => {
        setProcessing(dancerId)
        try {
            const { error } = await supabase.from('dancers').update({ is_verified: true }).eq('id', dancerId)
            if (error) throw error
            setPendingDancers((prev) => prev.filter((d) => d.id !== dancerId))
        } catch (err) {
            console.error('Approve error:', err)
            alert('승인에 실패했습니다.')
        } finally {
            setProcessing(null)
        }
    }

    if (!isAdmin) return null

    return (
        <div className="w-full space-y-6">
            <AdminPageHeader title="프로필 승인" description="공개 승인 대기 중인 댄서 프로필입니다." />
            {loading ? (
                <div className="text-center py-16 text-white/40">로딩 중...</div>
            ) : pendingDancers.length === 0 ? (
                <div className="text-center py-16">
                    <CheckCircle className="w-12 h-12 text-green-400/30 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">승인 대기 중인 프로필이 없습니다</p>
                </div>
            ) : (
                pendingDancers.map((dancer) => (
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
                            <Link href={`/profile/${dancer.id}`} className="p-2 bg-neutral-800 rounded-lg text-white/40 hover:text-white">
                                <Eye className="w-4 h-4" />
                            </Link>
                        </div>
                        {dancer.genres && dancer.genres.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                                {dancer.genres.slice(0, 5).map((g) => (
                                    <span key={g} className="text-[10px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded">
                                        {g}
                                    </span>
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
            )}
        </div>
    )
}
