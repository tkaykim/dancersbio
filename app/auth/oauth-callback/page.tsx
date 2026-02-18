'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

/** OAuth 콜백: Supabase 인증 Redirect URL을 /auth/oauth-callback 로 설정하세요. */

function OAuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')

    useEffect(() => {
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
            setStatus('error')
            setTimeout(() => router.replace('/auth/signin'), 2000)
            return
        }

        if (code) {
            supabase.auth.exchangeCodeForSession(code)
                .then(() => {
                    setStatus('done')
                    router.replace('/dashboard')
                })
                .catch(() => {
                    setStatus('error')
                    setTimeout(() => router.replace('/auth/signin'), 2000)
                })
        } else {
            router.replace('/dashboard')
        }
    }, [searchParams, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
            <div className="text-center">
                <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
                <h1 className="text-xl font-bold text-white">로그인 처리 중...</h1>
                <p className="text-white/60 mt-2">
                    {status === 'error' ? '로그인에 실패했습니다. 로그인 페이지로 이동합니다.' : '잠시만 기다려주세요'}
                </p>
            </div>
        </div>
    )
}

export default function OAuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background px-6">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
        }>
            <OAuthCallbackContent />
        </Suspense>
    )
}
