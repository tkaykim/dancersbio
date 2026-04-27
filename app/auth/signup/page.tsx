'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
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

export default function SignUpPage() {
    const router = useRouter()
    const { signUp } = useAuth()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.')
            return
        }

        if (password.length < 6) {
            setError('비밀번호는 최소 6자 이상이어야 합니다.')
            return
        }

        setLoading(true)

        try {
            await signUp(email, password, name)
            alert('회원가입이 완료되었습니다! 이메일을 확인해주세요.')
            router.push('/auth/signin')
        } catch (err: any) {
            setError(err.message || '회원가입에 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center px-6 py-12"
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
                        지금 시작하세요
                    </h1>
                    <p style={{ fontSize: 13, color: 'var(--cue-ink-3)', marginTop: 8 }}>
                        댄서스바이오와 함께 시작하세요
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
                        <label htmlFor="name" className="block mb-2" style={labelStyle}>
                            이름
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg focus:outline-none"
                            style={inputStyle}
                            placeholder="홍길동"
                        />
                    </div>

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
                        <label htmlFor="password" className="block mb-2" style={labelStyle}>
                            비밀번호
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg focus:outline-none"
                            style={inputStyle}
                            placeholder="최소 6자"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block mb-2" style={labelStyle}>
                            비밀번호 확인
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg focus:outline-none"
                            style={inputStyle}
                            placeholder="비밀번호 재입력"
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
                        {loading ? '가입 중...' : '회원가입'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p style={{ fontSize: 13, color: 'var(--cue-ink-3)' }}>
                        이미 계정이 있으신가요?{' '}
                        <Link href="/auth/signin" style={{ color: 'var(--cue-accent)' }} className="hover:underline">
                            로그인
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
