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
                    fontFamily: 'var(--font-cue-serif), serif',
                    fontStyle: 'italic',
                    fontSize: 28,
                    letterSpacing: -0.6,
                    color: 'var(--cue-ink)',
                }}
            >
                {title}<span style={{ color: 'var(--cue-accent)' }}>.</span>
            </h1>
            {message && (
                <p style={{ fontSize: 14, color: 'var(--cue-ink-2)', marginTop: 12 }}>{message}</p>
            )}
            {hint && (
                <p
                    style={{
                        fontSize: 11,
                        color: 'var(--cue-ink-3)',
                        marginTop: 16,
                        fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                        letterSpacing: 0.4,
                        textTransform: 'uppercase',
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
                    title="Processing"
                    message="잠시만 기다려주세요"
                />
            )}
            {status === 'success' && (
                <StatusShell
                    icon={<CheckCircle2 className="w-12 h-12" style={{ color: 'var(--cue-ok)' }} />}
                    title="Verified"
                    message={message}
                    hint="REDIRECTING TO MY PAGE…"
                />
            )}
            {status === 'error' && (
                <StatusShell
                    icon={<XCircle className="w-12 h-12" style={{ color: 'var(--cue-bad)' }} />}
                    title="Failed"
                    message={message}
                    hint="REDIRECTING TO SIGN IN…"
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
