'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAdmin } from '@/hooks/useAdmin'
import { supabase } from '@/lib/supabase'
import { slugFromStageName } from '@/lib/slug'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import SocialLinksInput from '@/components/profile/SocialLinksInput'
import AgencySelector from '@/components/profile/AgencySelector'
import type { SocialLinks } from '@/lib/supabase'

const SPECIALTIES = [
  { value: 'choreo', label: '안무 (Choreography)' },
  { value: 'broadcast', label: '방송 (Broadcast)' },
  { value: 'battle', label: '배틀 (Battle)' },
  { value: 'workshop', label: '워크샵 (Workshop)' },
  { value: 'judge', label: '심사 (Judge)' },
  { value: 'performance', label: '공연 (Performance)' },
]

const GENRES = [
  'Hip Hop', 'Popping', 'Locking', 'Waacking', 'Voguing',
  'House', 'Krump', 'Breaking', 'Heels', 'Contemporary',
  'Jazz', 'K-Pop',
]

export default function AdminDancerNewPage() {
  const router = useRouter()
  const { isAdmin } = useAdmin()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    stage_name: '',
    korean_name: '',
    profile_img: '',
    bio: '',
    location: '',
    gender: '' as '' | 'male' | 'female' | 'other',
    social_links: {} as SocialLinks,
    specialties: [] as string[],
    genres: [] as string[],
    slug: '',
    is_verified: false,
    agency_id: null as string | null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.stage_name.trim()) {
      alert('활동명을 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      const slug =
        formData.slug.trim() ||
        slugFromStageName(formData.stage_name)

      const { data: existing } = await supabase
        .from('dancers')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      let finalSlug = slug
      if (existing) {
        finalSlug = `${slug}-${Date.now().toString(36)}`
      }

      const cleanedSocialLinks: SocialLinks = {}
      if (formData.social_links.instagram) cleanedSocialLinks.instagram = formData.social_links.instagram
      if (formData.social_links.twitter) cleanedSocialLinks.twitter = formData.social_links.twitter
      if (formData.social_links.youtube) cleanedSocialLinks.youtube = formData.social_links.youtube

      const { data: inserted, error } = await supabase
        .from('dancers')
        .insert({
          owner_id: null,
          manager_id: null,
          stage_name: formData.stage_name.trim(),
          korean_name: formData.korean_name.trim() || null,
          profile_img: formData.profile_img.trim() || null,
          bio: formData.bio.trim() || null,
          location: formData.location.trim() || null,
          gender: formData.gender || null,
          specialties: formData.specialties.length > 0 ? formData.specialties : null,
          genres: formData.genres.length > 0 ? formData.genres : null,
          slug: finalSlug,
          is_verified: formData.is_verified,
          social_links:
            Object.keys(cleanedSocialLinks).length > 0 ? cleanedSocialLinks : null,
          portfolio: [],
          agency_id: formData.agency_id || null,
        })
        .select('id')
        .single()

      if (error) throw error
      if (!inserted?.id) throw new Error('생성 실패')

      const { logAdminAction } = await import('@/lib/admin-log')
      logAdminAction({
        action: 'create',
        target_type: 'profile',
        target_id: inserted.id,
        target_label: formData.stage_name.trim() || null,
      })

      alert('댄서가 등록되었습니다. 경력·포트폴리오는 수정 페이지에서 추가할 수 있습니다.')
      router.push(`/admin/dancers/${inserted.id}/edit`)
    } catch (err: any) {
      alert('저장 실패: ' + (err.message ?? String(err)))
    } finally {
      setSaving(false)
    }
  }

  if (!isAdmin) return null

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/dancers"
          className="p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition"
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">새 댄서 등록</h1>
          <p className="text-sm text-white/50">기본 정보를 입력한 뒤 저장하면 수정 페이지에서 경력·SNS·포트폴리오를 추가할 수 있습니다.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <h2 className="text-lg font-bold text-white">기본 정보</h2>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">활동명 *</label>
            <input
              type="text"
              value={formData.stage_name}
              onChange={(e) =>
                setFormData({ ...formData, stage_name: e.target.value })
              }
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
              placeholder="예: Bada Lee"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">한글명</label>
            <input
              type="text"
              value={formData.korean_name}
              onChange={(e) =>
                setFormData({ ...formData, korean_name: e.target.value })
              }
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
              placeholder="예: 이바다"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">프로필 사진 URL</label>
            <input
              type="url"
              value={formData.profile_img}
              onChange={(e) =>
                setFormData({ ...formData, profile_img: e.target.value })
              }
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
              placeholder="https://..."
            />
            <p className="mt-1 text-xs text-white/40">등록 후 수정 페이지에서 직접 업로드도 가능합니다.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">소개</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary resize-none"
              placeholder="짧은 소개"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">활동 지역</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
              placeholder="예: Seoul"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">성별</label>
            <div className="flex gap-2">
              {(
                [
                  { value: 'male', label: '남성' },
                  { value: 'female', label: '여성' },
                  { value: 'other', label: '기타' },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      gender:
                        formData.gender === option.value ? '' : option.value,
                    })
                  }
                  className={cn(
                    'flex-1 py-3 rounded-lg border text-sm font-medium transition-all',
                    formData.gender === option.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-neutral-800 text-white/60 hover:bg-neutral-900'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">프로필 URL (Slug)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary font-mono text-sm"
              placeholder="비우면 활동명으로 자동 생성 (예: bada-lee)"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_verified"
              checked={formData.is_verified}
              onChange={(e) =>
                setFormData({ ...formData, is_verified: e.target.checked })
              }
              className="rounded border-neutral-600 bg-neutral-800 text-primary focus:ring-primary"
            />
            <label htmlFor="is_verified" className="text-sm text-white/80">
              승인(공개 프로필로 노출)
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">소속사 (선택)</label>
            <AgencySelector
              value={formData.agency_id}
              onChange={(agencyId) =>
                setFormData({ ...formData, agency_id: agencyId })
              }
            />
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <h2 className="text-lg font-bold text-white">전문 분야</h2>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => {
                  const next = formData.specialties.includes(s.value)
                    ? formData.specialties.filter((x) => x !== s.value)
                    : [...formData.specialties, s.value]
                  setFormData({ ...formData, specialties: next })
                }}
                className={cn(
                  'px-3 py-1.5 rounded-lg border text-sm transition',
                  formData.specialties.includes(s.value)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-neutral-700 text-white/60 hover:border-neutral-600'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <h2 className="text-lg font-bold text-white">장르</h2>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  const next = formData.genres.includes(g)
                    ? formData.genres.filter((x) => x !== g)
                    : [...formData.genres, g]
                  setFormData({ ...formData, genres: next })
                }}
                className={cn(
                  'px-3 py-1.5 rounded-lg border text-sm transition',
                  formData.genres.includes(g)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-neutral-700 text-white/60 hover:border-neutral-600'
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <h2 className="text-lg font-bold text-white">SNS</h2>
          <SocialLinksInput
            value={formData.social_links}
            onChange={(links) =>
              setFormData({ ...formData, social_links: links })
            }
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-black hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            저장 후 수정 페이지로 이동
          </button>
          <Link
            href="/admin/dancers"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-5 py-3 text-sm font-medium text-white/80 hover:bg-white/5"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  )
}
