'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function EditDispatcher() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/auth/signin')
                return
            }

            checkProfiles()
        }
    }, [user, loading])

    const checkProfiles = async () => {
        const { data } = await supabase
            .from('dancers')
            .select('id')
            .eq('owner_id', user!.id)

        if (data && data.length === 1) {
            // If only one profile, go directly to edit it
            router.replace(`/dashboard/edit/${data[0].id}`)
        } else {
            // If 0, or multiple, go to My Info to choose or create
            router.replace('/profile/me')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
    )
}
