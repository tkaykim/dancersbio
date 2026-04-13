import { supabase } from './supabase'
import type { Team, TeamWithMembers, TeamCareer } from './supabase'

export async function getTeamBySlug(slug: string): Promise<TeamWithMembers | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)

    const query = supabase
        .from('teams')
        .select(`
            *,
            team_members (
                id, team_id, dancer_id, role, joined_date, is_active, created_at,
                dancers:dancer_id (id, stage_name, profile_img, slug)
            )
        `)

    if (isUuid) {
        query.eq('id', slug)
    } else {
        query.eq('slug', slug)
    }

    const { data, error } = await query.single()
    if (error || !data) return null
    return data as TeamWithMembers
}

export async function getTeamCareers(teamId: string): Promise<TeamCareer[]> {
    const { data, error } = await supabase
        .from('team_careers')
        .select('*')
        .eq('team_id', teamId)
        .order('date', { ascending: false })

    if (error) return []
    return data || []
}

export async function getVerifiedTeams(): Promise<Team[]> {
    const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('is_verified', true)
        .order('name', { ascending: true })

    if (error) return []
    return data || []
}

export async function getAllTeams(): Promise<Team[]> {
    const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) return []
    return data || []
}

export async function getTeamsForDancer(dancerId: string) {
    const { data, error } = await supabase
        .from('team_members')
        .select(`
            id, role, joined_date, is_active,
            teams:team_id (id, name, slug, profile_img, is_verified)
        `)
        .eq('dancer_id', dancerId)
        .eq('is_active', true)

    if (error) return []
    return data || []
}

export async function getMyTeams(userId: string) {
    const { data, error } = await supabase
        .from('teams')
        .select(`
            *,
            team_members (
                id, dancer_id, role, is_active,
                dancers:dancer_id (id, stage_name, profile_img)
            )
        `)
        .eq('leader_id', userId)
        .order('created_at', { ascending: false })

    if (error) return []
    return data || []
}

export async function searchTeams(query: string): Promise<Team[]> {
    const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('is_verified', true)
        .ilike('name', `%${query}%`)
        .order('name', { ascending: true })
        .limit(20)

    if (error) return []
    return data || []
}
