'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const inputStyle: React.CSSProperties = {
    background: 'var(--cue-surface)',
    border: '1px solid var(--cue-hairline)',
    color: 'var(--cue-ink)',
}

const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--cue-ink-2)',
}

function SignInContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectTo = searchParams.get('redirect') || '/my'
    const { signIn } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [info, setInfo] = useState('')
    const [loading, setLoading] = useState(false)
    const [oauthLoading, setOauthLoading] = useState<'google' | 'kakao' | null>(null)
    const [resetLoading, setResetLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setInfo('')
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

    const handleOAuth = async (provider: 'google' | 'kakao') => {
        setError('')
        setInfo('')
        setOauthLoading(provider)
        try {
            const origin =
                typeof window !== 'undefined' ? window.location.origin : ''
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${origin}/auth/oauth-callback`,
                },
            })
            if (oauthError) throw oauthError
        } catch (err: any) {
            setError(err.message || '소셜 로그인에 실패했습니다.')
            setOauthLoading(null)
        }
    }

    const handlePasswordReset = async () => {
        setError('')
        setInfo('')
        if (!email) {
            setError('비밀번호 재설정 링크를 보낼 이메일을 먼저 입력해주세요.')
            return
        }
        setResetLoading(true)
        try {
            const origin =
                typeof window !== 'undefined' ? window.location.origin : ''
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${origin}/auth/confirm`,
            })
            if (resetError) throw resetError
            setInfo(`${email} 으로 비밀번호 재설정 링크를 보냈습니다.`)
        } catch (err: any) {
            setError(err.message || '비밀번호 재설정 링크 전송에 실패했습니다.')
        } finally {
            setResetLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center px-6"
            style={{ background: 'var(--cue-bg)', color: 'var(--cue-ink)' }}
        >
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <h1
                        style={{
                            fontSize: 32,
                            fontWeight: 700,
                            lineHeight: 1.1,
                            letterSpacing: '-0.03em',
                            color: 'var(--cue-ink)',
                        }}
                    >
                        다시 오신 걸 환영해요
                    </h1>
                    <p style={{ fontSize: 13, color: 'var(--cue-ink-3)', marginTop: 8 }}>
                        댄서스바이오에 오신 것을 환영합니다
                    </p>
                </div>

                <div className="space-y-3 mb-6">
                    <button
                        type="button"
                        onClick={() => handleOAuth('google')}
                        disabled={oauthLoading !== null}
                        className="w-full py-3 rounded-full font-semibold flex items-center justify-center gap-3 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: '#fff',
                            color: '#1f1f1f',
                            fontSize: 13,
                            letterSpacing: 0.4,
                            border: '1px solid var(--cue-hairline)',
                        }}
                    >
                        <GoogleLogo />
                        {oauthLoading === 'google' ? 'Google로 이동 중...' : 'Google로 계속하기'}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleOAuth('kakao')}
                        disabled={oauthLoading !== null}
                        className="w-full py-3 rounded-full font-semibold flex items-center justify-center gap-3 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: '#FEE500',
                            color: '#191919',
                            fontSize: 13,
                            letterSpacing: 0.4,
                            border: 'none',
                        }}
                    >
                        <KakaoLogo />
                        {oauthLoading === 'kakao' ? '카카오로 이동 중...' : '카카오로 계속하기'}
                    </button>
                </div>

                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px" style={{ background: 'var(--cue-hairline)' }} />
                    <span
                        style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: 'var(--cue-ink-3)',
                        }}
                    >
                        또는
                    </span>
                    <div className="flex-1 h-px" style={{ background: 'var(--cue-hairline)' }} />
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
                    {info && (
                        <div
                            className="rounded-lg p-3 text-sm"
                            style={{
                                background: 'color-mix(in srgb, var(--cue-accent) 12%, transparent)',
                                border: '1px solid color-mix(in srgb, var(--cue-accent) 50%, transparent)',
                                color: 'var(--cue-accent)',
                            }}
                        >
                            {info}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block mb-2" style={labelStyle}>
                            이메일
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
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="password" style={labelStyle}>
                                비밀번호
                            </label>
                            <button
                                type="button"
                                onClick={handlePasswordReset}
                                disabled={resetLoading}
                                style={{
                                    fontSize: 11,
                                    color: 'var(--cue-accent)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    textDecoration: 'underline',
                                }}
                            >
                                {resetLoading ? '전송 중...' : '비밀번호 찾기'}
                            </button>
                        </div>
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

function GoogleLogo() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
            />
            <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                fill="#34A853"
            />
            <path
                d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
            />
            <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
            />
        </svg>
    )
}

function KakaoLogo() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 3C6.48 3 2 6.58 2 11c0 2.86 1.88 5.36 4.7 6.78l-1.2 4.4c-.1.36.3.66.62.46l5.28-3.48c.2.02.4.02.6.02 5.52 0 10-3.58 10-8s-4.48-8-10-8z"
                fill="#191919"
            />
        </svg>
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
