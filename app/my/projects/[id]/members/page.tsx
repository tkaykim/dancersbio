'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import {
    fetchProjectMembers,
    fetchMyProjectRole,
    addProjectMember,
    updateProjectMemberRole,
    removeProjectMember,
    findUserByEmail,
    canManage,
    isOwner,
} from '@/lib/project-members'
import type { ProjectMember, ProjectMemberRole } from '@/lib/types'
import { PROJECT_MEMBER_ROLE_LABELS } from '@/lib/types'
import { ArrowLeft, Loader2, UserPlus, X, Search, Shield, Eye, Crown } from 'lucide-react'
import { useBackWithFallback } from '@/lib/useBackWithFallback'

export default function ProjectMembersPage() {
    const { id: projectId } = useParams<{ id: string }>()
    const { user, loading: authLoading } = useAuth()
    const handleBack = useBackWithFallback(projectId ? `/my/projects/${projectId}` : '/my/projects')

    const [projectTitle, setProjectTitle] = useState('')
    const [members, setMembers] = useState<ProjectMember[]>([])
    const [myRole, setMyRole] = useState<ProjectMemberRole | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // 추가 폼
    const [emailInput, setEmailInput] = useState('')
    const [foundUser, setFoundUser] = useState<{ id: string; name: string | null; email: string | null } | null>(null)
    const [searching, setSearching] = useState(false)
    const [newRole, setNewRole] = useState<'manager' | 'viewer'>('manager')
    const [adding, setAdding] = useState(false)
    const [searchHint, setSearchHint] = useState<string | null>(null)

    const load = useCallback(async () => {
        if (!user || !projectId) return
        setLoading(true)
        setError(null)
        try {
            const { data: proj } = await supabase
                .from('projects')
                .select('id, title')
                .eq('id', projectId)
                .single()
            if (proj) setProjectTitle(proj.title)

            const [list, role] = await Promise.all([
                fetchProjectMembers(projectId),
                fetchMyProjectRole(projectId, user.id),
            ])
            setMembers(list)
            setMyRole(role)
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : '멤버 정보를 불러오지 못했습니다.')
        } finally {
            setLoading(false)
        }
    }, [user, projectId])

    useEffect(() => {
        load()
    }, [load])

    const handleSearchUser = async () => {
        setSearchHint(null)
        setFoundUser(null)
        if (!emailInput.trim()) return
        setSearching(true)
        try {
            const u = await findUserByEmail(emailInput)
            if (!u) {
                setSearchHint('해당 이메일의 가입자를 찾지 못했습니다.')
            } else if (members.find((m) => m.user_id === u.id)) {
                setSearchHint('이미 멤버로 추가된 사용자입니다.')
            } else {
                setFoundUser(u)
            }
        } catch (e: unknown) {
            setSearchHint(e instanceof Error ? e.message : '검색 중 오류')
        } finally {
            setSearching(false)
        }
    }

    const handleAddMember = async () => {
        if (!user || !projectId || !foundUser) return
        setAdding(true)
        try {
            await addProjectMember({
                projectId,
                userId: foundUser.id,
                role: newRole,
                addedBy: user.id,
            })
            setEmailInput('')
            setFoundUser(null)
            setSearchHint(null)
            await load()
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : '멤버 추가 실패')
        } finally {
            setAdding(false)
        }
    }

    const handleChangeRole = async (
        memberId: string,
        nextRole: 'manager' | 'viewer',
    ) => {
        try {
            await updateProjectMemberRole({ memberId, role: nextRole })
            await load()
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : '역할 변경 실패')
        }
    }

    const handleRemove = async (memberId: string) => {
        if (!confirm('정말 이 멤버를 제거하시겠습니까?')) return
        try {
            await removeProjectMember(memberId)
            await load()
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : '멤버 제거 실패')
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cue-bg)' }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--cue-accent)' }} />
            </div>
        )
    }

    const iAmOwner = isOwner(myRole)
    const iCanManage = canManage(myRole)

    return (
        <div className="min-h-screen pb-nav-safe" style={{ background: 'var(--cue-bg)', color: 'var(--cue-ink)' }}>
            <header className="sticky top-0 z-40 pt-header-safe" style={{
                background: 'rgba(14,14,12,0.92)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                borderBottom: '0.5px solid var(--cue-hairline-2)',
            }}>
                <div className="flex items-center gap-3 px-4 py-3">
                    <button onClick={handleBack} className="p-1 -ml-1" aria-label="뒤로">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px]" style={{ color: 'var(--cue-ink-3)' }}>프로젝트 멤버</div>
                        <div className="text-base font-bold truncate">{projectTitle}</div>
                    </div>
                </div>
            </header>

            <main className="px-4 py-4 max-w-[480px] mx-auto">
                {error && (
                    <div className="mb-3 p-3 rounded-cue-2 text-sm" style={{ background: 'rgba(255,122,110,0.12)', color: 'var(--cue-bad)' }}>
                        {error}
                    </div>
                )}

                {/* 멤버 목록 */}
                <section>
                    <div className="cue-eyebrow mb-2">현재 멤버 ({members.length})</div>
                    <ul className="flex flex-col gap-2">
                        {members.map((m) => {
                            const isMe = m.user_id === user?.id
                            const isMemberOwner = m.role === 'owner'
                            return (
                                <li
                                    key={m.id}
                                    className="flex items-center gap-3 p-3 rounded-cue-2"
                                    style={{ background: 'var(--cue-surface)', border: '0.5px solid var(--cue-hairline)' }}
                                >
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--cue-surface-3)' }}>
                                        {isMemberOwner ? <Crown className="w-4 h-4" /> : m.role === 'manager' ? <Shield className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold truncate">
                                            {m.user?.name || m.user?.email || m.user_id.slice(0, 8)}
                                            {isMe && <span className="ml-1 text-[10px]" style={{ color: 'var(--cue-ink-3)' }}>(나)</span>}
                                        </div>
                                        <div className="text-[11px]" style={{ color: 'var(--cue-ink-3)' }}>
                                            {PROJECT_MEMBER_ROLE_LABELS[m.role]} · {m.user?.email ?? ''}
                                        </div>
                                    </div>

                                    {/* 액션: owner만 변경/제거 */}
                                    {iAmOwner && !isMemberOwner && (
                                        <div className="flex items-center gap-1">
                                            <select
                                                value={m.role}
                                                onChange={(e) => handleChangeRole(m.id, e.target.value as 'manager' | 'viewer')}
                                                className="text-xs px-2 py-1 rounded-cue-1"
                                                style={{ background: 'var(--cue-surface-2)', color: 'var(--cue-ink)', border: '0.5px solid var(--cue-hairline)' }}
                                            >
                                                <option value="manager">운영자</option>
                                                <option value="viewer">열람자</option>
                                            </select>
                                            <button
                                                onClick={() => handleRemove(m.id)}
                                                className="p-1.5 rounded-cue-1"
                                                style={{ color: 'var(--cue-bad)' }}
                                                aria-label="제거"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    {/* 본인 self-leave (owner 제외) */}
                                    {!iAmOwner && isMe && !isMemberOwner && (
                                        <button
                                            onClick={() => handleRemove(m.id)}
                                            className="text-xs px-2 py-1 rounded-cue-1"
                                            style={{ color: 'var(--cue-bad)', border: '0.5px solid var(--cue-hairline)' }}
                                        >
                                            나가기
                                        </button>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                </section>

                {/* 멤버 추가 (owner만) */}
                {iAmOwner && (
                    <section className="mt-6">
                        <div className="cue-eyebrow mb-2">멤버 추가</div>
                        <div className="p-3 rounded-cue-2" style={{ background: 'var(--cue-surface)', border: '0.5px solid var(--cue-hairline)' }}>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    placeholder="이메일로 검색"
                                    className="flex-1 px-3 py-2 text-sm rounded-cue-1"
                                    style={{ background: 'var(--cue-surface-2)', color: 'var(--cue-ink)', border: '0.5px solid var(--cue-hairline)' }}
                                />
                                <button
                                    onClick={handleSearchUser}
                                    disabled={searching || !emailInput.trim()}
                                    className="px-3 py-2 rounded-cue-1 text-sm font-semibold disabled:opacity-40"
                                    style={{ background: 'var(--cue-surface-3)', color: 'var(--cue-ink)' }}
                                >
                                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                </button>
                            </div>
                            {searchHint && (
                                <div className="mt-2 text-xs" style={{ color: 'var(--cue-ink-3)' }}>{searchHint}</div>
                            )}
                            {foundUser && (
                                <div className="mt-3 flex items-center gap-2">
                                    <div className="flex-1 text-sm">
                                        <div className="font-semibold">{foundUser.name || foundUser.email}</div>
                                        <div className="text-[11px]" style={{ color: 'var(--cue-ink-3)' }}>{foundUser.email}</div>
                                    </div>
                                    <select
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value as 'manager' | 'viewer')}
                                        className="text-xs px-2 py-1.5 rounded-cue-1"
                                        style={{ background: 'var(--cue-surface-2)', color: 'var(--cue-ink)', border: '0.5px solid var(--cue-hairline)' }}
                                    >
                                        <option value="manager">운영자</option>
                                        <option value="viewer">열람자</option>
                                    </select>
                                    <button
                                        onClick={handleAddMember}
                                        disabled={adding}
                                        className="px-3 py-1.5 rounded-cue-1 text-xs font-bold disabled:opacity-40"
                                        style={{ background: 'var(--cue-accent)', color: 'var(--cue-accent-ink)' }}
                                    >
                                        {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="mt-2 text-[11px] leading-relaxed" style={{ color: 'var(--cue-ink-3)' }}>
                            <strong style={{ color: 'var(--cue-ink-2)' }}>운영자</strong>: 프로젝트 수정·지원자 승인·다이렉트 제안 발송 가능 (정산 책임은 책임자에게).<br />
                            <strong style={{ color: 'var(--cue-ink-2)' }}>열람자</strong>: 프로젝트와 지원자 현황 조회만 가능.
                        </p>
                    </section>
                )}

                {!iCanManage && (
                    <p className="mt-6 text-xs" style={{ color: 'var(--cue-ink-3)' }}>
                        이 페이지는 열람만 가능합니다. 멤버 변경 권한은 책임자에게 있습니다.
                    </p>
                )}
            </main>
        </div>
    )
}
