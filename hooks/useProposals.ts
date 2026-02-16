'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import type { Proposal, DancerProfile, ProposalTab } from '@/lib/types'

export function useProposals(
    myProfiles: DancerProfile[],
    activeTab: ProposalTab,
    selectedProfileId: string
) {
    const { user } = useAuth()
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [loading, setLoading] = useState(true)

    const fetchProposals = useCallback(async () => {
        if (!user) return
        setLoading(true)
        try {
            let query = supabase
                .from('proposals')
                .select(`
                    *,
                    projects (
                        *,
                        clients (company_name)
                    ),
                    dancers (id, stage_name, profile_img),
                    sender:users!sender_id (name)
                `)
                .order('created_at', { ascending: false })

            if (activeTab === 'inbox') {
                if (myProfiles.length === 0) {
                    setProposals([])
                    setLoading(false)
                    return
                }
                if (selectedProfileId !== 'all') {
                    query = query.eq('dancer_id', selectedProfileId)
                } else {
                    const allMyDancerIds = myProfiles.map(p => p.id)
                    query = query.in('dancer_id', allMyDancerIds)
                }
            } else {
                query = query.eq('sender_id', user.id)
                if (selectedProfileId !== 'all') {
                    query = query.eq('dancer_id', selectedProfileId)
                }
            }

            const { data, error } = await query
            if (error) throw error
            setProposals((data as any) || [])
        } catch (err) {
            console.error('Error fetching proposals:', err)
        } finally {
            setLoading(false)
        }
    }, [user, activeTab, selectedProfileId, myProfiles])

    useEffect(() => {
        if (user) {
            fetchProposals()
        }
    }, [fetchProposals, user])

    const markAsRead = async (proposal: Proposal) => {
        if (!user) return

        const isSender = proposal.sender_id === user.id
        const updateField = isSender ? 'sender_last_read_at' : 'receiver_last_read_at'

        const { error } = await supabase
            .from('proposals')
            .update({ [updateField]: new Date().toISOString() })
            .eq('id', proposal.id)

        if (!error) {
            setProposals(prev => prev.map(p => {
                if (p.id === proposal.id) {
                    return { ...p, [updateField]: new Date().toISOString() }
                }
                return p
            }))
        }
    }

    const getUnreadCount = (proposal: Proposal): number => {
        if (!user) return 0
        const isSender = proposal.sender_id === user.id
        const lastReadAt = isSender ? proposal.sender_last_read_at : proposal.receiver_last_read_at

        const unreadHistoryMessages = proposal.negotiation_history?.filter((h) =>
            h.actor_id !== user.id && (!lastReadAt || new Date(h.date) > new Date(lastReadAt))
        ).length || 0

        if (!lastReadAt) {
            if (!proposal.negotiation_history || proposal.negotiation_history.length === 0) {
                return isSender ? 0 : 1
            }
            return unreadHistoryMessages + (isSender ? 0 : 1)
        }

        if (!proposal.negotiation_history || proposal.negotiation_history.length === 0) {
            if (isSender) return 0
            return new Date(proposal.created_at) > new Date(lastReadAt) ? 1 : 0
        }

        return unreadHistoryMessages
    }

    const getTotalUnreadCount = (): number => {
        return proposals.reduce((acc, p) => acc + getUnreadCount(p), 0)
    }

    return {
        proposals,
        loading,
        markAsRead,
        getUnreadCount,
        getTotalUnreadCount,
        refetch: fetchProposals
    }
}
