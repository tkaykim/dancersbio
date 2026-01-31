import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
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
    is_verified: boolean
    created_at: string
}

export interface Career {
    id: number
    dancer_id: string
    type: string
    title: string
    date: string
    details: any
    created_at: string
}
