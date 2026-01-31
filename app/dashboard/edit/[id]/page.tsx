'use client'

import { useEffect, useState, use } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload'
import PortfolioMediaManager from '@/components/portfolio/PortfolioMediaManager'
import CareerHistoryManager from '@/components/profile/CareerHistoryManager'

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
        profile_img: ''
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
            // Verify ownership
            if (data.owner_id !== user!.id && data.manager_id !== user!.id) {
                alert('수정 권한이 없습니다.')
                router.push('/profile/me')
                return
            }

            setDancer(data)
            setFormData({
                stage_name: data.stage_name || '',
                bio: data.bio || '',
                location: data.location || '',
                profile_img: data.profile_img || ''
            })
            if (data.portfolio && Array.isArray(data.portfolio)) {
                setPortfolioMedia(data.portfolio)
            }
        } else {
            alert('프로필을 찾을 수 없습니다.')
            router.push('/profile/me')
        }
        setLoading(false)
    }

    const handleProfilePhotoUpload = async (url: string) => {
        setFormData({ ...formData, profile_img: url })

        // Auto-save profile photo
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
            // Update dancer profile
            const { error: dancerError } = await supabase
                .from('dancers')
                .update({
                    stage_name: formData.stage_name,
                    bio: formData.bio,
                    location: formData.location,
                    profile_img: formData.profile_img,
                    portfolio: portfolioMedia
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
                    <Link href={`/profile/${dancer.id}`}>
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </Link>
                    <h1 className="text-xl font-bold text-white">프로필 수정</h1>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
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
                        targetId={dancer.id} // Use dancer ID instead of user ID
                        currentPhotoUrl={formData.profile_img}
                        onUploadSuccess={handleProfilePhotoUpload}
                    />
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white">기본 정보</h2>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            활동명
                        </label>
                        <input
                            type="text"
                            value={formData.stage_name}
                            onChange={(e) => setFormData({ ...formData, stage_name: e.target.value })}
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            소개
                        </label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                            활동 지역
                        </label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                            placeholder="예: Seoul"
                        />
                    </div>
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
