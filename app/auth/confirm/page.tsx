'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

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
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
            <div className="w-full max-w-md text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
                        <h1 className="text-2xl font-bold text-white mb-2">처리 중...</h1>
                        <p className="text-white/60">잠시만 기다려주세요</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-white mb-2">인증 완료!</h1>
                        <p className="text-white/60 mb-6">{message}</p>
                        <p className="text-white/40 text-sm">마이페이지로 이동 중...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-white mb-2">인증 실패</h1>
                        <p className="text-white/60 mb-6">{message}</p>
                        <p className="text-white/40 text-sm">로그인 페이지로 이동 중...</p>
                    </>
                )}
            </div>
        </div>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background px-6">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    )
}
