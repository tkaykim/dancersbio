'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

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
                    router.replace('/my')
                })
                .catch(() => {
                    setStatus('error')
                    setTimeout(() => router.replace('/auth/signin'), 2000)
                })
        } else {
            router.replace('/my')
        }
    }, [searchParams, router])

    return (
        <div
            className="min-h-screen flex items-center justify-center px-6"
            style={{ background: 'var(--cue-bg)', color: 'var(--cue-ink)' }}
        >
            <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: 'var(--cue-accent)' }} />
                <h1
                    style={{
                        fontFamily: 'var(--font-cue-serif), serif',
                        fontStyle: 'italic',
                        fontSize: 24,
                        letterSpacing: -0.4,
                        color: 'var(--cue-ink)',
                    }}
                >
                    Signing you in<span style={{ color: 'var(--cue-accent)' }}>.</span>
                </h1>
                <p style={{ fontSize: 13, color: 'var(--cue-ink-3)', marginTop: 8 }}>
                    {status === 'error' ? '로그인에 실패했습니다. 로그인 페이지로 이동합니다.' : '잠시만 기다려주세요'}
                </p>
            </div>
        </div>
    )
}

export default function OAuthCallbackPage() {
    return (
        <Suspense
            fallback={
                <div
                    className="min-h-screen flex items-center justify-center"
                    style={{ background: 'var(--cue-bg)' }}
                >
                    <Loader2 className="w-12 h-12 animate-spin" style={{ color: 'var(--cue-accent)' }} />
                </div>
            }
        >
            <OAuthCallbackContent />
        </Suspense>
    )
}
