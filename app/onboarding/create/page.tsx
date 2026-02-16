'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload'
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
    'Hip Hop',
    'Popping',
    'Locking',
    'Waacking',
    'Voguing',
    'House',
    'Krump',
    'Breaking',
    'Heels',
    'Contemporary',
    'Jazz',
    'K-Pop'
]

export default function CreateProfilePage() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        stage_name: '',
        korean_name: '',
        location: '',
        bio: '',
        profile_img: '',
        gender: '' as '' | 'male' | 'female' | 'other',
        specialties: [] as string[],
        genres: [] as string[],
        social_links: {} as SocialLinks
    })

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin')
        }
    }, [user, authLoading, router])

    const setSpecialties = (specialties: string[]) => {
        setFormData(prev => ({ ...prev, specialties }))
    }

    const setGenres = (genres: string[]) => {
        setFormData(prev => ({ ...prev, genres }))
    }

    const nextStep = () => setStep(s => Math.min(s + 1, 6))
    const prevStep = () => setStep(s => Math.max(s - 1, 1))

    const handleFinish = async () => {
        if (!user) return

        setLoading(true)
        try {
            // Create dancer profile
            const { data, error } = await supabase
                .from('dancers')
                .insert({
                    owner_id: user.id,
                    stage_name: formData.stage_name,
                    korean_name: formData.korean_name || null,
                    location: formData.location || null,
                    bio: formData.bio || null,
                    profile_img: formData.profile_img || null,
                    gender: formData.gender || null,
                    specialties: formData.specialties.length > 0 ? formData.specialties : null,
                    genres: formData.genres.length > 0 ? formData.genres : null,
                    social_links: Object.keys(formData.social_links).some(k => (formData.social_links as any)[k]) ? formData.social_links : null
                })
                .select()
                .single()

            if (error) throw error

            alert('프로필이 생성되었습니다! 관리자 승인 후 공개됩니다.')
            router.push('/my/profiles')
        } catch (err: any) {
            alert('프로필 생성 실패: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-10">
                <div className="px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={step === 1 ? () => router.back() : prevStep}
                        className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <span className="font-bold text-lg text-white">프로필 생성 ({step}/6)</span>
                </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
                <AnimatePresence mode="wait">
                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">기본 정보</h2>
                                <p className="text-white/60">활동명과 기본 정보를 입력하세요</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        활동명 (Stage Name) *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="예: J-Ho"
                                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                                        value={formData.stage_name}
                                        onChange={e => setFormData({ ...formData, stage_name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        한글 이름 (선택)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="예: 제이호"
                                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                                        value={formData.korean_name}
                                        onChange={e => setFormData({ ...formData, korean_name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        활동 지역 (선택)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="예: Seoul"
                                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        성별
                                    </label>
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
                        </motion.div>
                    )}

                    {/* Step 2: Specialties */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">전문 분야</h2>
                                <p className="text-white/60">주요 활동 영역을 선택하세요 (선택 순서 = 우선순위)</p>
                            </div>

                            <PriorityMultiSelect
                                options={SPECIALTIES}
                                selected={formData.specialties}
                                onChange={setSpecialties}
                                variant="list"
                            />
                        </motion.div>
                    )}

                    {/* Step 3: Genres */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">장르</h2>
                                <p className="text-white/60">주로 하는 장르를 선택하세요 (선택 순서 = 우선순위)</p>
                            </div>

                            <PriorityMultiSelect
                                options={GENRES.map(g => ({ value: g, label: g }))}
                                selected={formData.genres}
                                onChange={setGenres}
                                variant="pills"
                            />
                        </motion.div>
                    )}

                    {/* Step 4: Profile Photo */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">프로필 사진</h2>
                                <p className="text-white/60">대표 이미지를 업로드하세요 (선택)</p>
                            </div>

                            <ProfilePhotoUpload
                                targetId={user!.id}
                                currentPhotoUrl={formData.profile_img}
                                onUploadSuccess={(url) => setFormData({ ...formData, profile_img: url })}
                            />
                        </motion.div>
                    )}

                    {/* Step 5: SNS Links */}
                    {step === 5 && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">SNS 연결</h2>
                                <p className="text-white/60">소셜 미디어 계정을 연결하세요 (선택)</p>
                            </div>

                            <SocialLinksInput
                                value={formData.social_links}
                                onChange={(links) => setFormData({ ...formData, social_links: links })}
                            />
                        </motion.div>
                    )}

                    {/* Step 6: Bio & Review */}
                    {step === 6 && (
                        <motion.div
                            key="step6"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">소개 및 확인</h2>
                                <p className="text-white/60">간단한 소개를 작성하고 정보를 확인하세요</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    소개 (선택)
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="자신을 소개하는 글을 작성하세요..."
                                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary resize-none"
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>

                            {/* Review Card */}
                            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4">
                                <div className="flex items-center gap-4">
                                    {formData.profile_img ? (
                                        <img
                                            src={formData.profile_img}
                                            alt="Profile"
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-neutral-800 rounded-full" />
                                    )}
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{formData.stage_name}</h3>
                                        {formData.korean_name && (
                                            <p className="text-white/60 text-sm">{formData.korean_name}</p>
                                        )}
                                    </div>
                                </div>

                                {formData.specialties.length > 0 && (
                                    <div>
                                        <p className="text-white/40 text-xs mb-2">전문 분야 (우선순위)</p>
                                        <div className="flex flex-wrap gap-1">
                                            {formData.specialties.map((s, i) => (
                                                <span key={s} className="px-2 py-1 bg-neutral-800 text-white/80 text-xs rounded flex items-center gap-1">
                                                    <span className="w-4 h-4 rounded-full bg-primary text-black text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                                                    {SPECIALTIES.find(sp => sp.value === s)?.label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {formData.genres.length > 0 && (
                                    <div>
                                        <p className="text-white/40 text-xs mb-2">장르 (우선순위)</p>
                                        <div className="flex flex-wrap gap-1">
                                            {formData.genres.map((g, i) => (
                                                <span key={g} className="px-2 py-1 bg-neutral-800 text-white/80 text-xs rounded flex items-center gap-1">
                                                    <span className="w-4 h-4 rounded-full bg-primary text-black text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                                                    {g}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(formData.social_links.instagram || formData.social_links.twitter || formData.social_links.youtube) && (
                                    <div>
                                        <p className="text-white/40 text-xs mb-2">SNS</p>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.social_links.instagram && (
                                                <span className="px-2 py-1 bg-neutral-800 text-white/80 text-xs rounded flex items-center gap-1">
                                                    📷 @{formData.social_links.instagram}
                                                </span>
                                            )}
                                            {formData.social_links.twitter && (
                                                <span className="px-2 py-1 bg-neutral-800 text-white/80 text-xs rounded flex items-center gap-1">
                                                    𝕏 @{formData.social_links.twitter}
                                                </span>
                                            )}
                                            {formData.social_links.youtube && (
                                                <span className="px-2 py-1 bg-neutral-800 text-white/80 text-xs rounded flex items-center gap-1">
                                                    ▶ {formData.social_links.youtube}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Fixed Footer Actions - with extra padding to avoid bottom nav */}
            {/* Fixed Footer Actions - limited to mobile width and centered over BottomNav */}
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-4 bg-background border-t border-neutral-800 z-20">
                <div className="flex gap-3">
                    {step > 1 && (
                        <button
                            onClick={prevStep}
                            disabled={loading}
                            className="px-6 py-3 rounded-lg font-medium text-white bg-neutral-800 hover:bg-neutral-700 transition-colors disabled:opacity-50"
                        >
                            이전
                        </button>
                    )}
                    <button
                        onClick={step === 6 ? handleFinish : nextStep}
                        disabled={(step === 1 && !formData.stage_name) || loading}
                        className="flex-1 px-6 py-3 rounded-lg font-bold text-black bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {step === 6 ? '프로필 생성 완료' : '다음'}
                                {step !== 6 && <ChevronRight className="w-5 h-5" />}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
