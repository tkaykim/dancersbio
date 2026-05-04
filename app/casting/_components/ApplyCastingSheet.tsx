'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Ico } from '@/components/cue'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { useMyProfiles } from '@/hooks/useMyProfiles'
import { formatPay, type CastingMock } from '@/lib/castingMockData'

interface Props {
    open: boolean
    onClose: () => void
    casting: CastingMock
    /** 실제 supabase project UUID. 주어지면 실 지원 플로우로 동작 */
    realProjectId?: string | null
    /** 실 프로젝트의 owner_id — 자기 프로젝트엔 지원 못 막기 위해 사용 */
    realProjectOwnerId?: string | null
    /** 실 프로젝트의 모집 단위. 'individual'이면 팀 신청 차단, 'team'이면 개인 신청 차단 */
    realProjectRecruitUnit?: 'individual' | 'team' | 'both' | null
}

export default function ApplyCastingSheet({
    open,
    onClose,
    casting,
    realProjectId = null,
    realProjectOwnerId = null,
    realProjectRecruitUnit = null,
}: Props) {
    const { user } = useAuth()
    const { ownedDancers, managedDancers, loading: profilesLoading } = useMyProfiles()
    const profiles = useMemo(
        () => [...ownedDancers, ...managedDancers],
        [ownedDancers, managedDancers]
    )

    const [message, setMessage] = useState('')
    const [reel, setReel] = useState('')
    const [selectedDancerId, setSelectedDancerId] = useState<string>('')
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [alreadyApplied, setAlreadyApplied] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    // 팀 신청
    const [applyMode, setApplyMode] = useState<'individual' | 'team'>('individual')
    const [myTeams, setMyTeams] = useState<{ id: string; name: string }[]>([])
    const [selectedTeamId, setSelectedTeamId] = useState<string>('')

    // 프로젝트의 모집 단위에 따른 정책
    const allowIndividual = realProjectRecruitUnit !== 'team'
    const allowTeam = realProjectRecruitUnit !== 'individual'

    // 모집 단위가 'team'이면 자동으로 team 모드로 시작
    useEffect(() => {
        if (!open) return
        if (realProjectRecruitUnit === 'team') setApplyMode('team')
        else if (realProjectRecruitUnit === 'individual') setApplyMode('individual')
    }, [open, realProjectRecruitUnit])

    // 사용자가 leader 인 팀 목록
    useEffect(() => {
        if (!user) { setMyTeams([]); return }
        let cancelled = false
        supabase
            .from('teams')
            .select('id, name')
            .eq('leader_id', user.id)
            .then(({ data }) => {
                if (cancelled) return
                const list = (data ?? []) as { id: string; name: string }[]
                setMyTeams(list)
                if (list.length > 0 && !selectedTeamId) setSelectedTeamId(list[0].id)
            })
        return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const isReal = !!realProjectId

    // Auto-pick first profile when sheet opens
    useEffect(() => {
        if (!selectedDancerId && profiles.length > 0) {
            setSelectedDancerId(profiles[0].id)
        }
    }, [profiles, selectedDancerId])

    // Pre-check: 이미 지원했는지 확인
    useEffect(() => {
        if (!open || !isReal || !realProjectId || !selectedDancerId) {
            setAlreadyApplied(false)
            return
        }
        let cancelled = false
        supabase
            .from('proposals')
            .select('id')
            .eq('project_id', realProjectId)
            .eq('dancer_id', selectedDancerId)
            .limit(1)
            .maybeSingle()
            .then(({ data }) => {
                if (!cancelled) setAlreadyApplied(!!data)
            })
        return () => {
            cancelled = true
        }
    }, [open, isReal, realProjectId, selectedDancerId])

    useEffect(() => {
        if (!open) {
            setSubmitted(false)
            setSubmitError('')
            return
        }
        const orig = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = orig
        }
    }, [open])

    if (!open) return null

    const isOwnProject = !!(
        isReal && user && realProjectOwnerId && user.id === realProjectOwnerId
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitError('')

        // 비실제(mock) 캐스팅: 기존 스캐폴드 동작 유지
        if (!isReal) {
            setSubmitted(true)
            return
        }

        if (!user) {
            setSubmitError('로그인이 필요합니다.')
            return
        }
        if (isOwnProject) {
            setSubmitError('내가 만든 프로젝트에는 지원할 수 없습니다.')
            return
        }
        if (!selectedDancerId) {
            setSubmitError('지원할 댄서 프로필을 선택해주세요.')
            return
        }
        if (!message.trim()) {
            setSubmitError('지원 메시지를 입력해주세요.')
            return
        }

        setSubmitting(true)
        try {
            const detailsBody = reel.trim()
                ? `${message.trim()}\n\n📎 ${reel.trim()}`
                : message.trim()

            if (applyMode === 'team' && !selectedTeamId) {
                setSubmitError('신청할 팀을 선택해주세요.')
                setSubmitting(false)
                return
            }
            // 프로젝트의 모집 단위 정책 검증
            if (applyMode === 'team' && !allowTeam) {
                setSubmitError('이 공고는 개인 단위로만 모집합니다.')
                setSubmitting(false)
                return
            }
            if (applyMode === 'individual' && !allowIndividual) {
                setSubmitError('이 공고는 팀 단위로만 모집합니다.')
                setSubmitting(false)
                return
            }

            const { data: inserted, error: insertErr } = await supabase
                .from('proposals')
                .insert({
                    project_id: realProjectId,
                    dancer_id: selectedDancerId,
                    sender_id: user.id,
                    role: applyMode === 'team' ? '캐스팅 지원 (팀)' : '캐스팅 지원',
                    fee: null,
                    details: detailsBody,
                    status: 'pending',
                    team_id: applyMode === 'team' ? selectedTeamId : null,
                    applies_as: applyMode,
                })
                .select('id')
                .single()

            if (insertErr) {
                // 23505 = unique_violation
                if (insertErr.code === '23505') {
                    setAlreadyApplied(true)
                    setSubmitError('이미 이 프로필로 지원한 공고입니다.')
                } else {
                    throw insertErr
                }
                return
            }

            if (inserted?.id) {
                try {
                    const { triggerPushEvent } = await import('@/lib/trigger-push-event')
                    triggerPushEvent('proposal_created', { proposal_id: inserted.id })
                } catch {
                    // 푸시 트리거 실패는 지원 자체엔 영향 없음
                }
            }

            setSubmitted(true)
        } catch (err: any) {
            setSubmitError(err?.message || '지원에 실패했습니다.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 60,
                background: 'rgba(0,0,0,0.55)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: 480,
                    background: 'var(--cue-bg)',
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    border: '1px solid var(--cue-hairline)',
                    maxHeight: '92vh',
                    overflowY: 'auto',
                }}
            >
                <div
                    style={{
                        padding: '14px 20px 12px',
                        borderBottom: '1px solid var(--cue-hairline)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'sticky',
                        top: 0,
                        background: 'color-mix(in srgb, var(--cue-bg) 92%, transparent)',
                        backdropFilter: 'blur(18px)',
                        WebkitBackdropFilter: 'blur(18px)',
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: 500,
                                color: 'var(--cue-ink-3)',
                            }}
                        >
                            지원 · {casting.category}
                        </div>
                        <h2
                            style={{
                                fontSize: 20,
                                fontWeight: 700,
                                letterSpacing: '-0.02em',
                                color: 'var(--cue-ink)',
                                marginTop: 2,
                            }}
                        >
                            지원하기
                        </h2>
                    </div>
                    <button
                        type="button"
                        aria-label="닫기"
                        onClick={onClose}
                        style={{
                            background: 'var(--cue-surface)',
                            border: '1px solid var(--cue-hairline)',
                            borderRadius: 999,
                            padding: 8,
                            color: 'var(--cue-ink)',
                        }}
                    >
                        {Ico.x('currentColor', 16)}
                    </button>
                </div>

                {submitted ? (
                    <SuccessBlock onClose={onClose} casting={casting} isReal={isReal} />
                ) : isReal && !user ? (
                    <NeedsLoginBlock />
                ) : isReal && isOwnProject ? (
                    <CannotApplyBlock
                        onClose={onClose}
                        message="내가 만든 프로젝트에는 지원할 수 없습니다."
                    />
                ) : isReal && !profilesLoading && profiles.length === 0 ? (
                    <NeedsProfileBlock onClose={onClose} />
                ) : (
                    <form onSubmit={handleSubmit} style={{ padding: 20, display: 'grid', gap: 18 }}>
                        <div
                            style={{
                                padding: 14,
                                borderRadius: 14,
                                background: 'var(--cue-surface)',
                                border: '1px solid var(--cue-hairline)',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color: 'var(--cue-ink-3)',
                                    marginBottom: 6,
                                }}
                            >
                                지원 대상
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--cue-ink)', lineHeight: 1.4 }}>
                                {casting.title}
                            </div>
                            <div
                                style={{
                                    fontSize: 12,
                                    color: 'var(--cue-ink-3)',
                                    marginTop: 6,
                                    fontVariantNumeric: 'tabular-nums',
                                }}
                            >
                                {casting.poster} · {formatPay(casting.pay)}
                            </div>
                        </div>

                        {isReal && (profiles.length > 0 || myTeams.length > 0) && (
                            <Field label="신청 방식">
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                        type="button"
                                        onClick={() => setApplyMode('individual')}
                                        disabled={profiles.length === 0 || !allowIndividual}
                                        style={{
                                            flex: 1,
                                            padding: '10px 12px',
                                            borderRadius: 10,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            background: applyMode === 'individual' ? 'var(--cue-accent)' : 'var(--cue-surface-2)',
                                            color: applyMode === 'individual' ? 'var(--cue-accent-ink)' : 'var(--cue-ink-2)',
                                            border: applyMode === 'individual' ? 'none' : '1px solid var(--cue-hairline)',
                                            opacity: (profiles.length === 0 || !allowIndividual) ? 0.4 : 1,
                                            cursor: (profiles.length === 0 || !allowIndividual) ? 'not-allowed' : 'pointer',
                                        }}
                                    >개인으로 신청</button>
                                    <button
                                        type="button"
                                        onClick={() => setApplyMode('team')}
                                        disabled={myTeams.length === 0 || !allowTeam}
                                        style={{
                                            flex: 1,
                                            padding: '10px 12px',
                                            borderRadius: 10,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            background: applyMode === 'team' ? 'var(--cue-accent)' : 'var(--cue-surface-2)',
                                            color: applyMode === 'team' ? 'var(--cue-accent-ink)' : 'var(--cue-ink-2)',
                                            border: applyMode === 'team' ? 'none' : '1px solid var(--cue-hairline)',
                                            opacity: (myTeams.length === 0 || !allowTeam) ? 0.4 : 1,
                                            cursor: (myTeams.length === 0 || !allowTeam) ? 'not-allowed' : 'pointer',
                                        }}
                                    >팀으로 신청</button>
                                </div>
                                {!allowIndividual && (
                                    <div style={{ marginTop: 8, fontSize: 11, color: 'var(--cue-ink-3)' }}>
                                        이 공고는 팀 단위로만 모집합니다.
                                    </div>
                                )}
                                {!allowTeam && (
                                    <div style={{ marginTop: 8, fontSize: 11, color: 'var(--cue-ink-3)' }}>
                                        이 공고는 개인 단위로만 모집합니다.
                                    </div>
                                )}
                                {allowTeam && myTeams.length === 0 && (
                                    <div style={{ marginTop: 8, fontSize: 11, color: 'var(--cue-ink-3)' }}>
                                        팀 신청은 본인이 리더인 팀이 있을 때 가능합니다.
                                    </div>
                                )}
                            </Field>
                        )}

                        {isReal && applyMode === 'individual' && profiles.length > 0 && (
                            <Field label="지원에 사용할 프로필">
                                <select
                                    value={selectedDancerId}
                                    onChange={(e) => setSelectedDancerId(e.target.value)}
                                    style={inputStyle}
                                    required
                                >
                                    {profiles.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.stage_name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        )}

                        {isReal && applyMode === 'team' && myTeams.length > 0 && (
                            <Field label="신청할 팀">
                                <select
                                    value={selectedTeamId}
                                    onChange={(e) => setSelectedTeamId(e.target.value)}
                                    style={inputStyle}
                                    required
                                >
                                    {myTeams.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </Field>
                        )}

                        <Field label="간단한 자기소개 / 메시지">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={5}
                                placeholder="활동명, 주요 경력, 지원 동기 등을 자유롭게 적어주세요"
                                style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
                                required
                            />
                        </Field>

                        <Field label="릴 / 포트폴리오 링크">
                            <input
                                type="url"
                                value={reel}
                                onChange={(e) => setReel(e.target.value)}
                                placeholder="https://www.instagram.com/reel/..."
                                style={inputStyle}
                            />
                        </Field>

                        {isReal && alreadyApplied && (
                            <div
                                style={{
                                    padding: 12,
                                    borderRadius: 12,
                                    background: 'var(--cue-warn, rgba(255,192,97,0.08))',
                                    border: '1px solid rgba(255,192,97,0.32)',
                                    fontSize: 12,
                                    color: 'var(--cue-warn)',
                                    lineHeight: 1.55,
                                }}
                            >
                                이미 이 프로필로 지원한 공고입니다. 기존 지원서는 마이페이지 &gt; 보낸 제안에서 확인하실 수 있어요.
                            </div>
                        )}

                        {submitError && (
                            <div
                                style={{
                                    padding: 12,
                                    borderRadius: 12,
                                    background: 'rgba(255, 122, 110, 0.08)',
                                    border: '1px solid rgba(255, 122, 110, 0.32)',
                                    fontSize: 12,
                                    color: 'var(--cue-bad)',
                                    lineHeight: 1.55,
                                }}
                            >
                                {submitError}
                            </div>
                        )}

                        {!isReal && (
                            <div
                                style={{
                                    padding: 12,
                                    borderRadius: 12,
                                    background: 'var(--cue-surface)',
                                    border: '1px dashed var(--cue-hairline)',
                                    fontSize: 11,
                                    color: 'var(--cue-ink-3)',
                                    lineHeight: 1.55,
                                }}
                            >
                                샘플 공고입니다. 백엔드 연동 후 클라이언트의 받은 제안함으로 발송됩니다.
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={
                                !message.trim() ||
                                submitting ||
                                (isReal && (alreadyApplied || !selectedDancerId))
                            }
                            style={{
                                padding: '14px 18px',
                                borderRadius: 999,
                                background:
                                    !message.trim() || submitting || (isReal && (alreadyApplied || !selectedDancerId))
                                        ? 'var(--cue-surface-2)'
                                        : 'var(--cue-accent)',
                                color:
                                    !message.trim() || submitting || (isReal && (alreadyApplied || !selectedDancerId))
                                        ? 'var(--cue-ink-3)'
                                        : 'var(--cue-accent-ink)',
                                fontWeight: 700,
                                fontSize: 14,
                                border: 'none',
                                cursor:
                                    !message.trim() || submitting || (isReal && (alreadyApplied || !selectedDancerId))
                                        ? 'not-allowed'
                                        : 'pointer',
                            }}
                        >
                            {submitting ? '보내는 중...' : '지원서 보내기'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

function SuccessBlock({
    onClose,
    casting,
    isReal,
}: {
    onClose: () => void
    casting: CastingMock
    isReal: boolean
}) {
    return (
        <div style={{ padding: 32, textAlign: 'center' }}>
            <div
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: 999,
                    background: 'var(--cue-accent-dim)',
                    color: 'var(--cue-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                }}
            >
                {Ico.check('currentColor', 28)}
            </div>
            <h3
                style={{
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: 'var(--cue-ink)',
                }}
            >
                {isReal ? '지원서가 전송되었습니다' : '지원 준비 완료'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--cue-ink-3)', marginTop: 8, lineHeight: 1.6 }}>
                {isReal ? (
                    <>
                        &quot;{casting.poster}&quot;님에게 지원서를 보냈습니다.
                        <br />
                        진행 상황은 마이페이지 &gt; 보낸 제안에서 확인할 수 있어요.
                    </>
                ) : (
                    <>
                        백엔드 연동 후 &quot;{casting.poster}&quot;에게
                        <br />
                        실제 지원서가 발송됩니다.
                    </>
                )}
            </p>
            <div
                style={{
                    marginTop: 24,
                    display: 'flex',
                    gap: 8,
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                }}
            >
                {isReal && (
                    <Link
                        href="/my/proposals?tab=outbox"
                        onClick={onClose}
                        style={{
                            padding: '12px 20px',
                            borderRadius: 999,
                            background: 'var(--cue-accent)',
                            color: 'var(--cue-accent-ink)',
                            border: 'none',
                            fontSize: 13,
                            fontWeight: 600,
                            textDecoration: 'none',
                        }}
                    >
                        보낸 제안 보기
                    </Link>
                )}
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        padding: '12px 20px',
                        borderRadius: 999,
                        background: 'var(--cue-surface-2)',
                        color: 'var(--cue-ink)',
                        border: '1px solid var(--cue-hairline)',
                        fontSize: 13,
                    }}
                >
                    닫기
                </button>
            </div>
        </div>
    )
}

function NeedsLoginBlock() {
    return (
        <div style={{ padding: 32, textAlign: 'center' }}>
            <div
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: 999,
                    background: 'var(--cue-surface-2)',
                    color: 'var(--cue-ink-3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    border: '1px solid var(--cue-hairline)',
                }}
            >
                {Ico.user('currentColor', 24)}
            </div>
            <h3
                style={{
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: 'var(--cue-ink)',
                }}
            >
                로그인이 필요해요
            </h3>
            <p style={{ fontSize: 13, color: 'var(--cue-ink-3)', marginTop: 8, lineHeight: 1.6 }}>
                지원하려면 먼저 로그인해주세요.
            </p>
            <Link
                href={`/auth/signin?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/casting')}`}
                style={{
                    display: 'inline-block',
                    marginTop: 20,
                    padding: '12px 22px',
                    borderRadius: 999,
                    background: 'var(--cue-accent)',
                    color: 'var(--cue-accent-ink)',
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                }}
            >
                로그인하기
            </Link>
        </div>
    )
}

function NeedsProfileBlock({ onClose }: { onClose: () => void }) {
    return (
        <div style={{ padding: 32, textAlign: 'center' }}>
            <div
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: 999,
                    background: 'var(--cue-surface-2)',
                    color: 'var(--cue-ink-3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    border: '1px solid var(--cue-hairline)',
                }}
            >
                {Ico.user('currentColor', 24)}
            </div>
            <h3
                style={{
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: 'var(--cue-ink)',
                }}
            >
                먼저 댄서 프로필이 필요해요
            </h3>
            <p style={{ fontSize: 13, color: 'var(--cue-ink-3)', marginTop: 8, lineHeight: 1.6 }}>
                내 프로필이 있어야 지원서를 보낼 수 있어요.
            </p>
            <div
                style={{
                    marginTop: 20,
                    display: 'flex',
                    gap: 8,
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                }}
            >
                <Link
                    href="/onboarding/create"
                    onClick={onClose}
                    style={{
                        padding: '12px 22px',
                        borderRadius: 999,
                        background: 'var(--cue-accent)',
                        color: 'var(--cue-accent-ink)',
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: 'none',
                    }}
                >
                    프로필 만들기
                </Link>
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        padding: '12px 22px',
                        borderRadius: 999,
                        background: 'var(--cue-surface-2)',
                        color: 'var(--cue-ink)',
                        border: '1px solid var(--cue-hairline)',
                        fontSize: 13,
                    }}
                >
                    나중에
                </button>
            </div>
        </div>
    )
}

function CannotApplyBlock({ onClose, message }: { onClose: () => void; message: string }) {
    return (
        <div style={{ padding: 32, textAlign: 'center' }}>
            <h3
                style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--cue-ink)',
                    letterSpacing: '-0.02em',
                }}
            >
                지원할 수 없는 공고입니다
            </h3>
            <p style={{ fontSize: 13, color: 'var(--cue-ink-3)', marginTop: 8, lineHeight: 1.6 }}>
                {message}
            </p>
            <button
                type="button"
                onClick={onClose}
                style={{
                    marginTop: 20,
                    padding: '12px 22px',
                    borderRadius: 999,
                    background: 'var(--cue-surface-2)',
                    color: 'var(--cue-ink)',
                    border: '1px solid var(--cue-hairline)',
                    fontSize: 13,
                }}
            >
                닫기
            </button>
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <div
                style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--cue-ink-2)',
                    marginBottom: 8,
                }}
            >
                {label}
            </div>
            {children}
        </div>
    )
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 12,
    background: 'var(--cue-surface)',
    border: '1px solid var(--cue-hairline)',
    color: 'var(--cue-ink)',
    fontSize: 13,
    outline: 'none',
    fontFamily: 'inherit',
}
