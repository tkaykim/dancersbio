'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export interface ClientProfile {
  id: string
  owner_id: string
  company_name: string | null
  contact_person: string
  type: string
  logo_url: string | null
  business_number: string | null
  email: string | null
  phone: string | null
  address: string | null
  description: string | null
  created_at: string | null
}

export function useMyClients() {
  const { user } = useAuth()
  const [clients, setClients] = useState<ClientProfile[]>([])
  const [loading, setLoading] = useState(true)

  const fetchClients = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients((data as ClientProfile[]) || [])
    } catch (err) {
      console.error('Error fetching clients:', err)
      setClients([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) fetchClients()
  }, [user, fetchClients])

  return { clients, loading, refetch: fetchClients }
}
