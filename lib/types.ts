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
    unavailable_event_ids?: string[]
    /** 팀 단위 신청 시 팀 ID (NULL=개인 신청) */
    team_id?: string | null
    /** individual(개인) | team(팀) */
    applies_as?: ProposalAppliesAs
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

export type EventType = 'rehearsal' | 'main' | 'shoot' | 'fitting' | 'meeting' | 'other'

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
    rehearsal: '연습',
    main: '본행사',
    shoot: '촬영',
    fitting: '의상/리허설',
    meeting: '회의',
    other: '기타',
}

export interface ProjectEventDate {
    id: string
    project_id: string
    event_date: string
    event_time: string | null
    label: string | null
    event_type: EventType
    sort_order: number
}

export type ProjectMemberRole = 'owner' | 'manager' | 'viewer'

export const PROJECT_MEMBER_ROLE_LABELS: Record<ProjectMemberRole, string> = {
    owner: '책임자',
    manager: '운영자',
    viewer: '열람자',
}

export interface ProjectMember {
    id: string
    project_id: string
    user_id: string
    role: ProjectMemberRole
    added_by: string | null
    created_at: string
    user?: {
        id: string
        name: string | null
        email: string | null
    } | null
}

export type RecruitGender = 'any' | 'male' | 'female'

export const RECRUIT_GENDER_LABELS: Record<RecruitGender, string> = {
    any: '성별 무관',
    male: '남자만',
    female: '여자만',
}

export type ProposalAppliesAs = 'individual' | 'team'

export type ModerationStatus = 'draft' | 'pending' | 'approved' | 'rejected'

export const MODERATION_STATUS_LABELS: Record<ModerationStatus, string> = {
    draft: '비공개',
    pending: '공개 검토 중',
    approved: '공개 중',
    rejected: '공개 반려',
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
    moderation_status?: ModerationStatus
    moderation_note?: string | null
    moderation_reviewed_at?: string | null
    moderation_reviewed_by?: string | null
    published_at?: string | null
    embargo_date: string | null
    /** @deprecated 기존 호환용 — 새 폼은 recruit_budget_per_person 사용 */
    budget: number | null
    /** 섭외 1인당 예산 (NULL=미정) */
    recruit_budget_per_person?: number | null
    /** 섭외 인원 수 (NULL=미정) */
    recruit_count?: number | null
    /** 모집 시작일 */
    recruit_start_date?: string | null
    /** 모집 마감일 */
    recruit_end_date?: string | null
    /** 등록자 정보 비공개 */
    owner_anonymous?: boolean
    /** 성별 모집 조건 */
    recruit_gender?: RecruitGender
    /** @deprecated */
    start_date: string | null
    /** @deprecated */
    end_date: string | null
    /** @deprecated */
    due_date: string | null
    notes: string | null
    created_at: string
    deleted_at: string | null
    archived_at: string | null
    /** 현재 사용자가 이 프로젝트에서 갖는 역할 (목록/상세 쿼리에서 join 시 채움) */
    my_role?: ProjectMemberRole | null
    members?: ProjectMember[]
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
