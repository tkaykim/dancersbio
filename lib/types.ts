export interface Proposal {
    id: string
    project_id: string
    dancer_id: string
    sender_id: string
    role: string
    fee: number | null
    status: 'pending' | 'accepted' | 'declined' | 'negotiating' | 'cancelled'
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

export type ProjectVisibility = 'private' | 'public'

export interface ProjectEventDate {
    id: string
    project_id: string
    event_date: string
    event_time: string | null
    label: string | null
    sort_order: number
}

export interface Project {
    id: string
    owner_id: string
    parent_project_id: string | null
    client_profile_id: string | null
    pm_dancer_id: string | null
    contract_amount: number | null
    title: string
    description: string | null
    category: string | null
    // 마이그레이션 전: status / 마이그레이션 후: confirmation_status + progress_status
    status?: string
    confirmation_status?: ConfirmationStatus
    progress_status?: ProgressStatus
    visibility: ProjectVisibility
    embargo_date: string | null
    budget: number | null
    start_date: string | null
    end_date: string | null
    due_date: string | null
    notes: string | null
    created_at: string
    deleted_at: string | null
    archived_at: string | null
    clients?: {
        company_name: string | null
        contact_person: string | null
    } | null
    owner?: {
        name: string | null
    }
    pm_dancer?: {
        id: string
        stage_name: string
    } | null
    proposals?: ProjectProposal[]
    event_dates?: ProjectEventDate[]
}


export interface ProjectProposal {
    id: string
    dancer_id: string
    sender_id: string
    fee: number | null
    status: string
    role: string | null
    details: string | null
    scheduled_date: string | null
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

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface ProjectTask {
    id: string
    project_id: string
    title: string
    description: string | null
    status: TaskStatus
    priority: TaskPriority | null
    due_date: string | null
    assigned_to: string | null
    created_by: string
    completed_at: string | null
    created_at: string
    updated_at: string
    assigned_dancer?: {
        id: string
        stage_name: string
        profile_img: string | null
    } | null
}
