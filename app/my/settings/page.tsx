'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User as UserIcon, Mail, Bell, Shield, FileText, Info, LogOut, Loader2, Smartphone, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Capacitor } from '@capacitor/core'
import { isPushSupported, requestPushPermission, getFCMToken } from '@/lib/push-notifications'

const NOTIFY_NEW_PROPOSAL_KEY = 'dancersbio_notify_new_proposal'
const NOTIFY_PROPOSAL_STATUS_KEY = 'dancersbio_notify_proposal_status'

export default function SettingsPage() {
    const { user, loading: authLoading, signOut } = useAuth()
    const router = useRouter()
    const [myTokens, setMyTokens] = useState<{ platform: string; updated_at: string }[]>([])
    const [registering, setRegistering] = useState(false)
    const [registerStatus, setRegisterStatus] = useState<string | null>(null)
    const [notifyNewProposal, setNotifyNewProposal] = useState(true)
    const [notifyProposalStatus, setNotifyProposalStatus] = useState(true)
    const isNativeApp = typeof window !== 'undefined' && Capacitor.isNativePlatform()

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (typeof window === 'undefined') return
        try {
            setNotifyNewProposal(localStorage.getItem(NOTIFY_NEW_PROPOSAL_KEY) !== 'false')
            setNotifyProposalStatus(localStorage.getItem(NOTIFY_PROPOSAL_STATUS_KEY) !== 'false')
        } catch (_) {}
    }, [])

    useEffect(() => {
        if (typeof window === 'undefined') return
        if (window.location.hash !== '#notification') return
        const t = setTimeout(() => {
            const el = document.getElementById('notification')
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 150)
        return () => clearTimeout(t)
    }, [user])

    useEffect(() => {
        if (!user?.id) return
        supabase.from('push_tokens').select('platform, updated_at').eq('user_id', user.id).then(({ data }) => {
            setMyTokens(data ?? [])
        })
    }, [user?.id])

    const registerThisDevice = async () => {
        if (!user?.id) return
        setRegistering(true)
        setRegisterStatus(null)
        try {
            if (!Capacitor.isNativePlatform()) {
                setRegisterStatus('앱에서만 등록할 수 있습니다. Android/iOS 앱을 열어주세요.')
                return
            }
            const supported = await isPushSupported()
            if (!supported) {
                setRegisterStatus('이 기기에서는 푸시를 지원하지 않습니다.')
                return
            }
            const granted = await requestPushPermission()
            if (!granted) {
                setRegisterStatus('알림 권한이 필요합니다. 설정 → 앱 → 알림에서 허용 후 다시 시도해 주세요.')
                return
            }
            const token = await getFCMToken()
            if (!token) {
                setRegisterStatus('토큰을 받지 못했습니다. 잠시 후 다시 시도하거나 앱을 재시작해 주세요.')
                return
            }
            const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : Capacitor.getPlatform() === 'android' ? 'android' : 'web'
            const { error } = await supabase.from('push_tokens').upsert(
                { user_id: user.id, token, platform, updated_at: new Date().toISOString() },
                { onConflict: 'user_id,platform' }
            )
            if (error) {
                setRegisterStatus(`저장 실패: ${error.message}`)
                return
            }
            setRegisterStatus('등록 완료되었습니다.')
            const { data } = await supabase.from('push_tokens').select('platform, updated_at').eq('user_id', user.id)
            setMyTokens(data ?? [])
            } catch (e) {
            setRegisterStatus(e instanceof Error ? e.message : '오류가 발생했습니다.')
        } finally {
            setRegistering(false)
        }
    }

    const toggleNotifyNewProposal = () => {
        const next = !notifyNewProposal
        setNotifyNewProposal(next)
        try { localStorage.setItem(NOTIFY_NEW_PROPOSAL_KEY, String(next)) } catch (_) {}
    }
    const toggleNotifyProposalStatus = () => {
        const next = !notifyProposalStatus
        setNotifyProposalStatus(next)
        try { localStorage.setItem(NOTIFY_PROPOSAL_STATUS_KEY, String(next)) } catch (_) {}
    }

    const handleSignOut = async () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            await signOut()
            router.push('/')
        }
    }

    if (authLoading) {
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
                    <h1 className="text-xl font-bold text-white">설정</h1>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Account Section */}
                <section className="space-y-3">
                    <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider px-1">계정 정보</h2>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-neutral-800/50">
                            <div className="flex items-center gap-3">
                                <UserIcon className="w-5 h-5 text-white/60" />
                                <div>
                                    <p className="text-white/40 text-xs">이름</p>
                                    <p className="text-white font-medium text-sm">{user.user_metadata?.name || '사용자'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-5 py-4 border-b border-neutral-800/50">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-white/60" />
                                <div>
                                    <p className="text-white/40 text-xs">이메일</p>
                                    <p className="text-white font-medium text-sm">{user.email}</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-5 py-4">
                            <div className="flex items-center gap-3">
                                <Info className="w-5 h-5 text-white/60" />
                                <div>
                                    <p className="text-white/40 text-xs">가입일</p>
                                    <p className="text-white font-medium text-sm">{new Date(user.created_at).toLocaleDateString('ko-KR')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Notification Section */}
                <section id="notification" className="space-y-3 scroll-mt-4">
                    <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider px-1">알림</h2>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                        <button type="button" onClick={toggleNotifyNewProposal} className="w-full px-5 py-4 flex items-center justify-between border-b border-neutral-800/50 hover:bg-neutral-800/50 active:bg-neutral-800 transition text-left">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-white/60" />
                                <span className="text-white text-sm">새 제안 알림</span>
                            </div>
                            <div className={`w-10 h-6 rounded-full flex items-center px-0.5 cursor-pointer touch-manipulation transition-colors ${notifyNewProposal ? 'bg-primary justify-end' : 'bg-neutral-700 justify-start'}`}>
                                <div className="w-5 h-5 bg-white rounded-full" />
                            </div>
                        </button>
                        <button type="button" onClick={toggleNotifyProposalStatus} className="w-full px-5 py-4 flex items-center justify-between border-b border-neutral-800/50 hover:bg-neutral-800/50 active:bg-neutral-800 transition text-left">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-white/60" />
                                <span className="text-white text-sm">제안 상태 변경 알림</span>
                            </div>
                            <div className={`w-10 h-6 rounded-full flex items-center px-0.5 cursor-pointer touch-manipulation transition-colors ${notifyProposalStatus ? 'bg-primary justify-end' : 'bg-neutral-700 justify-start'}`}>
                                <div className="w-5 h-5 bg-white rounded-full" />
                            </div>
                        </button>
                        {/* 푸시 알림 (이 기기 등록) */}
                        <div className="px-5 py-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <Smartphone className="w-5 h-5 text-white/60" />
                                <span className="text-white text-sm">푸시 알림 수신 기기</span>
                            </div>
                            {myTokens.length > 0 && (
                                <ul className="text-white/70 text-xs space-y-1 pl-8">
                                    {myTokens.map((t, i) => (
                                        <li key={i} className="capitalize">
                                            {t.platform} · {t.updated_at ? new Date(t.updated_at).toLocaleString('ko') : '-'}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {isNativeApp ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={registerThisDevice}
                                        disabled={registering}
                                        className="w-full py-2.5 bg-primary/20 text-primary border border-primary/50 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                        {registering ? '등록 중...' : '지금 이 기기 등록'}
                                    </button>
                                    {registerStatus && (
                                        <p className={`text-xs pl-8 ${registerStatus.startsWith('등록 완료') ? 'text-primary' : 'text-amber-400'}`}>
                                            {registerStatus}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="text-white/40 text-xs pl-8">푸시 등록은 Android/iOS 앱에서만 가능합니다.</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Legal Section */}
                <section className="space-y-3">
                    <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider px-1">정보</h2>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                        <button className="w-full px-5 py-4 flex items-center gap-3 border-b border-neutral-800/50 hover:bg-neutral-800/50 transition text-left">
                            <FileText className="w-5 h-5 text-white/60" />
                            <span className="text-white text-sm">서비스 이용약관</span>
                        </button>
                        <button className="w-full px-5 py-4 flex items-center gap-3 border-b border-neutral-800/50 hover:bg-neutral-800/50 transition text-left">
                            <Shield className="w-5 h-5 text-white/60" />
                            <span className="text-white text-sm">개인정보 처리방침</span>
                        </button>
                        <div className="px-5 py-4 flex items-center gap-3">
                            <Info className="w-5 h-5 text-white/60" />
                            <span className="text-white text-sm">앱 버전</span>
                            <span className="text-white/40 text-sm ml-auto">v2.2.0</span>
                        </div>
                    </div>
                </section>

                {/* Sign Out */}
                <button
                    onClick={handleSignOut}
                    className="w-full py-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    로그아웃
                </button>

                {/* Danger Zone */}
                <div className="pt-4">
                    <button className="text-white/20 text-xs hover:text-red-500/50 transition-colors">
                        회원 탈퇴
                    </button>
                </div>
            </div>
        </div>
    )
}
