'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import type { Project, ProjectProposal } from '@/lib/types'

export interface ClientProject extends Project {
  proposals?: (ProjectProposal & { dancers: { id: string; stage_name: string; profile_img: string | null; genres: string[] | null } })[]
}

export function useClientProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<ClientProject[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients (company_name, contact_person),
          owner:users!owner_id (name),
          project_event_dates (id, event_date, event_time, label, sort_order),
          proposals (id, dancer_id, sender_id, fee, status, role, scheduled_date, details, created_at, dancers (id, stage_name, profile_img, genres))
        `)
        .eq('owner_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      const list = (data || []) as (ClientProject & { project_event_dates?: { id: string; event_date: string; event_time: string | null; label: string | null; sort_order: number }[] })[]
      setProjects(list.map((p) => ({
        ...p,
        event_dates: (p.project_event_dates ?? []).sort((a, b) => a.sort_order - b.sort_order),
        project_event_dates: undefined,
      })) as unknown as ClientProject[])
    } catch (err) {
      console.error('Error fetching client projects:', err)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) fetchProjects()
  }, [user, fetchProjects])

  return { projects, loading, refetch: fetchProjects }
}
