'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, ShieldCheck, Loader2, User as UserIcon, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

type RequestMode = 'claim' | 'manager'

interface DancerInfo {
    id: string
    stage_name: string
    korean_name: string | null
    profile_img: string | null
    specialties: string[] | null
    genres: string[] | null
    location: string | null
    owner_id: string | null
    manager_id: string | null
}

function ClaimContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, loading: authLoading } = useAuth()

    const dancerId = searchParams.get('id')
    const modeParam = searchParams.get('mode') as RequestMode | null

    const [dancer, setDancer] = useState<DancerInfo | null>(null)
    const [requestMode, setRequestMode] = useState<RequestMode>(modeParam || 'claim')
    const [note, setNote] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [step, setStep] = useState<'confirm' | 'success' | 'error' | 'already_claimed' | 'already_requested' | 'already_owned'>('confirm')
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        if (!authLoading && !user) {
            router.push(`/auth/signin?redirect=/onboarding/claim?id=${dancerId}`)
            return
        }

        if (dancerId && user) {
            fetchDancer()
        } else if (!dancerId) {
            setLoading(false)
            setErrorMsg('프로필 ID가 제공되지 않았습니다.')
            setStep('error')
        }
    }, [dancerId, user, authLoading])

    const fetchDancer = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('dancers')
                .select('id, stage_name, korean_name, profile_img, specialties, genres, location, owner_id, manager_id')
                .eq('id', dancerId!)
                .single()

            if (error || !data) {
                setErrorMsg('해당 프로필을 찾을 수 없습니다.')
                setStep('error')
                return
            }

            setDancer(data)

            if (modeParam === 'manager') {
                setRequestMode('manager')
                if (data.manager_id === user!.id) {
                    setErrorMsg('이미 이 프로필의 매니저입니다.')
                    setStep('already_claimed')
                    return
                }
            } else {
                if (data.owner_id === user!.id) {
                    setErrorMsg('이미 본인의 프로필입니다.')
                    setStep('already_claimed')
                    return
                }
                // 소유권 요청(claim): 계정당 내 프로필 1개만 허용
                const { data: existingOwned } = await supabase
                    .from('dancers')
                    .select('id')
                    .eq('owner_id', user!.id)
                    .limit(1)
                    .maybeSingle()
                if (existingOwned) {
                    setStep('already_owned')
                    return
                }
            }

            const { data: existing } = await supabase
                .from('profile_requests')
                .select('id')
                .eq('dancer_id', dancerId!)
                .eq('requester_id', user!.id)
                .eq('type', modeParam || 'claim')
                .eq('status', 'pending')
                .maybeSingle()

            if (existing) {
                setStep('already_requested')
                return
            }
        } catch {
            setErrorMsg('프로필 정보를 불러오는 중 오류가 발생했습니다.')
            setStep('error')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitRequest = async () => {
        if (!user || !dancer) return

        setSubmitting(true)
        try {
            const { error } = await supabase
                .from('profile_requests')
                .insert({
                    dancer_id: dancer.id,
                    requester_id: user.id,
                    type: requestMode,
                    status: 'pending',
                    note: note.trim() || null,
                })

            if (error) throw error

            setStep('success')
        } catch (err: any) {
            setErrorMsg('요청 제출에 실패했습니다: ' + (err.message || '알 수 없는 오류'))
            setStep('error')
        } finally {
            setSubmitting(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    const isClaim = requestMode === 'claim'

    return (
        <div className="min-h-screen bg-background text-white">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-10">
                <div className="px-6 py-4 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-1">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <h1 className="text-xl font-bold">
                        {isClaim ? '프로필 소유권 요청' : '매니저 권한 요청'}
                    </h1>
                </div>
            </div>

            <div className="p-6 flex flex-col items-center">
                {/* Step: Confirm */}
                {step === 'confirm' && dancer && (
                    <div className="w-full max-w-md space-y-6 animate-in fade-in">
                        <div className="text-center mb-2">
                            <p className="text-white/60 text-sm">
                                {isClaim
                                    ? '이 프로필이 본인의 프로필이라면 소유권을 요청할 수 있습니다.'
                                    : '이 프로필의 매니저 권한을 요청할 수 있습니다.'
                                }
                            </p>
                        </div>

                        {/* Dancer Card */}
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center">
                            <div className="w-24 h-24 bg-neutral-800 rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center">
                                {dancer.profile_img ? (
                                    <img src={dancer.profile_img} alt={dancer.stage_name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-10 h-10 text-white/20" />
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1">{dancer.stage_name}</h2>
                            {dancer.korean_name && (
                                <p className="text-white/50 text-sm mb-2">{dancer.korean_name}</p>
                            )}
                            {dancer.location && (
                                <p className="text-white/40 text-xs mb-3">{dancer.location}</p>
                            )}
                            {dancer.genres && dancer.genres.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-1">
                                    {dancer.genres.slice(0, 4).map(g => (
                                        <span key={g} className="text-[10px] bg-white/5 text-white/50 px-2 py-0.5 rounded">{g}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Notice */}
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-white/70 space-y-2">
                            <p className="font-semibold text-primary text-sm">
                                {isClaim ? '소유권 획득 시' : '매니저 등록 시'}
                            </p>
                            <ul className="space-y-1 text-xs text-white/50 list-disc list-inside">
                                {isClaim ? (
                                    <>
                                        <li>이 프로필의 소유자로 등록됩니다</li>
                                        <li>프로필 정보를 직접 편집할 수 있습니다</li>
                                        <li>이 프로필로 받은 제안을 확인하고 관리할 수 있습니다</li>
                                    </>
                                ) : (
                                    <>
                                        <li>이 프로필의 매니저로 등록됩니다</li>
                                        <li>프로필 정보 편집 및 제안 관리 권한을 부여받습니다</li>
                                        <li>소유자와 함께 프로필을 관리할 수 있습니다</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        {/* Note Input */}
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">
                                요청 사유 (선택)
                            </label>
                            <textarea
                                rows={3}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder={isClaim ? '본인임을 증명할 수 있는 정보를 입력하세요...' : '매니저 권한이 필요한 사유를 입력하세요...'}
                                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary resize-none"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmitRequest}
                            disabled={submitting}
                            className="w-full py-4 bg-primary text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition disabled:opacity-50"
                        >
                            {submitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <ShieldCheck className="w-5 h-5" />
                                    {isClaim ? '소유권 요청 제출' : '매니저 권한 요청 제출'}
                                </>
                            )}
                        </button>

                        <p className="text-center text-white/30 text-[11px]">
                            요청은 관리자 검토 후 승인/거절됩니다.
                        </p>
                    </div>
                )}

                {/* Step: Success */}
                {step === 'success' && (
                    <div className="w-full max-w-md text-center py-16 animate-in fade-in zoom-in-95">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">요청 완료!</h2>
                        <p className="text-white/60 mb-8 text-sm">
                            {isClaim ? '소유권' : '매니저 권한'} 요청이 제출되었습니다.<br />
                            관리자 승인 후 권한이 부여됩니다.
                        </p>
                        <Link
                            href="/my"
                            className="block w-full py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition"
                        >
                            마이페이지로 이동
                        </Link>
                    </div>
                )}

                {/* Step: Already Requested */}
                {step === 'already_requested' && (
                    <div className="w-full max-w-md text-center py-16 animate-in fade-in">
                        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-yellow-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">이미 요청됨</h2>
                        <p className="text-white/60 mb-8 text-sm">
                            이 프로필에 대한 {isClaim ? '소유권' : '매니저 권한'} 요청이 이미 접수되어 있습니다.<br />
                            관리자 검토를 기다려 주세요.
                        </p>
                        <Link
                            href="/my"
                            className="block w-full py-3 bg-neutral-800 text-white font-medium rounded-xl hover:bg-neutral-700 transition"
                        >
                            마이페이지로 이동
                        </Link>
                    </div>
                )}

                {/* Step: Already Claimed */}
                {step === 'already_claimed' && (
                    <div className="w-full max-w-md text-center py-16 animate-in fade-in">
                        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-yellow-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">요청 불필요</h2>
                        <p className="text-white/60 mb-8 text-sm">{errorMsg}</p>
                        <Link
                            href="/my"
                            className="block w-full py-3 bg-neutral-800 text-white font-medium rounded-xl hover:bg-neutral-700 transition"
                        >
                            마이페이지로 이동
                        </Link>
                    </div>
                )}

                {/* Step: Already Owned (내 프로필 1개 제한) */}
                {step === 'already_owned' && (
                    <div className="w-full max-w-md text-center py-16 animate-in fade-in">
                        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-amber-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">내 프로필은 1개만 보유할 수 있습니다</h2>
                        <p className="text-white/60 mb-6 text-sm">
                            이미 소유한 댄서 프로필이 있습니다. 추가로 소유권을 요청할 수 없습니다.<br />
                            다른 댄서 프로필은 <strong className="text-white">매니저 권한 요청</strong>으로 관리할 수 있습니다.
                        </p>
                        <Link
                            href="/my/profiles"
                            className="block w-full py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition mb-3"
                        >
                            내 프로필로 이동
                        </Link>
                        <Link
                            href="/onboarding"
                            className="block w-full py-3 bg-neutral-800 text-white font-medium rounded-xl hover:bg-neutral-700 transition"
                        >
                            매니저 권한 요청하기
                        </Link>
                    </div>
                )}

                {/* Step: Error */}
                {step === 'error' && (
                    <div className="w-full max-w-md text-center py-16 animate-in fade-in">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">오류 발생</h2>
                        <p className="text-white/60 mb-8 text-sm">{errorMsg}</p>
                        <button
                            onClick={() => router.back()}
                            className="block w-full py-3 bg-neutral-800 text-white font-medium rounded-xl hover:bg-neutral-700 transition"
                        >
                            돌아가기
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ClaimPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        }>
            <ClaimContent />
        </Suspense>
    )
}
