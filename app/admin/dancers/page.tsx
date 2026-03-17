'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAdmin } from '@/hooks/useAdmin'
import { supabase } from '@/lib/supabase'
import { UserPlus, ChevronRight, Loader2, Image as ImageIcon, Trash2, Link2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DancerRow {
  id: string
  stage_name: string | null
  korean_name: string | null
  profile_img: string | null
  slug: string | null
  is_verified: boolean
  created_at: string
}

export default function AdminDancersPage() {
  const { isAdmin } = useAdmin()
  const [dancers, setDancers] = useState<DancerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function handleCopyLink(d: DancerRow) {
    const slug = d.slug || d.id
    const url = `${window.location.origin}/${slug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(d.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      alert('복사 실패')
    }
  }

  useEffect(() => {
    if (!isAdmin) return
    loadDancers()
  }, [isAdmin])

  async function loadDancers() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('dancers')
        .select('id, stage_name, korean_name, profile_img, slug, is_verified, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDancers((data as DancerRow[]) ?? [])
    } catch (err) {
      console.error('Failed to load dancers:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(d: DancerRow) {
    if (!confirm(`"${d.stage_name || d.korean_name || d.id}" 댄서를 삭제할까요? 연결된 경력·제안 등도 함께 삭제되거나 해제됩니다.`)) return
    setDeletingId(d.id)
    try {
      const { error } = await supabase.from('dancers').delete().eq('id', d.id)
      if (error) throw error
      const { logAdminAction } = await import('@/lib/admin-log')
      logAdminAction({
        action: 'delete',
        target_type: 'profile',
        target_id: d.id,
        target_label: d.stage_name || d.korean_name || null,
      })
      setDancers((prev) => prev.filter((x) => x.id !== d.id))
    } catch (err: any) {
      console.error('Delete failed:', err)
      alert('삭제 실패: ' + (err?.message ?? String(err)))
    } finally {
      setDeletingId(null)
    }
  }

  if (!isAdmin) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">댄서 관리</h1>
          <p className="mt-1 text-sm text-white/50">댄서 프로필을 등록·수정할 수 있습니다.</p>
        </div>
        <Link
          href="/admin/dancers/new"
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-xl border border-primary bg-primary/10 px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/20'
          )}
        >
          <UserPlus className="h-5 w-5" />
          새 댄서 등록
        </Link>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900 text-white/60">
                <th className="px-4 py-3 font-medium">프로필</th>
                <th className="px-4 py-3 font-medium">활동명</th>
                <th className="px-4 py-3 font-medium">한글명</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">승인</th>
                <th className="px-4 py-3 font-medium text-right">작업</th>
              </tr>
            </thead>
            <tbody>
              {dancers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-white/40">
                    등록된 댄서가 없습니다. 새 댄서를 등록해 보세요.
                  </td>
                </tr>
              ) : (
                dancers.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-neutral-800/80 transition hover:bg-neutral-800/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {d.profile_img ? (
                          <img
                            src={d.profile_img}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover bg-neutral-800"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white/40">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{d.stage_name || '-'}</td>
                    <td className="px-4 py-3 text-white/70">{d.korean_name || '-'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/50">{d.slug || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                          d.is_verified ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/50'
                        )}
                      >
                        {d.is_verified ? '승인' : '대기'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(d)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-white/60 hover:bg-white/10 hover:text-white transition"
                          aria-label={`${d.stage_name || d.korean_name || '댄서'} 링크 복사`}
                        >
                          {copiedId === d.id ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Link2 className="h-4 w-4" />
                          )}
                          {copiedId === d.id ? '복사됨' : '링크'}
                        </button>
                        <Link
                          href={`/admin/dancers/${d.id}/edit`}
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          수정 <ChevronRight className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(d)}
                          disabled={deletingId === d.id}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                          aria-label={`${d.stage_name || d.korean_name || '댄서'} 삭제`}
                        >
                          {deletingId === d.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
