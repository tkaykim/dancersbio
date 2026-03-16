'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { supabase } from '@/lib/supabase'
import { Loader2, FileText, User, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

interface AdminLogRow {
  id: string
  action: 'create' | 'update' | 'delete'
  target_type: 'profile' | 'career'
  target_id: string
  target_label: string | null
  details: Record<string, unknown> | null
  admin_user_id: string | null
  created_at: string
  admin_name?: string | null
  admin_email?: string | null
}

const ACTION_LABEL: Record<string, string> = {
  create: '등록',
  update: '수정',
  delete: '삭제',
}

const TARGET_LABEL: Record<string, string> = {
  profile: '프로필',
  career: '경력',
}

export default function AdminLogsPage() {
  const { isAdmin } = useAdmin()
  const [logs, setLogs] = useState<AdminLogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTarget, setFilterTarget] = useState<'all' | 'profile' | 'career'>('all')
  const [filterAction, setFilterAction] = useState<'all' | 'create' | 'update' | 'delete'>('all')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('id, action, target_type, target_id, target_label, details, admin_user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) throw error
      const rows = (data ?? []) as Omit<AdminLogRow, 'admin_name' | 'admin_email'>[]
      const adminIds = [...new Set(rows.map((r) => r.admin_user_id).filter(Boolean))] as string[]
      let adminMap: Record<string, { name: string | null; email: string | null }> = {}
      if (adminIds.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', adminIds)
        users?.forEach((u: { id: string; name: string | null; email: string | null }) => {
          adminMap[u.id] = { name: u.name, email: u.email }
        })
      }
      const merged = rows.map((r) => ({
        ...r,
        admin_name: r.admin_user_id ? adminMap[r.admin_user_id]?.name ?? null : null,
        admin_email: r.admin_user_id ? adminMap[r.admin_user_id]?.email ?? null : null,
      }))
      setLogs(merged)
    } catch (err) {
      console.error('Admin logs fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) fetchData()
  }, [isAdmin, fetchData])

  const filtered = logs.filter((row) => {
    if (filterTarget !== 'all' && row.target_type !== filterTarget) return false
    if (filterAction !== 'all' && row.action !== filterAction) return false
    return true
  })

  if (!isAdmin) return null

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="등록로그"
        description="프로필·경력의 등록·수정·삭제 이력을 확인합니다."
      />
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-white/60">대상:</span>
        {(['all', 'profile', 'career'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setFilterTarget(v)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition',
              filterTarget === v
                ? 'bg-primary text-black'
                : 'bg-neutral-800 text-white/70 hover:bg-neutral-700 hover:text-white'
            )}
          >
            {v === 'all' ? '전체' : TARGET_LABEL[v]}
          </button>
        ))}
        <span className="ml-2 text-sm text-white/60">작업:</span>
        {(['all', 'create', 'update', 'delete'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setFilterAction(v)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition',
              filterAction === v
                ? 'bg-primary text-black'
                : 'bg-neutral-800 text-white/70 hover:bg-neutral-700 hover:text-white'
            )}
          >
            {v === 'all' ? '전체' : ACTION_LABEL[v]}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-white/50">
            {logs.length === 0 ? '기록된 로그가 없습니다.' : '조건에 맞는 로그가 없습니다.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-800/50">
                  <th className="px-4 py-3 font-medium text-white/70">시각</th>
                  <th className="px-4 py-3 font-medium text-white/70">작업</th>
                  <th className="px-4 py-3 font-medium text-white/70">대상</th>
                  <th className="px-4 py-3 font-medium text-white/70">라벨</th>
                  <th className="px-4 py-3 font-medium text-white/70">담당자</th>
                  <th className="px-4 py-3 font-medium text-white/70">비고</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-b border-neutral-800/70 hover:bg-neutral-800/30">
                    <td className="px-4 py-3 text-white/80 whitespace-nowrap">
                      {new Date(row.created_at).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
                          row.action === 'create' && 'bg-emerald-500/20 text-emerald-400',
                          row.action === 'update' && 'bg-amber-500/20 text-amber-400',
                          row.action === 'delete' && 'bg-red-500/20 text-red-400'
                        )}
                      >
                        {ACTION_LABEL[row.action]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-white/80">
                        {row.target_type === 'profile' ? (
                          <User className="w-4 h-4 text-white/50" />
                        ) : (
                          <Briefcase className="w-4 h-4 text-white/50" />
                        )}
                        {TARGET_LABEL[row.target_type]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.target_type === 'profile' ? (
                        <Link
                          href={`/admin/dancers/${row.target_id}/edit`}
                          className="text-primary hover:underline"
                        >
                          {row.target_label || row.target_id}
                        </Link>
                      ) : (
                        <span className="text-white/80">{row.target_label || `경력 #${row.target_id}`}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {row.admin_name || row.admin_email || row.admin_user_id?.slice(0, 8) || '—'}
                    </td>
                    <td className="px-4 py-3 text-white/50 max-w-[200px] truncate">
                      {row.details && Object.keys(row.details).length > 0
                        ? JSON.stringify(row.details)
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
