'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { useMyClients } from '@/hooks/useMyClients'

const CATEGORY_OPTIONS = [
  { value: 'choreo', label: '안무 제작' },
  { value: 'broadcast', label: '방송 출연' },
  { value: 'performance', label: '공연' },
  { value: 'workshop', label: '워크샵' },
  { value: 'judge', label: '심사' },
]

interface ModalNewProjectProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (projectId: string) => void
}

export default function ModalNewProject({
  isOpen,
  onClose,
  onCreated,
}: ModalNewProjectProps) {
  const { user } = useAuth()
  const { clients } = useMyClients()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    category: 'choreo',
    clientProfileId: '' as string,
    startDate: '',
    endDate: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !form.title.trim()) return
    setError('')
    setLoading(true)
    try {
      const clientProfileId = form.clientProfileId || null
      const { data: project, error: projectErr } = await supabase
        .from('projects')
        .insert({
          owner_id: user.id,
          client_profile_id: clientProfileId,
          title: form.title.trim(),
          category: form.category,
          confirmation_status: 'negotiating',
          progress_status: 'recruiting',
          visibility: 'private',
          start_date: form.startDate || null,
          end_date: form.endDate || null,
        })
        .select('id')
        .single()

      if (projectErr) throw projectErr
      if (!project?.id) throw new Error('생성 실패')
      onCreated(project.id)
      setForm({
        title: '',
        category: 'choreo',
        clientProfileId: '',
        startDate: '',
        endDate: '',
      })
      onClose()
    } catch (err: any) {
      setError(err.message ?? '생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h3 className="text-lg font-bold text-white">새 프로젝트</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              프로젝트명 *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
              placeholder="예: 2025 댄스대회"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              카테고리
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {clients.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                회사 (선택)
              </label>
              <select
                value={form.clientProfileId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, clientProfileId: e.target.value }))
                }
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="">개인</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name || c.contact_person}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                시작일
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                종료일
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endDate: e.target.value }))
                }
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-neutral-700 text-white/80 hover:bg-neutral-800"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !form.title.trim()}
              className="flex-1 py-2.5 rounded-lg bg-primary text-black font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                '생성'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
