import { supabase } from './supabase'
import type { DancerAgencyWithDetails, TeamAgencyWithDetails } from './supabase'

export async function getAgenciesForDancer(dancerId: string): Promise<DancerAgencyWithDetails[]> {
    const { data, error } = await supabase
        .from('dancer_agencies')
        .select(`
            *,
            clients:agency_id (id, company_name, contact_person, logo_url)
        `)
        .eq('dancer_id', dancerId)
        .order('is_primary', { ascending: false })

    if (error) return []
    return (data || []) as DancerAgencyWithDetails[]
}

export async function getAgencyById(agencyId: string) {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', agencyId)
        .eq('type', 'agency')
        .single()

    if (error) return null
    return data
}

export async function getDancersForAgency(agencyId: string) {
    const { data, error } = await supabase
        .from('dancer_agencies')
        .select(`
            id, role, is_primary,
            dancers:dancer_id (id, stage_name, profile_img, slug, is_verified, specialties, genres)
        `)
        .eq('agency_id', agencyId)

    if (error) return []
    return data || []
}

export async function getAgenciesForTeam(teamId: string): Promise<TeamAgencyWithDetails[]> {
    const { data, error } = await supabase
        .from('team_agencies')
        .select(`
            *,
            clients:agency_id (id, company_name, contact_person, logo_url)
        `)
        .eq('team_id', teamId)
        .order('is_primary', { ascending: false })

    if (error) return []
    return (data || []) as TeamAgencyWithDetails[]
}

export async function getAllAgencies() {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('type', 'agency')
        .order('company_name', { ascending: true })

    if (error) return []
    return data || []
}
