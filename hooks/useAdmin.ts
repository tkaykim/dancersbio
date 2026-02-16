'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export function useAdmin() {
    const { user, loading: authLoading } = useAuth()
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (authLoading) return

        if (!user) {
            setIsAdmin(false)
            setLoading(false)
            return
        }

        checkAdmin()
    }, [user, authLoading])

    const checkAdmin = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', user!.id)
                .single()

            if (!error && data?.role === 'admin') {
                setIsAdmin(true)
            } else {
                setIsAdmin(false)
            }
        } catch {
            setIsAdmin(false)
        } finally {
            setLoading(false)
        }
    }

    return { isAdmin, loading: loading || authLoading, user }
}
