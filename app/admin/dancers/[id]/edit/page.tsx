'use client'

import { useEffect, useState, use } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload'
import PortfolioMediaManager from '@/components/portfolio/PortfolioMediaManager'
import CareerHistoryManager from '@/components/profile/CareerHistoryManager'
import type { CareerLogPayload } from '@/components/profile/CareerHistoryManager'
import { logAdminAction } from '@/lib/admin-log'
import SocialLinksInput from '@/components/profile/SocialLinksInput'
import PriorityMultiSelect from '@/components/ui/PriorityMultiSelect'
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

interface MediaItem {
  id: string
  type: 'photo' | 'video' | 'youtube'
  url: string
  thumbnail?: string
  caption?: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function AdminDancerEditPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { isAdmin } = useAdmin()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dancer, setDancer] = useState<any>(null)
  const [formData, setFormData] = useState({
    stage_name: '',
    korean_name: '',
    bio: '',
    location: '',
    profile_img: '',
    gender: '' as '' | 'male' | 'female' | 'other',
    social_links: {} as SocialLinks,
    specialties: [] as string[],
    genres: [] as string[],
    slug: '',
    is_verified: false,
    agency_id: null as string | null,
  })
  const [portfolioMedia, setPortfolioMedia] = useState<MediaItem[]>([])

  useEffect(() => {
    if (!isAdmin) return
    if (id) fetchDancerProfile()
  }, [isAdmin, id])

  const fetchDancerProfile = async () => {
    const { data, error } = await supabase
      .from('dancers')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      alert('댄서 프로필을 찾을 수 없습니다.')
      router.push('/admin/dancers')
      setLoading(false)
      return
    }

    setDancer(data)
    setFormData({
      stage_name: data.stage_name || '',
      korean_name: data.korean_name || '',
      bio: data.bio || '',
      location: data.location || '',
      profile_img: data.profile_img || '',
      gender: data.gender || '',
      social_links: data.social_links || {},
      specialties: data.specialties || [],
      genres: data.genres || [],
      slug: data.slug || '',
      is_verified: !!data.is_verified,
      agency_id: data.agency_id || null,
    })
    if (data.portfolio && Array.isArray(data.portfolio)) {
      setPortfolioMedia(data.portfolio)
    }
    setLoading(false)
  }

  const handleProfilePhotoUpload = async (url: string) => {
    setFormData((prev) => ({ ...prev, profile_img: url }))
    await supabase.from('dancers').update({ profile_img: url }).eq('id', id)
    logAdminAction({
      action: 'update',
      target_type: 'profile',
      target_id: id,
      target_label: formData.stage_name || null,
      details: { field: 'profile_img' },
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const cleanedSocialLinks: SocialLinks = {}
      if (formData.social_links.instagram) cleanedSocialLinks.instagram = formData.social_links.instagram
      if (formData.social_links.twitter) cleanedSocialLinks.twitter = formData.social_links.twitter
      if (formData.social_links.youtube) cleanedSocialLinks.youtube = formData.social_links.youtube

      const { error: dancerError } = await supabase
        .from('dancers')
        .update({
          stage_name: formData.stage_name,
          korean_name: formData.korean_name.trim() || null,
          bio: formData.bio,
          location: formData.location,
          profile_img: formData.profile_img,
          gender: formData.gender || null,
          portfolio: portfolioMedia,
          social_links: Object.keys(cleanedSocialLinks).length > 0 ? cleanedSocialLinks : null,
          specialties: formData.specialties.length > 0 ? formData.specialties : null,
          genres: formData.genres.length > 0 ? formData.genres : null,
          slug: formData.slug.trim() || null,
          is_verified: formData.is_verified,
          agency_id: formData.agency_id || null,
        })
        .eq('id', id)

      if (dancerError) throw dancerError
      logAdminAction({
        action: 'update',
        target_type: 'profile',
        target_id: id,
        target_label: formData.stage_name || null,
      })
      alert('저장되었습니다.')
    } catch (err: any) {
      alert('저장 실패: ' + (err.message ?? String(err)))
    } finally {
      setSaving(false)
    }
  }

  if (!isAdmin) return null

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!dancer) return null

  const profileUrl = `/profile/${dancer.slug || dancer.id}`

  return (
    <div className="max-w-3xl space-y-8 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dancers"
            className="p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">댄서 프로필 수정</h1>
            <p className="text-sm text-white/50">
              {formData.stage_name || '(이름 없음)'} — 프로필·경력·SNS·포트폴리오를 관리합니다.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
          >
            <ExternalLink className="w-4 h-4" />
            프로필 보기
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-black hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            저장
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">프로필 사진</h2>
          <ProfilePhotoUpload
            targetId={dancer.id}
            currentPhotoUrl={formData.profile_img}
            onUploadSuccess={handleProfilePhotoUpload}
          />
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">기본 정보</h2>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">활동명</label>
            <input
              type="text"
              value={formData.stage_name}
              onChange={(e) => setFormData({ ...formData, stage_name: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">한글명</label>
            <input
              type="text"
              value={formData.korean_name}
              onChange={(e) => setFormData({ ...formData, korean_name: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
              placeholder="예: 이바다"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">소개</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">활동 지역</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                      gender: formData.gender === option.value ? '' : option.value,
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
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary font-mono text-sm"
              placeholder="예: bada-lee"
            />
            <p className="mt-1 text-xs text-white/40">공개 URL: /profile/{formData.slug || id}</p>
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
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">소속 정보</h2>
          <p className="text-white/40 text-sm">소속사(클라이언트)를 검색하여 연결하세요. 없으면 새로 추가할 수 있습니다.</p>
          <AgencySelector
            value={formData.agency_id}
            onChange={(agencyId) => setFormData({ ...formData, agency_id: agencyId })}
          />
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">전문 분야</h2>
          <p className="text-white/40 text-sm">주요 활동 영역 (선택 순서 = 우선순위)</p>
          <PriorityMultiSelect
            options={SPECIALTIES}
            selected={formData.specialties}
            onChange={(specialties) => setFormData({ ...formData, specialties })}
            variant="list"
          />
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">장르</h2>
          <p className="text-white/40 text-sm">주로 하는 장르 (선택 순서 = 우선순위)</p>
          <PriorityMultiSelect
            options={GENRES.map((g) => ({ value: g, label: g }))}
            selected={formData.genres}
            onChange={(genres) => setFormData({ ...formData, genres })}
            variant="pills"
          />
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">SNS 연결</h2>
          <SocialLinksInput
            value={formData.social_links}
            onChange={(links) => setFormData({ ...formData, social_links: links })}
          />
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">포트폴리오</h2>
          <PortfolioMediaManager
            dancerId={dancer.id}
            initialMedia={portfolioMedia}
            onMediaChange={setPortfolioMedia}
          />
        </section>

        <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">경력 및 이력</h2>
          <p className="text-white/40 text-sm">안무·공연·방송·수상·워크샵 등 카테고리별로 등록하세요.</p>
          <CareerHistoryManager
            dancerId={dancer.id}
            onLog={(action, payload) => {
              const targetId = payload.id != null ? String(payload.id) : ''
              if (!targetId && action !== 'create') return
              logAdminAction({
                action,
                target_type: 'career',
                target_id: (targetId || payload.dancer_id) ?? '',
                target_label: payload.title ?? undefined,
                details: payload.dancer_id ? { dancer_id: payload.dancer_id, ...payload.details } : payload.details,
              })
            }}
          />
        </section>
      </div>
    </div>
  )
}
