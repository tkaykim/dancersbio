'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
    user: User | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string, name: string) => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

async function ensurePublicUserRecord(user: User) {
    const { data } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

    if (!data) {
        await supabase.from('users').insert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name || user.email?.split('@')[0] || '',
        })
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            const sessionUser = session?.user ?? null
            setUser(sessionUser)
            setLoading(false)
            if (sessionUser) {
                ensurePublicUserRecord(sessionUser)
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const sessionUser = session?.user ?? null
            setUser(sessionUser)
            if (sessionUser) {
                ensurePublicUserRecord(sessionUser)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const value = {
        user,
        loading,
        signIn: async (email: string, password: string) => {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) throw error
        },
        signUp: async (email: string, password: string, name: string) => {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { name } }
            })
            if (error) throw error

            if (data.user) {
                await supabase.from('users').upsert({
                    id: data.user.id,
                    email,
                    name,
                })
            }
        },
        signOut: async () => {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
        }
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
