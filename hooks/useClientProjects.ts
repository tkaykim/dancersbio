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
          proposals (id, dancer_id, sender_id, fee, status, role, details, created_at, dancers (id, stage_name, profile_img, genres))
        `)
        .eq('owner_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects((data as ClientProject[]) || [])
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
