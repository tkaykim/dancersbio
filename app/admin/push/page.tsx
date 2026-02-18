'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { supabase } from '@/lib/supabase'
import { Loader2, Bell, Send, Smartphone, AlertCircle, MessageSquare, FileCheck, XCircle, CheckCircle, ImagePlus, Type } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

interface TokenRow {
    id: string
    user_id: string
    token: string
    platform: string
    created_at: string | null
    updated_at: string | null
    userEmail?: string | null
    userName?: string | null
}

export default function AdminPushPage() {
    const { isAdmin } = useAdmin()
    const [tokens, setTokens] = useState<TokenRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sending, setSending] = useState(false)
    const [sendResult, setSendResult] = useState<{ ok: boolean; message: string } | null>(null)
    const [form, setForm] = useState({
        title: '테스트 알림',
        body: '푸시가 정상 동작합니다.',
        targetType: 'all' as 'all' | 'user' | 'token',
        targetUserId: '',
        targetToken: '',
        messageType: 'short' as 'short' | 'long' | 'image',
        imageUrl: '' as string,
    })
    const [imageUploading, setImageUploading] = useState(false)
    const [scenarioTarget, setScenarioTarget] = useState<'me' | 'user'>('me')
    const [scenarioTargetUserId, setScenarioTargetUserId] = useState('')
    const [scenarioSending, setScenarioSending] = useState<string | null>(null)
    const [scenarioResult, setScenarioResult] = useState<{ scenario: string; ok: boolean; message: string } | null>(null)

    const fetchTokens = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const { data: rows, error: e } = await supabase
                .from('push_tokens')
                .select('id, user_id, token, platform, created_at, updated_at')
                .order('updated_at', { ascending: false })
            if (e) throw e
            const list = (rows ?? []) as TokenRow[]
            const userIds = [...new Set(list.map((r) => r.user_id))]
            let userMap: Record<string, { email: string | null; name: string | null }> = {}
            if (userIds.length > 0) {
                const { data: users } = await supabase.from('users').select('id, email, name').in('id', userIds)
                userMap = (users ?? []).reduce(
                    (acc, u: { id: string; email: string | null; name: string | null }) => {
                        acc[u.id] = { email: u.email ?? null, name: u.name ?? null }
                        return acc
                    },
                    {} as Record<string, { email: string | null; name: string | null }>
                )
            }
            setTokens(
                list.map((t) => ({
                    ...t,
                    userEmail: userMap[t.user_id]?.email ?? null,
                    userName: userMap[t.user_id]?.name ?? null,
                }))
            )
        } catch (err) {
            setError(err instanceof Error ? err.message : '토큰 목록을 불러올 수 없습니다.')
            setTokens([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (isAdmin) fetchTokens()
    }, [isAdmin, fetchTokens])

    const totalTokens = tokens.length
    const memberCount = new Set(tokens.map((t) => t.user_id)).size
    const byPlatform = tokens.reduce(
        (acc, t) => {
            const p = (t.platform || 'unknown').toLowerCase()
            acc[p] = (acc[p] || 0) + 1
            return acc
        },
        {} as Record<string, number>
    )
    const platformLabels: Record<string, string> = { android: 'Android', ios: 'iOS', web: 'Web', unknown: '기타' }

    const sendTest = async () => {
        setSending(true)
        setSendResult(null)
        const { data: { session } } = await supabase.auth.getSession()
        const authToken = session?.access_token ?? SUPABASE_ANON_KEY

        const body: { title: string; body: string; user_id?: string; token?: string; image?: string } = {
            title: form.title,
            body: form.body,
        }
        if (form.targetType === 'user' && form.targetUserId) body.user_id = form.targetUserId
        else if (form.targetType === 'token' && form.targetToken.trim()) body.token = form.targetToken.trim()
        if (form.messageType === 'image' && form.imageUrl.trim()) body.image = form.imageUrl.trim()

        try {
            const res = await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                    apikey: SUPABASE_ANON_KEY,
                },
                body: JSON.stringify(body),
            })
            const data = await res.json().catch(() => ({}))
            if (res.ok) {
                const sent = data.sent ?? 0
                const total = data.total ?? 0
                const results = (data.results ?? []) as { ok?: boolean; error?: string }[]
                const failed = results.filter((r) => !r.ok)
                const firstError = failed[0]?.error
                let message = `발송 완료: ${sent}건 (대상 ${total}건)`
                if (sent === 0 && total > 0 && firstError) {
                    message += ` — 실패 사유: ${firstError}`
                }
                setSendResult({
                    ok: sent > 0,
                    message,
                })
            } else {
                setSendResult({
                    ok: false,
                    message: data?.error ?? res.statusText ?? '발송 실패',
                })
            }
        } catch (e) {
            setSendResult({ ok: false, message: e instanceof Error ? e.message : '네트워크 오류' })
        }
        setSending(false)
    }

    const SCENARIOS: { key: string; label: string }[] = [
        { key: 'proposal_created', label: '새 제안 도착' },
        { key: 'proposal_accepted', label: '제안 수락' },
        { key: 'proposal_declined', label: '제안 거절' },
        { key: 'negotiation_message', label: '협상 메시지' },
        { key: 'project_status_changed', label: '프로젝트 상태 변경' },
    ]

    const sendScenarioTest = async (scenarioKey: string) => {
        setScenarioResult(null)
        setScenarioSending(scenarioKey)
        const { data: { session } } = await supabase.auth.getSession()
        const authToken = session?.access_token ?? SUPABASE_ANON_KEY
        const body: { scenario: string; user_id?: string } = { scenario: scenarioKey }
        if (scenarioTarget === 'user' && scenarioTargetUserId) body.user_id = scenarioTargetUserId

        try {
            const res = await fetch(`${SUPABASE_URL}/functions/v1/test-push-scenario`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                    apikey: SUPABASE_ANON_KEY,
                },
                body: JSON.stringify(body),
            })
            const data = await res.json().catch(() => ({}))
            if (res.ok && (data as { ok?: boolean }).ok) {
                setScenarioResult({
                    scenario: scenarioKey,
                    ok: true,
                    message: `발송 완료: ${(data as { sent?: number }).sent ?? 0}건`,
                })
            } else {
                setScenarioResult({
                    scenario: scenarioKey,
                    ok: false,
                    message: (data as { error?: string }).error ?? res.statusText ?? '실패',
                })
            }
        } catch (e) {
            setScenarioResult({
                scenario: scenarioKey,
                ok: false,
                message: e instanceof Error ? e.message : '네트워크 오류',
            })
        }
        setScenarioSending(null)
    }

    if (!isAdmin) return null

    const uniqueUsersForSelect = tokens.reduce((acc: TokenRow[], t) => {
        if (!acc.some((x) => x.user_id === t.user_id)) acc.push(t)
        return acc
    }, [])

    return (
        <div className="w-full space-y-6">
            <AdminPageHeader title="푸시 관리" description="FCM 토큰 현황과 앱 푸시 테스트입니다." />

            {error && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2 text-amber-200 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : (
                <>
                    {/* 통계 카드 - PC에서 한 줄로 */}
                    <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                            <p className="text-xs text-white/50 mb-1">총 토큰 수</p>
                            <p className="text-2xl md:text-3xl font-bold text-primary">{totalTokens}</p>
                            <p className="text-xs text-white/40 mt-1">등록 기기</p>
                        </div>
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                            <p className="text-xs text-white/50 mb-1">푸시 연결 회원</p>
                            <p className="text-2xl md:text-3xl font-bold text-white">{memberCount}</p>
                            <p className="text-xs text-white/40 mt-1">명</p>
                        </div>
                        {(['android', 'ios', 'web'] as const).map((p) => (
                            <div key={p} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                                <p className="text-xs text-white/50 mb-1 flex items-center gap-1">
                                    <Smartphone className="w-3 h-3" />
                                    {platformLabels[p] ?? p}
                                </p>
                                <p className="text-2xl md:text-3xl font-bold text-white/90">{byPlatform[p] ?? 0}</p>
                            </div>
                        ))}
                    </section>

                    {/* PC: 기기 목록 + 테스트 발송 2단 */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* 토큰 목록 - 2/3 너비 */}
                        <section className="xl:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                            <h3 className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
                                <Bell className="w-4 h-4" />
                                등록된 기기 목록
                            </h3>
                            {tokens.length === 0 ? (
                                <p className="text-sm text-white/50">등록된 푸시 토큰이 없습니다.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm min-w-[500px]">
                                        <thead>
                                            <tr className="text-white/50 border-b border-neutral-800 text-left">
                                                <th className="py-2.5 px-3 font-medium">회원</th>
                                                <th className="py-2.5 px-3 font-medium">플랫폼</th>
                                                <th className="py-2.5 px-3 font-medium">토큰(앞부분)</th>
                                                <th className="py-2.5 px-3 font-medium">최종 갱신</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tokens.map((t) => (
                                                <tr key={t.id} className="border-b border-neutral-800/50 hover:bg-white/5">
                                                    <td className="py-2.5 px-3 text-white/90">
                                                        {t.userEmail ?? t.userName ?? t.user_id.slice(0, 8)}
                                                    </td>
                                                    <td className="py-2.5 px-3 capitalize text-white/70">{platformLabels[t.platform] ?? t.platform}</td>
                                                    <td className="py-2.5 px-3 text-white/40 font-mono text-xs">
                                                        {t.token ? `${t.token.slice(0, 20)}...` : '—'}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-white/50 text-xs">
                                                        {t.updated_at ? new Date(t.updated_at).toLocaleString('ko') : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        {/* 테스트 발송 - 1/3 너비, PC에서 고정 */}
                        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 xl:sticky xl:top-24 xl:self-start">
                        <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            앱 푸시 테스트
                        </h3>
                        <div className="space-y-3">
                            {/* 메시지 유형 */}
                            <div>
                                <p className="text-xs text-white/50 mb-2">메시지 유형</p>
                                <div className="flex flex-wrap gap-2">
                                    <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="messageType"
                                            checked={form.messageType === 'short'}
                                            onChange={() => setForm({ ...form, messageType: 'short', imageUrl: '' })}
                                            className="rounded border-neutral-600"
                                        />
                                        <Type className="w-4 h-4" />
                                        짧은 메시지
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="messageType"
                                            checked={form.messageType === 'long'}
                                            onChange={() => setForm({ ...form, messageType: 'long', imageUrl: '' })}
                                            className="rounded border-neutral-600"
                                        />
                                        <MessageSquare className="w-4 h-4" />
                                        긴 메시지
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="messageType"
                                            checked={form.messageType === 'image'}
                                            onChange={() => setForm({ ...form, messageType: 'image' })}
                                            className="rounded border-neutral-600"
                                        />
                                        <ImagePlus className="w-4 h-4" />
                                        사진 첨부
                                    </label>
                                </div>
                            </div>
                            <input
                                type="text"
                                placeholder="제목"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary text-sm"
                            />
                            <textarea
                                placeholder={
                                    form.messageType === 'short'
                                        ? '짧은 메시지 (한 줄 권장, 알림 미리보기에 적합)'
                                        : form.messageType === 'long'
                                          ? '긴 메시지 (여러 줄 가능, 확장 시 전체 내용 표시)'
                                          : '내용 (선택)'
                                }
                                value={form.body}
                                onChange={(e) => setForm({ ...form, body: e.target.value })}
                                rows={form.messageType === 'long' ? 4 : 2}
                                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary resize-none text-sm"
                            />
                            {form.messageType === 'image' && (
                                <div className="space-y-2">
                                    <p className="text-xs text-white/50">알림에 표시할 이미지 (JPEG/PNG/GIF/WebP, 최대 5MB)</p>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        className="w-full text-sm text-white/70 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-black file:font-medium"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0]
                                            if (!file) return
                                            setImageUploading(true)
                                            try {
                                                const name = `push-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
                                                const { data, error } = await supabase.storage
                                                    .from('push-assets')
                                                    .upload(name, file, { cacheControl: '3600', upsert: false })
                                                if (error) throw error
                                                const { data: urlData } = supabase.storage.from('push-assets').getPublicUrl(data.path)
                                                setForm((f) => ({ ...f, imageUrl: urlData.publicUrl }))
                                            } catch (err) {
                                                alert(err instanceof Error ? err.message : '이미지 업로드 실패')
                                            } finally {
                                                setImageUploading(false)
                                                e.target.value = ''
                                            }
                                        }}
                                    />
                                    {form.imageUrl && (
                                        <p className="text-xs text-primary truncate" title={form.imageUrl}>
                                            ✓ 이미지 업로드됨
                                        </p>
                                    )}
                                    {imageUploading && (
                                        <p className="text-xs text-white/50 flex items-center gap-1">
                                            <Loader2 className="w-3 h-3 animate-spin" /> 업로드 중...
                                        </p>
                                    )}
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                                <label className="flex items-center gap-2 text-sm text-white/80">
                                    <input
                                        type="radio"
                                        name="targetType"
                                        checked={form.targetType === 'all'}
                                        onChange={() => setForm({ ...form, targetType: 'all' })}
                                        className="rounded border-neutral-600"
                                    />
                                    전체
                                </label>
                                <label className="flex items-center gap-2 text-sm text-white/80">
                                    <input
                                        type="radio"
                                        name="targetType"
                                        checked={form.targetType === 'user'}
                                        onChange={() => setForm({ ...form, targetType: 'user' })}
                                        className="rounded border-neutral-600"
                                    />
                                    특정 회원
                                </label>
                                <label className="flex items-center gap-2 text-sm text-white/80">
                                    <input
                                        type="radio"
                                        name="targetType"
                                        checked={form.targetType === 'token'}
                                        onChange={() => setForm({ ...form, targetType: 'token' })}
                                        className="rounded border-neutral-600"
                                    />
                                    FCM 토큰 직접 입력
                                </label>
                            </div>
                            {form.targetType === 'user' && (
                                <select
                                    value={form.targetUserId}
                                    onChange={(e) => setForm({ ...form, targetUserId: e.target.value })}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary text-sm"
                                >
                                    <option value="">회원 선택</option>
                                    {uniqueUsersForSelect.map((t) => (
                                        <option key={t.user_id} value={t.user_id}>
                                            {t.userEmail ?? t.userName ?? t.user_id.slice(0, 8)}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {form.targetType === 'token' && (
                                <input
                                    type="text"
                                    placeholder="FCM 토큰 (테스트용)"
                                    value={form.targetToken}
                                    onChange={(e) => setForm({ ...form, targetToken: e.target.value })}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary text-sm font-mono"
                                />
                            )}
                            <button
                                type="button"
                                onClick={sendTest}
                                disabled={
                                    sending ||
                                    !form.title.trim() ||
                                    (form.targetType === 'user' && !form.targetUserId) ||
                                    (form.targetType === 'token' && !form.targetToken.trim())
                                }
                                className="w-full py-3 bg-primary text-black font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                테스트 발송
                            </button>
                            {sendResult && (
                                <p className={sendResult.ok ? 'text-sm text-primary' : 'text-sm text-red-400'}>
                                    {sendResult.message}
                                </p>
                            )}
                        </div>
                        </section>
                    </div>

                    {/* 시나리오별 테스트 */}
                    <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            시나리오별 알림 테스트
                        </h3>
                        <p className="text-xs text-white/50 mb-4">
                            실제 발송되는 알림 문구로 선택한 대상에게 테스트 푸시를 보냅니다.
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <label className="flex items-center gap-2 text-sm text-white/80">
                                <input
                                    type="radio"
                                    name="scenarioTarget"
                                    checked={scenarioTarget === 'me'}
                                    onChange={() => setScenarioTarget('me')}
                                    className="rounded border-neutral-600"
                                />
                                나에게
                            </label>
                            <label className="flex items-center gap-2 text-sm text-white/80">
                                <input
                                    type="radio"
                                    name="scenarioTarget"
                                    checked={scenarioTarget === 'user'}
                                    onChange={() => setScenarioTarget('user')}
                                    className="rounded border-neutral-600"
                                />
                                특정 회원
                            </label>
                            {scenarioTarget === 'user' && (
                                <select
                                    value={scenarioTargetUserId}
                                    onChange={(e) => setScenarioTargetUserId(e.target.value)}
                                    className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                                >
                                    <option value="">회원 선택</option>
                                    {uniqueUsersForSelect.map((t) => (
                                        <option key={t.user_id} value={t.user_id}>
                                            {t.userEmail ?? t.userName ?? t.user_id.slice(0, 8)}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {SCENARIOS.map((s) => (
                                <button
                                    key={s.key}
                                    type="button"
                                    onClick={() => sendScenarioTest(s.key)}
                                    disabled={
                                        scenarioSending !== null ||
                                        (scenarioTarget === 'user' && !scenarioTargetUserId)
                                    }
                                    className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-sm text-white/90 flex items-center gap-2 disabled:opacity-50 transition"
                                >
                                    {scenarioSending === s.key ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : s.key === 'proposal_created' ? (
                                        <Bell className="w-4 h-4" />
                                    ) : s.key === 'proposal_accepted' ? (
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                    ) : s.key === 'proposal_declined' ? (
                                        <XCircle className="w-4 h-4 text-red-400" />
                                    ) : s.key === 'negotiation_message' ? (
                                        <MessageSquare className="w-4 h-4" />
                                    ) : (
                                        <FileCheck className="w-4 h-4" />
                                    )}
                                    {s.label}
                                </button>
                            ))}
                        </div>
                        {scenarioResult && (
                            <p
                                className={
                                    scenarioResult.ok
                                        ? 'mt-3 text-sm text-primary'
                                        : 'mt-3 text-sm text-red-400'
                                }
                            >
                                {scenarioResult.ok ? '✓ ' : '✗ '}
                                {scenarioResult.message}
                            </p>
                        )}
                    </section>
                </>
            )}
        </div>
    )
}
