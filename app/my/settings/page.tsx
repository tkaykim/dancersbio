'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User as UserIcon, Mail, Bell, Shield, FileText, Info, LogOut, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
    const { user, loading: authLoading, signOut } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin')
        }
    }, [user, authLoading, router])

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
                <section className="space-y-3">
                    <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider px-1">알림</h2>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-800/50">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-white/60" />
                                <span className="text-white text-sm">새 제안 알림</span>
                            </div>
                            <div className="w-10 h-6 bg-primary rounded-full flex items-center justify-end px-0.5 cursor-pointer">
                                <div className="w-5 h-5 bg-white rounded-full" />
                            </div>
                        </div>
                        <div className="px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-white/60" />
                                <span className="text-white text-sm">제안 상태 변경 알림</span>
                            </div>
                            <div className="w-10 h-6 bg-primary rounded-full flex items-center justify-end px-0.5 cursor-pointer">
                                <div className="w-5 h-5 bg-white rounded-full" />
                            </div>
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
