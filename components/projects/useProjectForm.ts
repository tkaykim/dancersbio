'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { findOrCreateClient } from '@/lib/create-client'
import type { EventType, RecruitGender, ModerationStatus, ProjectVisibility } from '@/lib/types'

export interface EventRow {
    id?: string
    date: string
    time: string
    timeUndefined: boolean
    type: EventType
    label: string
}

interface UseProjectFormOpts {
    projectId?: string
    onSuccess: (projectId: string) => void
}

/**
 * 프로젝트 생성/수정 폼의 state·로직 공유 hook.
 * Mobile(ProjectForm), Desktop(ProjectFormDesktop) 두 view에서 동일한 데이터 흐름을 사용.
 */
export function useProjectForm({ projectId, onSuccess }: UseProjectFormOpts) {
    const { user } = useAuth()
    const isEdit = !!projectId

    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(isEdit)
    const [error, setError] = useState<string | null>(null)
    const [authorName, setAuthorName] = useState<string | null>(null)

    const [visibility, setVisibility] = useState<ProjectVisibility>('private')
    const [origModerationStatus, setOrigModerationStatus] = useState<ModerationStatus>('draft')
    const [origVisibility, setOrigVisibility] = useState<ProjectVisibility>('private')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('choreo')
    const [recruitGender, setRecruitGender] = useState<RecruitGender>('any')
    const [budgetUndefined, setBudgetUndefined] = useState(false)
    const [budgetPerPerson, setBudgetPerPerson] = useState('')
    const [recruitCount, setRecruitCount] = useState('')
    const [recruitStart, setRecruitStart] = useState('')
    const [recruitEnd, setRecruitEnd] = useState('')
    const [embargoDate, setEmbargoDate] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [contactPerson, setContactPerson] = useState('')
    const [ownerAnonymous, setOwnerAnonymous] = useState(false)
    const [events, setEvents] = useState<EventRow[]>([
        { date: '', time: '', timeUndefined: false, type: 'main', label: '' },
    ])

    useEffect(() => {
        if (!user) return
        supabase.from('users').select('name').eq('id', user.id).maybeSingle()
            .then(({ data }) => setAuthorName(data?.name ?? null))
    }, [user])

    useEffect(() => {
        if (!projectId) return
        let cancelled = false
        const load = async () => {
            setInitialLoading(true)
            try {
                const { data: p, error: e1 } = await supabase
                    .from('projects')
                    .select(`
                        title, description, category, visibility, moderation_status,
                        recruit_count, recruit_budget_per_person, recruit_gender,
                        recruit_start_date, recruit_end_date, embargo_date, owner_anonymous,
                        clients (company_name, contact_person)
                    `)
                    .eq('id', projectId)
                    .single()
                if (e1) throw e1
                if (cancelled || !p) return
                setTitle(p.title ?? '')
                setDescription(p.description ?? '')
                setCategory(p.category ?? 'choreo')
                setVisibility((p.visibility as ProjectVisibility) ?? 'private')
                setOrigVisibility((p.visibility as ProjectVisibility) ?? 'private')
                setOrigModerationStatus((p.moderation_status as ModerationStatus) ?? 'draft')
                setRecruitGender((p.recruit_gender as RecruitGender) ?? 'any')
                if (p.recruit_budget_per_person == null) {
                    setBudgetUndefined(true); setBudgetPerPerson('')
                } else {
                    setBudgetUndefined(false); setBudgetPerPerson(String(p.recruit_budget_per_person))
                }
                setRecruitCount(p.recruit_count ? String(p.recruit_count) : '')
                setRecruitStart(p.recruit_start_date ?? '')
                setRecruitEnd(p.recruit_end_date ?? '')
                setEmbargoDate(p.embargo_date ?? '')
                setOwnerAnonymous(!!p.owner_anonymous)
                const c = Array.isArray(p.clients) ? p.clients[0] : p.clients
                setCompanyName(c?.company_name ?? '')
                setContactPerson(c?.contact_person ?? '')

                const { data: ev } = await supabase
                    .from('project_event_dates')
                    .select('id, event_date, event_time, label, event_type, sort_order')
                    .eq('project_id', projectId)
                    .order('sort_order', { ascending: true })
                if (cancelled) return
                if (ev && ev.length > 0) {
                    setEvents(ev.map((r) => ({
                        id: r.id,
                        date: r.event_date,
                        time: r.event_time ?? '',
                        timeUndefined: r.event_time == null,
                        type: (r.event_type as EventType) ?? 'main',
                        label: r.label ?? '',
                    })))
                }
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : '프로젝트를 불러오지 못했습니다.')
            } finally {
                setInitialLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [projectId])

    const totalBudget = useMemo(() => {
        if (budgetUndefined) return null
        const b = parseInt(budgetPerPerson, 10)
        const c = parseInt(recruitCount, 10)
        if (Number.isFinite(b) && Number.isFinite(c) && b > 0 && c > 0) return b * c
        return null
    }, [budgetPerPerson, recruitCount, budgetUndefined])

    const updateEvent = (idx: number, patch: Partial<EventRow>) =>
        setEvents((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
    const addEvent = () =>
        setEvents((prev) => [...prev, { date: '', time: '', timeUndefined: false, type: 'main', label: '' }])
    const removeEvent = (idx: number) =>
        setEvents((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev)

    const computeModeration = (): { visibility: ProjectVisibility; moderation_status: ModerationStatus } => {
        if (!isEdit) {
            return { visibility, moderation_status: visibility === 'public' ? 'pending' : 'draft' }
        }
        if (visibility === origVisibility) {
            return { visibility, moderation_status: origModerationStatus }
        }
        if (visibility === 'public') return { visibility: 'public', moderation_status: 'pending' }
        return { visibility: 'private', moderation_status: 'draft' }
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!user || !title.trim()) return
        setLoading(true); setError(null)
        try {
            let clientProfileId: string | null = null
            if (companyName.trim()) {
                clientProfileId = await findOrCreateClient(
                    user.id,
                    companyName.trim(),
                    contactPerson.trim() || user.email || '',
                )
            }
            const { visibility: nextVis, moderation_status: nextMod } = computeModeration()
            const corePayload: Record<string, unknown> = {
                title: title.trim(),
                description: description.trim() || null,
                category,
                visibility: nextVis,
                moderation_status: nextMod,
                recruit_budget_per_person: budgetUndefined ? null : (budgetPerPerson ? parseInt(budgetPerPerson, 10) : null),
                recruit_count: recruitCount ? parseInt(recruitCount, 10) : null,
                recruit_gender: recruitGender,
                recruit_start_date: recruitStart || null,
                recruit_end_date: recruitEnd || null,
                embargo_date: embargoDate || null,
                owner_anonymous: ownerAnonymous,
                client_profile_id: clientProfileId,
            }

            let resultProjectId = projectId
            if (isEdit && projectId) {
                const { error: updErr } = await supabase.from('projects').update(corePayload).eq('id', projectId)
                if (updErr) throw updErr
            } else {
                let { data: { session } } = await supabase.auth.getSession()
                const now = Math.floor(Date.now() / 1000)
                const expired = session?.expires_at != null && session.expires_at < now + 60
                if (!session?.user?.id || expired) {
                    const { data: refreshed } = await supabase.auth.refreshSession()
                    session = refreshed.session
                }
                if (!session?.user?.id) {
                    throw new Error('로그인 세션이 만료되었습니다. 다시 로그인해 주세요.')
                }
                const insertPayload = {
                    ...corePayload, owner_id: session.user.id,
                    status: 'active', confirmation_status: 'confirmed', progress_status: 'recruiting',
                }
                const { data: created, error: insErr } = await supabase
                    .from('projects').insert(insertPayload).select('id').single()
                if (insErr) throw insErr
                resultProjectId = created.id
            }

            if (resultProjectId) {
                if (isEdit) {
                    await supabase.from('project_event_dates').delete().eq('project_id', resultProjectId)
                }
                const validEvents = events.filter((r) => r.date.trim())
                if (validEvents.length > 0) {
                    await supabase.from('project_event_dates').insert(
                        validEvents.map((r, i) => ({
                            project_id: resultProjectId,
                            event_date: r.date,
                            event_time: r.timeUndefined ? null : (r.time.trim() || null),
                            label: r.label.trim() || null,
                            event_type: r.type,
                            sort_order: i,
                        }))
                    )
                }
                onSuccess(resultProjectId)
            }
        } catch (err: unknown) {
            console.error('[project save]', err)
            setError(err instanceof Error ? err.message : '저장 실패')
        } finally {
            setLoading(false)
        }
    }

    return {
        // state
        isEdit, user, authorName,
        loading, initialLoading, error,
        visibility, setVisibility, origVisibility,
        title, setTitle,
        description, setDescription,
        category, setCategory,
        recruitGender, setRecruitGender,
        budgetUndefined, setBudgetUndefined,
        budgetPerPerson, setBudgetPerPerson,
        recruitCount, setRecruitCount,
        recruitStart, setRecruitStart,
        recruitEnd, setRecruitEnd,
        embargoDate, setEmbargoDate,
        companyName, setCompanyName,
        contactPerson, setContactPerson,
        ownerAnonymous, setOwnerAnonymous,
        events,
        // computed
        totalBudget,
        // actions
        addEvent, updateEvent, removeEvent,
        handleSubmit,
    }
}

export const sanitizeNumber = (raw: string) => raw.replace(/[^\d]/g, '')
export const displayWithCommas = (v: string) => {
    if (!v) return ''
    const n = parseInt(v, 10)
    return Number.isFinite(n) ? n.toLocaleString('ko-KR') : ''
}
