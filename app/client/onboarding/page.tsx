'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useMyClients } from '@/hooks/useMyClients'
import { createClientFull, updateClient } from '@/lib/create-client'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'

const CLIENT_TYPES = [
  { value: 'company', label: '회사' },
  { value: 'individual', label: '개인사업자' },
  { value: 'agency', label: '에이전시' },
]

type ClientType = 'company' | 'individual' | 'agency'

const EMPTY_FORM = {
  company_name: '',
  contact_person: '',
  type: 'company' as ClientType,
  business_number: '',
  email: '',
  phone: '',
  address: '',
  description: '',
}

export default function ClientOnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { clients, loading: clientsLoading } = useMyClients()

  const existingClient = clients[0] ?? null
  const isEditMode = !!existingClient

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (existingClient) {
      setForm({
        company_name: existingClient.company_name ?? '',
        contact_person: existingClient.contact_person ?? '',
        type: (existingClient.type as ClientType) ?? 'company',
        business_number: existingClient.business_number ?? '',
        email: existingClient.email ?? '',
        phone: existingClient.phone ?? '',
        address: existingClient.address ?? '',
        description: existingClient.description ?? '',
      })
    }
  }, [existingClient])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (isEditMode) {
        await updateClient(existingClient.id, {
          company_name: form.company_name,
          contact_person: form.contact_person,
          type: form.type,
          business_number: form.business_number,
          email: form.email,
          phone: form.phone,
          address: form.address,
          description: form.description,
        })
        setSuccess('회사 정보가 수정되었습니다.')
      } else {
        await createClientFull({
          owner_id: user.id,
          company_name: form.company_name,
          contact_person: form.contact_person,
          type: form.type,
          business_number: form.business_number,
          email: form.email,
          phone: form.phone,
          address: form.address,
          description: form.description,
        })
        router.push('/client')
      }
    } catch (err: any) {
      setError(err.message ?? (isEditMode ? '수정에 실패했습니다.' : '등록에 실패했습니다.'))
    } finally {
      setLoading(false)
    }
  }

  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/client"
          className="p-2 rounded-lg border border-neutral-800 text-white/80 hover:bg-neutral-800 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">
            {isEditMode ? '회사 정보 수정' : '회사 정보 등록'}
          </h1>
          <p className="text-sm text-white/50">
            {isEditMode
              ? '등록된 회사 정보를 수정할 수 있습니다.'
              : '제안 발송 시 회사 명의로 보낼 수 있습니다.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-800 p-6 bg-neutral-900/30">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">유형</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ClientType }))}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-primary"
          >
            {CLIENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">상호 / 회사명</label>
          <input
            type="text"
            value={form.company_name}
            onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
            placeholder="예: (주)댄스엔터테인먼트"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">담당자명 *</label>
          <input
            type="text"
            value={form.contact_person}
            onChange={(e) => setForm((f) => ({ ...f, contact_person: e.target.value }))}
            required
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
            placeholder="홍길동"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">사업자번호</label>
          <input
            type="text"
            value={form.business_number}
            onChange={(e) => setForm((f) => ({ ...f, business_number: e.target.value }))}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
            placeholder="000-00-00000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">이메일</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
            placeholder="contact@company.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">연락처</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
            placeholder="010-0000-0000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">주소</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
            placeholder="서울시 강남구 ..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">회사 소개</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary resize-none"
            placeholder="간단한 소개 (선택)"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !form.contact_person.trim()}
            className="w-full py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isEditMode ? '수정 중...' : '등록 중...'}
              </>
            ) : (
              isEditMode ? '수정하기' : '등록하기'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
