'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ModerationStatus, ProjectMemberRole } from '@/lib/types'
import { MODERATION_STATUS_LABELS } from '@/lib/types'
import { Globe, Lock, AlertCircle, Loader2, Send, CheckCircle2 } from 'lucide-react'

interface Props {
    projectId: string
    moderationStatus: ModerationStatus | null | undefined
    moderationNote: string | null | undefined
    visibility: 'public' | 'private'
    myRole: ProjectMemberRole | null | undefined
    onChange?: () => void
}

const STATUS_STYLE: Record<ModerationStatus, { bg: string; fg: string; Icon: typeof Globe }> = {
    draft:    { bg: 'rgba(255,250,235,0.06)', fg: 'var(--cue-ink-3)', Icon: Lock },
    pending:  { bg: 'rgba(255,192,97,0.12)',  fg: 'var(--cue-warn)',  Icon: Loader2 },
    approved: { bg: 'rgba(34,197,94,0.12)',   fg: 'var(--cue-ok)',    Icon: CheckCircle2 },
    rejected: { bg: 'rgba(255,122,110,0.12)', fg: 'var(--cue-bad)',   Icon: AlertCircle },
}

export default function PublishRequestPanel({
    projectId,
    moderationStatus,
    moderationNote,
    visibility,
    myRole,
    onChange,
}: Props) {
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const status: ModerationStatus = (moderationStatus ?? 'draft') as ModerationStatus
    const canManage = myRole === 'owner' || myRole === 'manager'

    const submitForReview = async () => {
        if (!canManage) return
        setSubmitting(true)
        setError(null)
        try {
            const { error: updErr } = await supabase
                .from('projects')
                .update({
                    moderation_status: 'pending',
                    moderation_note: null,
                })
                .eq('id', projectId)
            if (updErr) throw updErr
            onChange?.()
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : '공개 신청 실패')
        } finally {
            setSubmitting(false)
        }
    }

    const unpublish = async () => {
        if (!canManage) return
        if (!confirm('공개를 중단하고 비공개로 전환하시겠습니까? 다시 공개하려면 재심사가 필요합니다.')) return
        setSubmitting(true)
        setError(null)
        try {
            const { error: updErr } = await supabase
                .from('projects')
                .update({
                    visibility: 'private',
                    moderation_status: 'draft',
                })
                .eq('id', projectId)
            if (updErr) throw updErr
            onChange?.()
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : '비공개 전환 실패')
        } finally {
            setSubmitting(false)
        }
    }

    const style = STATUS_STYLE[status]
    const StatusIcon = style.Icon

    return (
        <section className="rounded-cue-2 p-3" style={{ background: 'var(--cue-surface)', border: '0.5px solid var(--cue-hairline)' }}>
            <div className="flex items-center gap-2 mb-2">
                <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-cue-1 text-[11px] font-bold"
                    style={{ background: style.bg, color: style.fg }}
                >
                    <StatusIcon className={`w-3 h-3 ${status === 'pending' ? 'animate-spin' : ''}`} />
                    {MODERATION_STATUS_LABELS[status]}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--cue-ink-3)' }}>
                    {visibility === 'public' && status === 'approved'
                        ? '캐스팅 피드에 노출 중'
                        : '비공개 (다이렉트 제안만 가능)'}
                </span>
            </div>

            {status === 'rejected' && moderationNote && (
                <div className="mb-2 p-2 rounded-cue-1 text-xs" style={{ background: 'rgba(255,122,110,0.08)', color: 'var(--cue-bad)' }}>
                    <strong>반려 사유:</strong> {moderationNote}
                </div>
            )}

            {error && (
                <div className="mb-2 p-2 rounded-cue-1 text-xs" style={{ background: 'rgba(255,122,110,0.08)', color: 'var(--cue-bad)' }}>
                    {error}
                </div>
            )}

            {canManage && (
                <div className="flex gap-2 flex-wrap">
                    {(status === 'draft' || status === 'rejected') && (
                        <button
                            onClick={submitForReview}
                            disabled={submitting}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-cue-1 text-xs font-bold disabled:opacity-50"
                            style={{ background: 'var(--cue-accent)', color: 'var(--cue-accent-ink)' }}
                        >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            공개 신청
                        </button>
                    )}
                    {status === 'pending' && (
                        <button
                            disabled
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-cue-1 text-xs"
                            style={{ background: 'var(--cue-surface-2)', color: 'var(--cue-ink-3)' }}
                        >
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            검토 대기 중
                        </button>
                    )}
                    {status === 'approved' && visibility === 'public' && (
                        <button
                            onClick={unpublish}
                            disabled={submitting}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-cue-1 text-xs font-bold disabled:opacity-50"
                            style={{ background: 'var(--cue-surface-2)', color: 'var(--cue-ink)', border: '0.5px solid var(--cue-hairline)' }}
                        >
                            <Lock className="w-3.5 h-3.5" />
                            비공개로 전환
                        </button>
                    )}
                </div>
            )}

            <p className="mt-2 text-[10px] leading-relaxed" style={{ color: 'var(--cue-ink-4)' }}>
                공개 신청 시 어드민 검토를 거쳐 캐스팅 피드에 노출됩니다. 비공개 상태에서도 다이렉트 제안은 가능합니다.
            </p>
        </section>
    )
}
