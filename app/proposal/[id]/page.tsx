'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'

export default function ProposalRedirectPage() {
    const { id: dancerId } = useParams<{ id: string }>()
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (loading) return

        if (!user) {
            router.push(`/auth/signin?redirect=/proposal/${dancerId}`)
            return
        }

        router.replace(`/my/proposals/new?dancer_id=${dancerId}`)
    }, [user, loading, dancerId, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
    )
}
