'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, X, Loader2, Send, User as UserIcon } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import Drawer from '@/components/ui/Drawer'
import type { Dancer } from '@/lib/supabase'

const ROLE_PRESETS = [
  'MC',
  '심사위원',
  '게스트 쇼케이스',
  '메인 댄서',
  '백업 댄서',
  '공동 안무',
  '디렉터',
  '게스트',
  '참여 댄서',
]

interface DrawerAddProposalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectTitle: string
  existingDancerIds: Set<string>
  onSuccess: () => void
}

interface DancerOption extends Dancer {
  selected?: boolean
}

interface ProposalDraft {
  dancerId: string
  stageName: string
  profileImg: string | null
  role: string
  fee: string
  details: string
}

export default function DrawerAddProposal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  existingDancerIds,
  onSuccess,
}: DrawerAddProposalProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<'search' | 'details'>('search')
  const [allDancers, setAllDancers] = useState<DancerOption[]>([])
  const [dancerSearch, setDancerSearch] = useState('')
  const [loadingDancers, setLoadingDancers] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [drafts, setDrafts] = useState<ProposalDraft[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const fetchDancers = useCallback(async () => {
    setLoadingDancers(true)
    try {
      const { data, error: err } = await supabase
        .from('dancers')
        .select('*')
        .eq('is_verified', true)
        .order('stage_name')
      if (err) throw err
      setAllDancers((data as DancerOption[]) || [])
    } catch (e) {
      console.error(e)
      setAllDancers([])
    } finally {
      setLoadingDancers(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchDancers()
      setStep('search')
      setSelectedIds(new Set())
      setDrafts([])
      setDancerSearch('')
      setError('')
    }
  }, [isOpen, fetchDancers])

  const filteredDancers = useMemo(() => {
    let list = allDancers.filter((d) => !existingDancerIds.has(d.id))
    if (dancerSearch.trim()) {
      const q = dancerSearch.toLowerCase()
      list = list.filter(
        (d) =>
          d.stage_name.toLowerCase().includes(q) ||
          d.genres?.some((g) => g.toLowerCase().includes(q)) ||
          d.location?.toLowerCase().includes(q)
      )
    }
    return list
  }, [allDancers, existingDancerIds, dancerSearch])

  const selectedDancersList = useMemo(
    () => allDancers.filter((d) => selectedIds.has(d.id)),
    [allDancers, selectedIds]
  )

  const toggleDancer = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        setDrafts((d) => d.filter((x) => x.dancerId !== id))
      } else {
        const d = allDancers.find((x) => x.id === id)
        if (d)
          setDrafts((dr) => {
            if (dr.some((x) => x.dancerId === d.id)) return dr
            return [
              ...dr,
              {
                dancerId: d.id,
                stageName: d.stage_name,
                profileImg: d.profile_img,
                role: '참여 댄서',
                fee: '',
                details: '',
              },
            ]
          })
        next.add(id)
      }
      return next
    })
  }

  const updateDraft = (
    dancerId: string,
    field: keyof ProposalDraft,
    value: string
  ) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.dancerId === dancerId ? { ...d, [field]: value } : d
      )
    )
  }

  const handleGoToDetails = () => {
    if (selectedIds.size === 0) return
    setStep('details')
  }

  const handleSubmit = async () => {
    if (!user || drafts.length === 0) return
    setError('')
    setSending(true)
    try {
      const seenDancerIds = new Set<string>()
      const rows = drafts
        .filter((d) => {
          if (seenDancerIds.has(d.dancerId)) return false
          seenDancerIds.add(d.dancerId)
          return true
        })
        .map((d) => ({
          project_id: projectId,
          dancer_id: d.dancerId,
          sender_id: user.id,
          role: d.role || '참여 댄서',
          fee: d.fee ? parseInt(d.fee, 10) : null,
          details: d.details || null,
          status: 'pending',
        }))
      const { error: insertErr } = await supabase.from('proposals').insert(rows)
      if (insertErr) throw insertErr
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message ?? '제안 발송에 실패했습니다.')
    } finally {
      setSending(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-primary'

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'search' ? '제안 추가 · 댄서 선택' : '제안 추가 · 역할·금액'}
    >
      <div className="space-y-4">
        <p className="text-white/60 text-sm">{projectTitle}</p>

        {step === 'search' ? (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={dancerSearch}
                onChange={(e) => setDancerSearch(e.target.value)}
                placeholder="이름, 장르, 지역으로 검색..."
                className={inputClass + ' pl-9'}
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-neutral-800 p-2">
              {loadingDancers ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : filteredDancers.length === 0 ? (
                <p className="text-center py-4 text-white/50 text-sm">
                  {dancerSearch ? '검색 결과가 없습니다' : '등록된 댄서가 없습니다'}
                </p>
              ) : (
                filteredDancers.map((dancer) => {
                  const isSelected = selectedIds.has(dancer.id)
                  return (
                    <button
                      key={dancer.id}
                      type="button"
                      onClick={() => toggleDancer(dancer.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition ${
                        isSelected
                          ? 'bg-primary/10 border border-primary/30'
                          : 'hover:bg-neutral-800/50 border border-transparent'
                      }`}
                    >
                      {dancer.profile_img ? (
                        <Image
                          src={dancer.profile_img}
                          alt=""
                          width={40}
                          height={40}
                          className="rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center shrink-0">
                          <UserIcon className="w-5 h-5 text-white/40" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-white truncate">
                          {dancer.stage_name}
                        </div>
                        {dancer.genres && dancer.genres.length > 0 && (
                          <div className="text-xs text-white/50 truncate">
                            {dancer.genres.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <span className="text-primary text-xs font-medium">
                          선택됨
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
            {selectedIds.size > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                <span className="text-sm text-white/70">
                  {selectedIds.size}명 선택
                </span>
                <button
                  type="button"
                  onClick={handleGoToDetails}
                  className="px-4 py-2 rounded-lg bg-primary text-black font-medium text-sm hover:bg-primary/90"
                >
                  다음: 역할·금액 입력
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setStep('search')}
              className="text-sm text-primary hover:underline"
            >
              ← 댄서 다시 선택
            </button>
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {drafts.map((d) => (
                <div
                  key={d.dancerId}
                  className="p-3 rounded-lg border border-neutral-800 bg-neutral-800/30 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    {d.profileImg ? (
                      <Image
                        src={d.profileImg}
                        alt=""
                        width={28}
                        height={28}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-neutral-700" />
                    )}
                    <span className="font-medium text-white text-sm">
                      {d.stageName}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">
                      역할
                    </label>
                    <select
                      value={d.role}
                      onChange={(e) =>
                        updateDraft(d.dancerId, 'role', e.target.value)
                      }
                      className={inputClass + ' py-1.5'}
                    >
                      {ROLE_PRESETS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">
                      금액 (원, 선택)
                    </label>
                    <input
                      type="number"
                      value={d.fee}
                      onChange={(e) =>
                        updateDraft(d.dancerId, 'fee', e.target.value)
                      }
                      placeholder="예: 500000"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">
                      메시지 (선택)
                    </label>
                    <textarea
                      value={d.details}
                      onChange={(e) =>
                        updateDraft(d.dancerId, 'details', e.target.value)
                      }
                      rows={2}
                      placeholder="제안 메시지"
                      className={inputClass + ' resize-none'}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-neutral-700 text-white/80"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={sending}
                className="flex-1 py-2.5 rounded-lg bg-primary text-black font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    발송 중...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {drafts.length}명에게 제안 보내기
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Drawer>
  )
}
