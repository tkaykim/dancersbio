export interface Proposal {
    id: string
    project_id: string
    dancer_id: string
    sender_id: string
    role: string
    fee: number | null
    status: 'pending' | 'accepted' | 'declined' | 'negotiating'
    sender_last_read_at: string | null
    receiver_last_read_at: string | null
    negotiation_history: NegotiationHistoryItem[] | null
    details: string | null
    created_at: string
    projects: {
        title: string
        category: string
        // 마이그레이션 전: status 컬럼
        status?: string
        // 마이그레이션 후: 두 축 분리
        confirmation_status?: string
        progress_status?: string
        clients: {
            company_name: string | null
        } | null
    }
    dancers: {
        id: string
        stage_name: string
        profile_img: string | null
    }
    sender?: {
        name: string | null
    }
}

export interface NegotiationHistoryItem {
    date: string
    actor: string
    actor_id: string
    message: string
    suggested_fee?: number | null
    type: 'message' | 'offer' | 'accept' | 'decline'
}

export interface DancerProfile {
    id: string
    stage_name: string
    profile_img: string | null
    role: 'owner' | 'manager'
}

export type ProposalTab = 'inbox' | 'outbox'

export type ConfirmationStatus = 'negotiating' | 'confirmed' | 'declined' | 'cancelled' | 'completed'
export type ProgressStatus = 'idle' | 'recruiting' | 'in_progress' | 'completed' | 'cancelled'

export interface Project {
    id: string
    owner_id: string
    client_profile_id: string | null
    title: string
    description: string | null
    category: string | null
    // 마이그레이션 전: status / 마이그레이션 후: confirmation_status + progress_status
    status?: string
    confirmation_status?: ConfirmationStatus
    progress_status?: ProgressStatus
    budget: number | null
    start_date: string | null
    end_date: string | null
    notes: string | null
    created_at: string
    clients?: {
        company_name: string | null
        contact_person: string | null
    } | null
    owner?: {
        name: string | null
    }
    proposals?: ProjectProposal[]
}

export interface ProjectProposal {
    id: string
    dancer_id: string
    sender_id: string
    fee: number | null
    status: string
    role: string | null
    details: string | null
    created_at: string
    dancers: {
        id: string
        stage_name: string
        profile_img: string | null
        genres: string[] | null
    }
}

export type ProfileRequestType = 'claim' | 'manager'
export type ProfileRequestStatus = 'pending' | 'approved' | 'rejected'

export interface ProfileRequest {
    id: string
    dancer_id: string
    requester_id: string
    type: ProfileRequestType
    status: ProfileRequestStatus
    note: string | null
    reviewed_by: string | null
    reviewed_at: string | null
    created_at: string
    dancers?: {
        id: string
        stage_name: string
        profile_img: string | null
    }
    requester?: {
        name: string | null
        email: string | null
    }
}
