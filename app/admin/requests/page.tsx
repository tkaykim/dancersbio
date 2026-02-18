'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle, XCircle, User as UserIcon } from 'lucide-react'
import { getRelativeTime } from '@/lib/utils'
import type { ProfileRequest } from '@/lib/types'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export default function AdminRequestsPage() {
    const { isAdmin, user } = useAdmin()
    const [requests, setRequests] = useState<ProfileRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await supabase
                .from('profile_requests')
                .select('*, dancers(id, stage_name, profile_img), requester:users!requester_id(name, email)')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
            setRequests((data as ProfileRequest[]) || [])
        } catch (err) {
            console.error('Admin fetch error:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (isAdmin) fetchData()
    }, [isAdmin, fetchData])

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
                const { error: dancerError } = await supabase.from('dancers').update({ [updateField]: request.requester_id }).eq('id', request.dancer_id)
                if (dancerError) throw dancerError
            }
            setRequests((prev) => prev.filter((r) => r.id !== request.id))
        } catch (err) {
            console.error('Handle request error:', err)
            alert('처리에 실패했습니다.')
        } finally {
            setProcessing(null)
        }
    }

    if (!isAdmin) return null

    return (
        <div className="w-full space-y-6">
            <AdminPageHeader title="권한 요청" description="프로필 소유권·매니저 권한 요청을 처리합니다." />
            {loading ? (
                <div className="text-center py-16 text-white/40">로딩 중...</div>
            ) : requests.length === 0 ? (
                <div className="text-center py-16">
                    <CheckCircle className="w-12 h-12 text-green-400/30 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">처리 대기 중인 요청이 없습니다</p>
                </div>
            ) : (
                requests.map((req) => (
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
                                    <span
                                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                            req.type === 'claim' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-400'
                                        }`}
                                    >
                                        {req.type === 'claim' ? '소유권 요청' : '매니저 요청'}
                                    </span>
                                </div>
                                <h3 className="text-white font-bold text-sm truncate">{req.dancers?.stage_name}</h3>
                                <p className="text-xs text-white/40 truncate">
                                    요청자: {req.requester?.name || '알 수 없음'} ({req.requester?.email})
                                </p>
                                {req.note && <p className="text-[11px] text-white/30 mt-1">&quot;{req.note}&quot;</p>}
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
            )}
        </div>
    )
}
