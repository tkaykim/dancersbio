import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface SocialLinks {
    instagram?: string
    twitter?: string
    youtube?: string
}

export interface Dancer {
    id: string
    owner_id: string | null
    manager_id: string | null
    stage_name: string
    slug?: string
    profile_img: string | null
    bio: string | null
    specialties: string[] | null
    genres: string[] | null
    location: string | null
    social_links: SocialLinks | null
    gender: 'male' | 'female' | 'other' | null
    is_verified: boolean
    agency_id: string | null
    created_at: string
}

export interface Career {
    id: number
    dancer_id: string
    type: string
    title: string
    date: string
    details: any
    is_public: boolean
    is_representative: boolean
    sort_order: number
    created_at: string
}

export interface Team {
    id: string
    name: string
    slug: string | null
    leader_id: string | null
    profile_img: string | null
    bio: string | null
    founded_date: string | null
    location: string | null
    social_links: SocialLinks | null
    portfolio: any[] | null
    representative_video: string | null
    is_verified: boolean
    created_at: string
}

export interface TeamMember {
    id: string
    team_id: string
    dancer_id: string
    role: string | null
    joined_date: string | null
    is_active: boolean
    created_at: string
}

export interface TeamCareer {
    id: number
    team_id: string
    type: string
    title: string
    date: string | null
    details: any
    is_public: boolean
    is_representative: boolean
    sort_order: number
    created_at: string
}

export interface DancerAgency {
    id: string
    dancer_id: string
    agency_id: string
    role: string | null
    is_primary: boolean
    created_at: string
}

export interface TeamWithMembers extends Team {
    team_members?: (TeamMember & {
        dancers: {
            id: string
            stage_name: string
            profile_img: string | null
            slug: string | null
        }
    })[]
}

export interface DancerAgencyWithDetails extends DancerAgency {
    clients: {
        id: string
        company_name: string | null
        contact_person: string
        logo_url: string | null
    }
}
