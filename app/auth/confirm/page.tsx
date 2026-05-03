'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

function StatusShell({ icon, title, message, hint }: { icon: React.ReactNode; title: string; message?: string; hint?: string }) {
    return (
        <div className="w-full max-w-md text-center">
            <div className="mb-4 flex items-center justify-center">{icon}</div>
            <h1
                style={{
                    fontSize: 26,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: 'var(--cue-ink)',
                }}
            >
                {title}
            </h1>
            {message && (
                <p style={{ fontSize: 14, color: 'var(--cue-ink-2)', marginTop: 12 }}>{message}</p>
            )}
            {hint && (
                <p
                    style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: 'var(--cue-ink-3)',
                        marginTop: 16,
                    }}
                >
                    {hint}
                </p>
            )}
        </div>
    )
}

function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (error) {
            setStatus('error')
            setMessage(errorDescription || '이메일 인증에 실패했습니다.')
            setTimeout(() => router.push('/auth/signin'), 3000)
        } else {
            setStatus('success')
            setMessage('이메일 인증이 완료되었습니다!')
            setTimeout(() => router.push('/my'), 2000)
        }
    }, [searchParams, router])

    return (
        <div
            className="min-h-screen flex items-center justify-center px-6"
            style={{ background: 'var(--cue-bg)', color: 'var(--cue-ink)' }}
        >
            {status === 'loading' && (
                <StatusShell
                    icon={<Loader2 className="w-12 h-12 animate-spin" style={{ color: 'var(--cue-accent)' }} />}
                    title="처리 중"
                    message="잠시만 기다려주세요"
                />
            )}
            {status === 'success' && (
                <StatusShell
                    icon={<CheckCircle2 className="w-12 h-12" style={{ color: 'var(--cue-ok)' }} />}
                    title="인증 완료"
                    message={message}
                    hint="마이페이지로 이동합니다…"
                />
            )}
            {status === 'error' && (
                <StatusShell
                    icon={<XCircle className="w-12 h-12" style={{ color: 'var(--cue-bad)' }} />}
                    title="인증 실패"
                    message={message}
                    hint="로그인 화면으로 이동합니다…"
                />
            )}
        </div>
    )
}

export default function AuthCallbackPage() {
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
            <AuthCallbackContent />
        </Suspense>
    )
}
