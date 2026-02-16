'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/lib/types'

export function useProjects() {
    const { user } = useAuth()
    const [projects, setProjects] = useState<Project[]>([])
    const [archivedProjectIds, setArchivedProjectIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)

    const fetchProjects = useCallback(async () => {
        if (!user) return
        setLoading(true)
        try {
            // 0. 내가 보관한 프로젝트 ID (개인별 보관)
            const { data: archived } = await supabase
                .from('user_project_archives')
                .select('project_id')
                .eq('user_id', user.id)
            setArchivedProjectIds(new Set((archived || []).map((r: { project_id: string }) => r.project_id)))

            // 1. Projects I own (삭제된 것 제외)
            const { data: owned } = await supabase
                .from('projects')
                .select(`
                    *,
                    clients (company_name, contact_person),
                    owner:users!owner_id (name),
                    proposals (id, dancer_id, sender_id, fee, status, role, created_at, dancers (id, stage_name, profile_img, genres))
                `)
                .eq('owner_id', user.id)
                .is('deleted_at', null)
                .order('created_at', { ascending: false })

            // 2. Projects where I have an accepted proposal (as a dancer)
            const { data: myDancers } = await supabase
                .from('dancers')
                .select('id')
                .or(`owner_id.eq.${user.id},manager_id.eq.${user.id}`)

            let participatingProjects: Project[] = []
            if (myDancers && myDancers.length > 0) {
                const dancerIds = myDancers.map(d => d.id)
                const { data: acceptedProposals } = await supabase
                    .from('proposals')
                    .select('project_id')
                    .in('dancer_id', dancerIds)
                    .in('status', ['accepted', 'pending', 'negotiating'])

                if (acceptedProposals && acceptedProposals.length > 0) {
                    const projectIds = [...new Set(acceptedProposals.map(p => p.project_id))]
                    const ownedIds = (owned || []).map(p => p.id)
                    const uniqueIds = projectIds.filter(id => !ownedIds.includes(id))

                    if (uniqueIds.length > 0) {
                        const { data: participated } = await supabase
                            .from('projects')
                            .select(`
                                *,
                                clients (company_name, contact_person),
                                owner:users!owner_id (name),
                                proposals (id, dancer_id, sender_id, fee, status, role, created_at, dancers (id, stage_name, profile_img, genres))
                            `)
                            .in('id', uniqueIds)
                            .is('deleted_at', null)
                            .order('created_at', { ascending: false })

                        participatingProjects = (participated as any) || []
                    }
                }
            }

            const all = [...((owned as any) || []), ...participatingProjects]
            setProjects(all)
        } catch (err) {
            console.error('Error fetching projects:', err)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (user) fetchProjects()
    }, [user, fetchProjects])

    return { projects, archivedProjectIds, loading, refetch: fetchProjects }
}
