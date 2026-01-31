'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

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
        <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">회원가입</h1>
                    <p className="text-white/60">댄서스바이오와 함께 시작하세요</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                            이름
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                            placeholder="홍길동"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                            이메일
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                            비밀번호
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                            placeholder="최소 6자"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
                            비밀번호 확인
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                            placeholder="비밀번호 재입력"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? '가입 중...' : '회원가입'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-white/60 text-sm">
                        이미 계정이 있으신가요?{' '}
                        <Link href="/auth/signin" className="text-primary hover:underline">
                            로그인
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
