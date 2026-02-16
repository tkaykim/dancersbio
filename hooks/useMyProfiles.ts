'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import type { DancerProfile } from '@/lib/types'

export interface ProfileStats {
    proposalCount: number
    careerCount: number
}

export function useMyProfiles() {
    const { user } = useAuth()
    const [ownedDancers, setOwnedDancers] = useState<any[]>([])
    const [managedDancers, setManagedDancers] = useState<any[]>([])
    const [allProfiles, setAllProfiles] = useState<DancerProfile[]>([])
    const [profileStats, setProfileStats] = useState<Record<string, ProfileStats>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchProfiles()
        }
    }, [user])

    const fetchProfiles = async () => {
        setLoading(true)
        try {
            const { data: owned, error: ownedError } = await supabase
                .from('dancers')
                .select('*')
                .eq('owner_id', user!.id)

            if (ownedError) throw ownedError

            const { data: managed, error: managedError } = await supabase
                .from('dancers')
                .select('*')
                .eq('manager_id', user!.id)

            if (managedError) throw managedError

            setOwnedDancers(owned || [])
            setManagedDancers(managed || [])

            const profiles: DancerProfile[] = [
                ...(owned?.map(p => ({ id: p.id, stage_name: p.stage_name, profile_img: p.profile_img, role: 'owner' as const })) || []),
                ...(managed?.map(p => ({ id: p.id, stage_name: p.stage_name, profile_img: p.profile_img, role: 'manager' as const })) || [])
            ]
            setAllProfiles(profiles)

            const allDancerIds = profiles.map(p => p.id)
            if (allDancerIds.length > 0) {
                await fetchProfileStats(allDancerIds)
            }
        } catch (err) {
            console.error('Error fetching profiles:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchProfileStats = async (dancerIds: string[]) => {
        try {
            const { data: proposals } = await supabase
                .from('proposals')
                .select('dancer_id')
                .in('dancer_id', dancerIds)

            const { data: careers } = await supabase
                .from('careers')
                .select('dancer_id')
                .in('dancer_id', dancerIds)

            const stats: Record<string, ProfileStats> = {}
            for (const id of dancerIds) {
                stats[id] = {
                    proposalCount: proposals?.filter(p => p.dancer_id === id).length || 0,
                    careerCount: careers?.filter(c => c.dancer_id === id).length || 0,
                }
            }
            setProfileStats(stats)
        } catch (err) {
            console.error('Error fetching profile stats:', err)
        }
    }

    return { ownedDancers, managedDancers, allProfiles, profileStats, loading, refetch: fetchProfiles }
}
