'use client'

import { useEffect, useState, use } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload'
import PortfolioMediaManager from '@/components/portfolio/PortfolioMediaManager'
import CareerHistoryManager from '@/components/profile/CareerHistoryManager'
import SocialLinksInput from '@/components/profile/SocialLinksInput'
import PriorityMultiSelect from '@/components/ui/PriorityMultiSelect'
import type { SocialLinks } from '@/lib/supabase'

const SPECIALTIES = [
    { value: 'choreo', label: '안무 (Choreography)' },
    { value: 'broadcast', label: '방송 (Broadcast)' },
    { value: 'battle', label: '배틀 (Battle)' },
    { value: 'workshop', label: '워크샵 (Workshop)' },
    { value: 'judge', label: '심사 (Judge)' },
    { value: 'performance', label: '공연 (Performance)' }
]

const GENRES = [
    'Hip Hop', 'Popping', 'Locking', 'Waacking', 'Voguing',
    'House', 'Krump', 'Breaking', 'Heels', 'Contemporary',
    'Jazz', 'K-Pop'
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

export default function ProfileEditPage({ params }: PageProps) {
    const { id } = use(params)
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [dancer, setDancer] = useState<any>(null)
    const [formData, setFormData] = useState({
        stage_name: '',
        bio: '',
        location: '',
        profile_img: '',
        gender: '' as '' | 'male' | 'female' | 'other',
        social_links: {} as SocialLinks,
        specialties: [] as string[],
        genres: [] as string[]
    })
    const [portfolioMedia, setPortfolioMedia] = useState<MediaItem[]>([])

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user && id) {
            fetchDancerProfile()
        }
    }, [user, id])

    const fetchDancerProfile = async () => {
        const { data, error } = await supabase
            .from('dancers')
            .select('*')
            .eq('id', id)
            .single()

        if (data) {
            if (data.owner_id !== user!.id && data.manager_id !== user!.id) {
                alert('수정 권한이 없습니다.')
                router.push('/my/profiles')
                return
            }

            setDancer(data)
            setFormData({
                stage_name: data.stage_name || '',
                bio: data.bio || '',
                location: data.location || '',
                profile_img: data.profile_img || '',
                gender: data.gender || '',
                social_links: data.social_links || {},
                specialties: data.specialties || [],
                genres: data.genres || []
            })
            if (data.portfolio && Array.isArray(data.portfolio)) {
                setPortfolioMedia(data.portfolio)
            }
        } else {
            alert('프로필을 찾을 수 없습니다.')
            router.push('/my/profiles')
        }
        setLoading(false)
    }

    const handleProfilePhotoUpload = async (url: string) => {
        setFormData({ ...formData, profile_img: url })

        const { error } = await supabase
            .from('dancers')
            .update({ profile_img: url })
            .eq('id', id)

        if (!error) {
            alert('프로필 사진이 업데이트되었습니다!')
        }
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
                    bio: formData.bio,
                    location: formData.location,
                    profile_img: formData.profile_img,
                    gender: formData.gender || null,
                    portfolio: portfolioMedia,
                    social_links: Object.keys(cleanedSocialLinks).length > 0 ? cleanedSocialLinks : null,
                    specialties: formData.specialties.length > 0 ? formData.specialties : null,
                    genres: formData.genres.length > 0 ? formData.genres : null
                })
                .eq('id', id)

            if (dancerError) throw dancerError

            alert('프로필이 저장되었습니다!')
            router.push(`/profile/${id}`)
        } catch (err: any) {
            alert('저장 실패: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    if (!dancer) return null

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-10">
                <div className="px-6 py-4 flex items-center justify-between">
                    <Link href="/my/profiles">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </Link>
                    <h1 className="text-xl font-bold text-white">프로필 수정</h1>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        저장
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
                {/* Profile Photo */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-4">프로필 사진</h2>
                    <ProfilePhotoUpload
                        targetId={dancer.id}
                        currentPhotoUrl={formData.profile_img}
                        onUploadSuccess={handleProfilePhotoUpload}
                    />
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
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
                            {([
                                { value: 'male', label: '남성' },
                                { value: 'female', label: '여성' },
                                { value: 'other', label: '기타' },
                            ] as const).map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, gender: formData.gender === option.value ? '' : option.value })}
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
                </div>

                {/* Specialties */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white">전문 분야</h2>
                    <p className="text-white/40 text-sm">주요 활동 영역을 선택하세요 (선택 순서 = 우선순위)</p>
                    <PriorityMultiSelect
                        options={SPECIALTIES}
                        selected={formData.specialties}
                        onChange={(specialties) => setFormData({ ...formData, specialties })}
                        variant="list"
                    />
                </div>

                {/* Genres */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white">장르</h2>
                    <p className="text-white/40 text-sm">주로 하는 장르를 선택하세요 (선택 순서 = 우선순위)</p>
                    <PriorityMultiSelect
                        options={GENRES.map(g => ({ value: g, label: g }))}
                        selected={formData.genres}
                        onChange={(genres) => setFormData({ ...formData, genres })}
                        variant="pills"
                    />
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white">SNS 연결</h2>
                    <p className="text-white/40 text-sm">소셜 미디어 계정을 연결하면 프로필에 아이콘이 표시됩니다.</p>
                    <SocialLinksInput
                        value={formData.social_links}
                        onChange={(links) => setFormData({ ...formData, social_links: links })}
                    />
                </div>

                {/* Portfolio Media */}
                <div className="max-w-3xl">
                    <h2 className="text-lg font-bold text-white mb-4">포트폴리오</h2>
                    <PortfolioMediaManager
                        dancerId={dancer.id}
                        initialMedia={portfolioMedia}
                        onMediaChange={setPortfolioMedia}
                    />
                </div>

                {/* Career History */}
                <div className="max-w-3xl">
                    <h2 className="text-lg font-bold text-white mb-4">경력 및 이력</h2>
                    <CareerHistoryManager dancerId={dancer.id} />
                </div>
            </div>
        </div>
    )
}
