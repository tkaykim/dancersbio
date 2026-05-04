'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Loader2, CheckCircle, Pause, Play, XCircle, Wallet } from 'lucide-react'
import {
    type SettlementStatus,
    SETTLEMENT_STATUS_LABELS,
    SETTLEMENT_STATUS_COLORS,
} from '@/lib/settlement-logic'

interface AdminSettlementRow {
    id: string
    proposal_id: string
    amount: number
    status: SettlementStatus
    scheduled_due_date: string | null
    paid_at: string | null
    paid_by: string | null
    reference_no: string | null
    payer_note: string | null
    created_at: string
    updated_at: string
    proposal: {
        id: string
        fee: number | null
        role: string | null
        status: string
        sender_id: string
        dancer: {
            id: string
            stage_name: string
        } | null
        project: {
            id: string
            title: string
            payment_due_date: string | null
            clients: { company_name: string | null } | null
        } | null
        sender: { name: string | null; email: string | null } | null
    }
}

const STATUS_ORDER: SettlementStatus[] = ['scheduled', 'in_progress', 'on_hold', 'paid', 'cancelled']

export default function AdminSettlementsPage() {
    const { user } = useAuth()
    const [rows, setRows] = useState<AdminSettlementRow[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<SettlementStatus | 'all'>('all')
    const [actingId, setActingId] = useState<string | null>(null)

    const fetchRows = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('proposal_settlements')
            .select(`
                id, proposal_id, amount, status, scheduled_due_date,
                paid_at, paid_by, reference_no, payer_note, created_at, updated_at,
                proposal:proposals!inner (
                    id, fee, role, status, sender_id,
                    dancer:dancers!inner (id, stage_name),
                    project:projects!inner (
                        id, title, payment_due_date,
                        clients (company_name)
                    ),
                    sender:users!sender_id (name, email)
                )
            `)
            .order('scheduled_due_date', { ascending: true, nullsFirst: false })
            .order('created_at', { ascending: false })

        if (error) {
            console.error('정산 목록 조회 실패:', error)
            setRows([])
        } else {
            setRows((data as unknown as AdminSettlementRow[]) || [])
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchRows()
    }, [fetchRows])

    const filtered = useMemo(() => {
        if (statusFilter === 'all') return rows
        return rows.filter(r => r.status === statusFilter)
    }, [rows, statusFilter])

    const counts = useMemo(() => {
        const c: Record<SettlementStatus | 'all', number> = {
            all: rows.length, scheduled: 0, in_progress: 0, paid: 0, on_hold: 0, cancelled: 0,
        }
        for (const r of rows) c[r.status] += 1
        return c
    }, [rows])

    const totalScheduled = useMemo(() =>
        rows.filter(r => r.status === 'scheduled' || r.status === 'in_progress')
            .reduce((s, r) => s + (r.amount || 0), 0)
    , [rows])

    const totalPaid = useMemo(() =>
        rows.filter(r => r.status === 'paid').reduce((s, r) => s + (r.amount || 0), 0)
    , [rows])

    const handleStatusChange = async (id: string, next: SettlementStatus) => {
        if (!user) return
        if (next === 'paid') {
            const ref = window.prompt('지급 참조번호(송금 참조 등) — 선택 입력', '')
            if (ref === null) return
            setActingId(id)
            const { error } = await supabase
                .from('proposal_settlements')
                .update({
                    status: 'paid',
                    paid_at: new Date().toISOString(),
                    paid_by: user.id,
                    reference_no: ref || null,
                })
                .eq('id', id)
            setActingId(null)
            if (error) {
                alert('지급 처리에 실패했습니다: ' + error.message)
            } else {
                await fetchRows()
            }
            return
        }
        if (!confirm(`이 항목을 "${SETTLEMENT_STATUS_LABELS[next]}"(으)로 변경하시겠습니까?`)) return
        setActingId(id)
        const updates: Record<string, unknown> = { status: next }
        // paid에서 다른 상태로 되돌리는 경우 paid_at/paid_by 유지(이력 보존). 단순 status만 변경.
        const { error } = await supabase.from('proposal_settlements').update(updates).eq('id', id)
        setActingId(null)
        if (error) {
            alert('상태 변경에 실패했습니다: ' + error.message)
        } else {
            await fetchRows()
        }
    }

    return (
        <div className="space-y-4">
            <header className="flex items-center gap-3 flex-wrap">
                <Wallet className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold text-white">정산 처리</h1>
                <p className="text-xs text-white/40 ml-2">
                    플랫폼이 댄서들에게 지급할 정산 레코드 관리
                </p>
            </header>

            {/* 요약 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SummaryCard label="지급 예정/처리중 합계" value={totalScheduled.toLocaleString() + '원'} accent="text-yellow-400" />
                <SummaryCard label="지급 완료 합계" value={totalPaid.toLocaleString() + '원'} accent="text-green-500" />
                <SummaryCard label="예정 건수" value={`${counts.scheduled}건`} accent="text-yellow-400" />
                <SummaryCard label="완료 건수" value={`${counts.paid}건`} accent="text-green-500" />
            </div>

            {/* 필터 */}
            <div className="flex items-center gap-2 flex-wrap">
                <FilterChip label={`전체 (${counts.all})`} active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
                {STATUS_ORDER.map(s => (
                    <FilterChip
                        key={s}
                        label={`${SETTLEMENT_STATUS_LABELS[s]} (${counts[s]})`}
                        active={statusFilter === s}
                        onClick={() => setStatusFilter(s)}
                        colorClass={SETTLEMENT_STATUS_COLORS[s]}
                    />
                ))}
            </div>

            {/* 목록 */}
            {loading ? (
                <div className="py-20 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-white/40 text-sm">표시할 정산 레코드가 없습니다.</div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(row => (
                        <SettlementRow
                            key={row.id}
                            row={row}
                            acting={actingId === row.id}
                            onChange={handleStatusChange}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent: string }) {
    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
            <p className="text-[11px] text-white/40">{label}</p>
            <p className={`text-lg font-bold mt-0.5 ${accent}`}>{value}</p>
        </div>
    )
}

function FilterChip({
    label,
    active,
    onClick,
    colorClass,
}: {
    label: string
    active: boolean
    onClick: () => void
    colorClass?: string
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                active ? 'bg-primary/20 text-primary ring-1 ring-primary/40' : colorClass || 'bg-neutral-800 text-white/50 hover:text-white/80'
            }`}
        >
            {label}
        </button>
    )
}

function SettlementRow({
    row,
    acting,
    onChange,
}: {
    row: AdminSettlementRow
    acting: boolean
    onChange: (id: string, next: SettlementStatus) => Promise<void>
}) {
    const dancer = row.proposal.dancer
    const project = row.proposal.project
    const sender = row.proposal.sender
    const statusColor = SETTLEMENT_STATUS_COLORS[row.status]
    const statusLabel = SETTLEMENT_STATUS_LABELS[row.status]

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 md:p-4 space-y-2">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${statusColor}`}>
                            {statusLabel}
                        </span>
                        {row.scheduled_due_date && (
                            <span className="text-[11px] text-emerald-400/70">지급 예정 {row.scheduled_due_date}</span>
                        )}
                        {row.paid_at && (
                            <span className="text-[11px] text-green-500/80">지급 {new Date(row.paid_at).toLocaleString('ko-KR')}</span>
                        )}
                    </div>
                    <p className="text-sm font-bold text-white mt-1.5 truncate">
                        {project?.title || '(프로젝트 정보 없음)'}
                    </p>
                    <p className="text-[11px] text-white/40">
                        {project?.clients?.company_name && <span>{project.clients.company_name} · </span>}
                        받는 댄서: <span className="text-white/70">{dancer?.stage_name || '?'}</span>
                        {sender?.name && <> · 보낸이: <span className="text-white/70">{sender.name}</span></>}
                        {row.proposal.role && <> · {row.proposal.role}</>}
                    </p>
                    {row.reference_no && (
                        <p className="text-[10px] text-white/30 mt-0.5">참조 #{row.reference_no}</p>
                    )}
                </div>
                <div className="text-right shrink-0">
                    <p className="text-base font-bold text-primary">{row.amount.toLocaleString()}원</p>
                    {row.proposal.fee != null && row.proposal.fee !== row.amount && (
                        <p className="text-[10px] text-orange-400/60">현재 fee {row.proposal.fee.toLocaleString()}원</p>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-800/60">
                {row.status !== 'paid' && (
                    <ActionButton
                        onClick={() => onChange(row.id, 'paid')}
                        disabled={acting}
                        icon={<CheckCircle className="w-3 h-3" />}
                        label="지급 완료"
                        variant="primary"
                    />
                )}
                {row.status !== 'in_progress' && row.status !== 'paid' && row.status !== 'cancelled' && (
                    <ActionButton
                        onClick={() => onChange(row.id, 'in_progress')}
                        disabled={acting}
                        icon={<Play className="w-3 h-3" />}
                        label="처리중"
                    />
                )}
                {row.status !== 'on_hold' && row.status !== 'paid' && row.status !== 'cancelled' && (
                    <ActionButton
                        onClick={() => onChange(row.id, 'on_hold')}
                        disabled={acting}
                        icon={<Pause className="w-3 h-3" />}
                        label="보류"
                    />
                )}
                {row.status !== 'scheduled' && row.status !== 'paid' && row.status !== 'cancelled' && (
                    <ActionButton
                        onClick={() => onChange(row.id, 'scheduled')}
                        disabled={acting}
                        icon={<Play className="w-3 h-3" />}
                        label="예정으로"
                    />
                )}
                {row.status !== 'cancelled' && row.status !== 'paid' && (
                    <ActionButton
                        onClick={() => onChange(row.id, 'cancelled')}
                        disabled={acting}
                        icon={<XCircle className="w-3 h-3" />}
                        label="취소"
                        variant="danger"
                    />
                )}
                {row.status === 'paid' && (
                    <ActionButton
                        onClick={() => onChange(row.id, 'in_progress')}
                        disabled={acting}
                        icon={<Pause className="w-3 h-3" />}
                        label="지급 취소(처리중으로)"
                        variant="danger"
                    />
                )}
            </div>
        </div>
    )
}

function ActionButton({
    onClick,
    disabled,
    icon,
    label,
    variant = 'default',
}: {
    onClick: () => void
    disabled?: boolean
    icon: React.ReactNode
    label: string
    variant?: 'default' | 'primary' | 'danger'
}) {
    const cls =
        variant === 'primary'
            ? 'bg-primary text-black hover:bg-primary/90 font-bold'
            : variant === 'danger'
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 font-semibold'
                : 'bg-neutral-800 text-white/70 hover:bg-neutral-700 hover:text-white'
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition disabled:opacity-50 disabled:cursor-not-allowed ${cls}`}
        >
            {icon}
            {label}
        </button>
    )
}
