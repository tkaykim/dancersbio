'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

const CLIENT_TYPES = [
  { value: 'company', label: '회사' },
  { value: 'individual', label: '개인사업자' },
  { value: 'agency', label: '에이전시' },
]

export default function ClientOnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    company_name: '',
    contact_person: '',
    type: 'company' as 'company' | 'individual' | 'agency',
    business_number: '',
    email: '',
    phone: '',
    address: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError('')
    setLoading(true)
    try {
      const { data: client, error: insertError } = await supabase
        .from('clients')
        .insert({
          owner_id: user.id,
          company_name: form.company_name.trim() || null,
          contact_person: form.contact_person.trim(),
          type: form.type,
          business_number: form.business_number.trim() || null,
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          description: form.description.trim() || null,
        })
        .select('id')
        .single()

      if (insertError) throw insertError
      if (!client?.id) throw new Error('등록 실패')

      await supabase.from('client_members').insert({
        client_id: client.id,
        user_id: user.id,
        role: 'owner',
      })

      router.push('/client')
    } catch (err: any) {
      setError(err.message ?? '등록에 실패했습니다.')
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-xl font-bold text-white">회사 정보 등록</h1>
          <p className="text-sm text-white/50">
            제안 발송 시 회사 명의로 보낼 수 있습니다.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-800 p-6 bg-neutral-900/30">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">유형</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'company' | 'individual' | 'agency' }))}
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
                등록 중...
              </>
            ) : (
              '등록하기'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
