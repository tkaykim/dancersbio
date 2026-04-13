'use client'

import { useEffect, useState, use } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { useBackWithFallback } from '@/lib/useBackWithFallback'
import type { SocialLinks } from '@/lib/supabase'
import SocialLinksInput from '@/components/profile/SocialLinksInput'
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload'
import PortfolioMediaManager from '@/components/portfolio/PortfolioMediaManager'
import TeamMemberManager from '@/components/team/TeamMemberManager'
import TeamCareerManager from '@/components/team/TeamCareerManager'
import MultiAgencySelector from '@/components/profile/MultiAgencySelector'

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

export default function TeamEditPage({ params }: PageProps) {
    const { id } = use(params)
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const handleBack = useBackWithFallback('/my/teams')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [team, setTeam] = useState<any>(null)
    const [members, setMembers] = useState<any[]>([])
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        location: '',
        founded_date: '',
        profile_img: '',
        social_links: {} as SocialLinks,
        representative_video: '',
    })
    const [portfolioMedia, setPortfolioMedia] = useState<MediaItem[]>([])
    const [selectedAgencies, setSelectedAgencies] = useState<{ agency_id: string; name: string; is_primary: boolean }[]>([])

    useEffect(() => {
        if (!authLoading && !user) router.push('/auth/signin')
    }, [user, authLoading, router])

    useEffect(() => {
        if (user && id) fetchTeam()
    }, [user, id])

    const fetchTeam = async () => {
        const { data, error } = await supabase
            .from('teams')
            .select(`
                *,
                team_members (
                    id, dancer_id, role, is_active,
                    dancers:dancer_id (id, stage_name, profile_img)
                )
            `)
            .eq('id', id)
            .single()

        if (error || !data) {
            alert('팀을 찾을 수 없습니다')
            router.push('/my/teams')
            return
        }

        if (data.leader_id !== user!.id) {
            alert('팀 수정 권한이 없습니다')
            router.push('/my/teams')
            return
        }

        setTeam(data)
        setMembers(data.team_members || [])
        setFormData({
            name: data.name || '',
            bio: data.bio || '',
            location: data.location || '',
            founded_date: data.founded_date || '',
            profile_img: data.profile_img || '',
            social_links: data.social_links || {},
            representative_video: data.representative_video || '',
        })
        if (data.portfolio && Array.isArray(data.portfolio)) {
            setPortfolioMedia(data.portfolio)
        }

        const { data: agencyData } = await supabase
            .from('team_agencies')
            .select('agency_id, is_primary, clients:agency_id (id, company_name, contact_person)')
            .eq('team_id', id)
        if (agencyData) {
            setSelectedAgencies(agencyData.map((a: any) => ({
                agency_id: a.agency_id,
                name: a.clients?.company_name || a.clients?.contact_person || '',
                is_primary: a.is_primary,
            })))
        }

        setLoading(false)
    }

    const handleProfilePhotoUpload = async (url: string) => {
        setFormData({ ...formData, profile_img: url })
        await supabase.from('teams').update({ profile_img: url }).eq('id', id)
    }

    const handleSave = async () => {
        if (!formData.name.trim()) { alert('팀 이름을 입력하세요'); return }
        setSaving(true)
        try {
            const cleanedSocialLinks: SocialLinks = {}
            if (formData.social_links.instagram) cleanedSocialLinks.instagram = formData.social_links.instagram
            if (formData.social_links.twitter) cleanedSocialLinks.twitter = formData.social_links.twitter
            if (formData.social_links.youtube) cleanedSocialLinks.youtube = formData.social_links.youtube

            const { error } = await supabase
                .from('teams')
                .update({
                    name: formData.name.trim(),
                    bio: formData.bio || null,
                    location: formData.location || null,
                    founded_date: formData.founded_date || null,
                    profile_img: formData.profile_img || null,
                    portfolio: portfolioMedia,
                    social_links: Object.keys(cleanedSocialLinks).length > 0 ? cleanedSocialLinks : null,
                    representative_video: formData.representative_video || null,
                })
                .eq('id', id)

            if (error) throw error

            await supabase.from('team_agencies').delete().eq('team_id', id)
            if (selectedAgencies.length > 0) {
                await supabase.from('team_agencies').insert(
                    selectedAgencies.map(a => ({
                        team_id: id,
                        agency_id: a.agency_id,
                        is_primary: a.is_primary,
                    }))
                )
            }

            alert('팀 정보가 저장되었습니다!')
            router.push(`/team/${team.slug || id}`)
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

    if (!team) return null

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-10 pt-header-safe">
                <div className="px-6 pb-4 flex items-center justify-between">
                    <button type="button" onClick={handleBack} className="-ml-1 p-1 touch-manipulation">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <h1 className="text-xl font-bold text-white">팀 수정</h1>
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

            <div className="p-6 space-y-8">
                <div>
                    <h2 className="text-lg font-bold text-white mb-4">팀 이미지</h2>
                    <ProfilePhotoUpload
                        targetId={team.id}
                        currentPhotoUrl={formData.profile_img}
                        onUploadSuccess={handleProfilePhotoUpload}
                    />
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white">기본 정보</h2>
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">팀 이름 *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">소개</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">활동 지역</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">창단일</label>
                        <input
                            type="date"
                            value={formData.founded_date}
                            onChange={(e) => setFormData({ ...formData, founded_date: e.target.value })}
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white">소속사</h2>
                    <p className="text-white/40 text-sm">소속사가 있다면 검색하여 추가하세요. 여러 소속사를 등록할 수 있습니다.</p>
                    <MultiAgencySelector
                        dancerId={id}
                        value={selectedAgencies}
                        onChange={setSelectedAgencies}
                    />
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white">대표영상</h2>
                    <input
                        type="text"
                        value={formData.representative_video}
                        onChange={(e) => setFormData({ ...formData, representative_video: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                        placeholder="YouTube URL"
                    />
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white">SNS 연결</h2>
                    <SocialLinksInput
                        value={formData.social_links}
                        onChange={(links) => setFormData({ ...formData, social_links: links })}
                    />
                </div>

                <TeamMemberManager
                    teamId={team.id}
                    members={members}
                    onMembersChange={setMembers}
                />

                <div className="max-w-3xl">
                    <h2 className="text-lg font-bold text-white mb-4">포트폴리오</h2>
                    <PortfolioMediaManager
                        dancerId={team.id}
                        initialMedia={portfolioMedia}
                        onMediaChange={setPortfolioMedia}
                    />
                </div>

                <div className="max-w-3xl">
                    <TeamCareerManager teamId={team.id} />
                </div>
            </div>
        </div>
    )
}
