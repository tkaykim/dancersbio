'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { useBackWithFallback } from '@/lib/useBackWithFallback'
import type { SocialLinks } from '@/lib/supabase'
import SocialLinksInput from '@/components/profile/SocialLinksInput'

export default function NewTeamPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const handleBack = useBackWithFallback('/my/teams')
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        location: '',
        founded_date: '',
        social_links: {} as SocialLinks,
        representative_video: '',
    })

    useEffect(() => {
        if (!authLoading && !user) router.push('/auth/signin')
    }, [user, authLoading, router])

    const handleSave = async () => {
        if (!formData.name.trim()) {
            alert('팀 이름을 입력하세요')
            return
        }
        setSaving(true)
        try {
            const slug = formData.name.trim().toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, '')
            const cleanedSocialLinks: SocialLinks = {}
            if (formData.social_links.instagram) cleanedSocialLinks.instagram = formData.social_links.instagram
            if (formData.social_links.twitter) cleanedSocialLinks.twitter = formData.social_links.twitter
            if (formData.social_links.youtube) cleanedSocialLinks.youtube = formData.social_links.youtube

            const { data, error } = await supabase
                .from('teams')
                .insert({
                    name: formData.name.trim(),
                    slug,
                    leader_id: user!.id,
                    bio: formData.bio || null,
                    location: formData.location || null,
                    founded_date: formData.founded_date || null,
                    social_links: Object.keys(cleanedSocialLinks).length > 0 ? cleanedSocialLinks : null,
                    representative_video: formData.representative_video || null,
                })
                .select('id')
                .single()

            if (error) throw error
            router.push(`/my/teams/${data.id}/edit`)
        } catch (err: any) {
            alert('팀 생성 실패: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-10 pt-header-safe">
                <div className="px-6 pb-4 flex items-center justify-between">
                    <button type="button" onClick={handleBack} className="-ml-1 p-1 touch-manipulation">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <h1 className="text-xl font-bold text-white">새 팀 만들기</h1>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        생성
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">팀 이름 *</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                        placeholder="예: Just Jerk, BEBE"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">소개</label>
                    <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={3}
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
                    <label className="block text-sm font-medium text-white/80 mb-2">창단일</label>
                    <input
                        type="date"
                        value={formData.founded_date}
                        onChange={(e) => setFormData({ ...formData, founded_date: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">대표영상 URL</label>
                    <input
                        type="text"
                        value={formData.representative_video}
                        onChange={(e) => setFormData({ ...formData, representative_video: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                        placeholder="YouTube URL"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">SNS 연결</label>
                    <SocialLinksInput
                        value={formData.social_links}
                        onChange={(links) => setFormData({ ...formData, social_links: links })}
                    />
                </div>

                <p className="text-xs text-white/30">팀 생성 후 멤버 추가, 포트폴리오, 경력 등을 편집할 수 있습니다.</p>
            </div>
        </div>
    )
}
