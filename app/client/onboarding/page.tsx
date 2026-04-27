'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useMyClients } from '@/hooks/useMyClients'
import { createClientFull, updateClient } from '@/lib/create-client'
import Link from 'next/link'
import { Ico, CueButton, CueEyebrow, CueSerif } from '@/components/cue'

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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--cue-ink-2)',
  marginBottom: 6,
  letterSpacing: 0.2,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  background: 'var(--cue-bg)',
  border: '1px solid var(--cue-hairline)',
  borderRadius: 8,
  color: 'var(--cue-ink)',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '96px 0' }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '2px solid var(--cue-hairline-2)',
            borderTopColor: 'var(--cue-accent)',
            animation: 'cue-spin 0.7s linear infinite',
          }}
        />
        <style>{`@keyframes cue-spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link
          href="/client"
          style={{
            padding: 8,
            borderRadius: 8,
            border: '1px solid var(--cue-hairline)',
            color: 'var(--cue-ink-2)',
            display: 'inline-flex',
          }}
        >
          {Ico.chevLeft('currentColor', 16)}
        </Link>
        <div>
          <CueEyebrow>{isEditMode ? 'EDIT · COMPANY PROFILE' : 'NEW · COMPANY PROFILE'}</CueEyebrow>
          <div style={{ marginTop: 2 }}>
            <CueSerif size={24}>
              {isEditMode ? '회사 정보 수정' : '회사 정보 등록'}
            </CueSerif>
          </div>
          <p style={{ fontSize: 12, color: 'var(--cue-ink-3)', marginTop: 4 }}>
            {isEditMode ? '등록된 회사 정보를 수정할 수 있습니다.' : '제안 발송 시 회사 명의로 보낼 수 있습니다.'}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          borderRadius: 14,
          border: '1px solid var(--cue-hairline)',
          padding: 24,
          background: 'var(--cue-surface)',
        }}
      >
        {error && (
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              background: 'rgba(255,122,110,0.1)',
              border: '1px solid rgba(255,122,110,0.3)',
              color: 'var(--cue-bad)',
              fontSize: 12,
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              background: 'rgba(125,226,160,0.1)',
              border: '1px solid rgba(125,226,160,0.3)',
              color: 'var(--cue-ok)',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {Ico.check('currentColor', 14)}
            {success}
          </div>
        )}

        <div>
          <label style={labelStyle}>유형</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ClientType }))}
            style={inputStyle}
          >
            {CLIENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>상호 / 회사명</label>
          <input
            type="text"
            value={form.company_name}
            onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
            style={inputStyle}
            placeholder="예: (주)댄스엔터테인먼트"
          />
        </div>

        <div>
          <label style={labelStyle}>담당자명 *</label>
          <input
            type="text"
            value={form.contact_person}
            onChange={(e) => setForm((f) => ({ ...f, contact_person: e.target.value }))}
            required
            style={inputStyle}
            placeholder="홍길동"
          />
        </div>

        <div>
          <label style={labelStyle}>사업자번호</label>
          <input
            type="text"
            value={form.business_number}
            onChange={(e) => setForm((f) => ({ ...f, business_number: e.target.value }))}
            style={inputStyle}
            placeholder="000-00-00000"
          />
        </div>

        <div>
          <label style={labelStyle}>이메일</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            style={inputStyle}
            placeholder="contact@company.com"
          />
        </div>

        <div>
          <label style={labelStyle}>연락처</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            style={inputStyle}
            placeholder="010-0000-0000"
          />
        </div>

        <div>
          <label style={labelStyle}>주소</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            style={inputStyle}
            placeholder="서울시 강남구 ..."
          />
        </div>

        <div>
          <label style={labelStyle}>회사 소개</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            style={{ ...inputStyle, resize: 'none' }}
            placeholder="간단한 소개 (선택)"
          />
        </div>

        <div style={{ paddingTop: 4 }}>
          <CueButton
            type="submit"
            size="lg"
            fullWidth
            disabled={loading || !form.contact_person.trim()}
          >
            {loading ? (isEditMode ? '수정 중…' : '등록 중…') : isEditMode ? '수정하기' : '등록하기'}
          </CueButton>
        </div>
      </form>
    </div>
  )
}
