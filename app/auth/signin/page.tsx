'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

const inputStyle: React.CSSProperties = {
    background: 'var(--cue-surface)',
    border: '1px solid var(--cue-hairline)',
    color: 'var(--cue-ink)',
}

const labelStyle: React.CSSProperties = {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'var(--cue-ink-3)',
    fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
}

function SignInContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectTo = searchParams.get('redirect') || '/my'
    const { signIn } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await signIn(email, password)
            router.push(redirectTo)
        } catch (err: any) {
            setError(err.message || '로그인에 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center px-6"
            style={{ background: 'var(--cue-bg)', color: 'var(--cue-ink)' }}
        >
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <div
                        style={{
                            fontSize: 11,
                            letterSpacing: 1.4,
                            textTransform: 'uppercase',
                            color: 'var(--cue-ink-3)',
                            fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                            marginBottom: 8,
                        }}
                    >
                        DANCERS.BIO · SIGN IN
                    </div>
                    <h1
                        style={{
                            fontFamily: 'var(--font-cue-serif), serif',
                            fontStyle: 'italic',
                            fontSize: 40,
                            lineHeight: 1.05,
                            letterSpacing: -0.8,
                            color: 'var(--cue-ink)',
                        }}
                    >
                        Welcome back<span style={{ color: 'var(--cue-accent)' }}>.</span>
                    </h1>
                    <p style={{ fontSize: 13, color: 'var(--cue-ink-3)', marginTop: 8 }}>
                        댄서스바이오에 오신 것을 환영합니다
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div
                            className="rounded-lg p-3 text-sm"
                            style={{
                                background: 'color-mix(in srgb, var(--cue-bad) 12%, transparent)',
                                border: '1px solid color-mix(in srgb, var(--cue-bad) 50%, transparent)',
                                color: 'var(--cue-bad)',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block mb-2" style={labelStyle}>
                            EMAIL
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg focus:outline-none"
                            style={inputStyle}
                            placeholder="your@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block mb-2" style={labelStyle}>
                            PASSWORD
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg focus:outline-none"
                            style={inputStyle}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-full font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: 'var(--cue-accent)',
                            color: 'var(--cue-accent-ink)',
                            fontSize: 13,
                            letterSpacing: 0.4,
                            marginTop: 8,
                        }}
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p style={{ fontSize: 13, color: 'var(--cue-ink-3)' }}>
                        계정이 없으신가요?{' '}
                        <Link href="/auth/signup" style={{ color: 'var(--cue-accent)' }} className="hover:underline">
                            회원가입
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function SignInPage() {
    return (
        <Suspense
            fallback={
                <div
                    className="min-h-screen flex items-center justify-center"
                    style={{ background: 'var(--cue-bg)', color: 'var(--cue-ink-3)' }}
                >
                    로딩 중...
                </div>
            }
        >
            <SignInContent />
        </Suspense>
    )
}
