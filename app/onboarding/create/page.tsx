'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Check, ChevronRight, Loader2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload'

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
        specialties: [] as string[],
        genres: [] as string[]
    })

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin')
        }
    }, [user, authLoading, router])

    const toggleSpecialty = (value: string) => {
        setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.includes(value)
                ? prev.specialties.filter(s => s !== value)
                : [...prev.specialties, value]
        }))
    }

    const toggleGenre = (genre: string) => {
        setFormData(prev => ({
            ...prev,
            genres: prev.genres.includes(genre)
                ? prev.genres.filter(g => g !== genre)
                : [...prev.genres, genre]
        }))
    }

    const nextStep = () => setStep(s => Math.min(s + 1, 5))
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
                    specialties: formData.specialties.length > 0 ? formData.specialties : null,
                    genres: formData.genres.length > 0 ? formData.genres : null
                })
                .select()
                .single()

            if (error) throw error

            alert('프로필이 생성되었습니다!')
            router.push(`/profile/${data.id}`)
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
                    <span className="font-bold text-lg text-white">프로필 생성 ({step}/5)</span>
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
                                <p className="text-white/60">주요 활동 영역을 선택하세요 (복수 선택 가능)</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {SPECIALTIES.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => toggleSpecialty(value)}
                                        className={cn(
                                            'flex items-center justify-between p-4 rounded-lg border transition-all',
                                            formData.specialties.includes(value)
                                                ? 'border-primary bg-primary/10'
                                                : 'border-neutral-800 hover:bg-neutral-900'
                                        )}
                                    >
                                        <span className="font-medium text-white">{label}</span>
                                        {formData.specialties.includes(value) && (
                                            <Check className="w-5 h-5 text-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
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
                                <p className="text-white/60">주로 하는 장르를 선택하세요 (복수 선택 가능)</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {GENRES.map(genre => (
                                    <button
                                        key={genre}
                                        onClick={() => toggleGenre(genre)}
                                        className={cn(
                                            'px-4 py-2 rounded-full border transition-all',
                                            formData.genres.includes(genre)
                                                ? 'border-primary bg-primary text-black font-semibold'
                                                : 'border-neutral-800 text-white hover:bg-neutral-900'
                                        )}
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>

                            {formData.genres.length > 0 && (
                                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                                    <p className="text-white/60 text-sm mb-2">선택된 장르:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.genres.map(genre => (
                                            <span
                                                key={genre}
                                                className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-1"
                                            >
                                                {genre}
                                                <button onClick={() => toggleGenre(genre)}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
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

                    {/* Step 5: Bio & Review */}
                    {step === 5 && (
                        <motion.div
                            key="step5"
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
                                        <p className="text-white/40 text-xs mb-2">전문 분야</p>
                                        <div className="flex flex-wrap gap-1">
                                            {formData.specialties.map(s => (
                                                <span key={s} className="px-2 py-1 bg-neutral-800 text-white/80 text-xs rounded">
                                                    {SPECIALTIES.find(sp => sp.value === s)?.label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {formData.genres.length > 0 && (
                                    <div>
                                        <p className="text-white/40 text-xs mb-2">장르</p>
                                        <div className="flex flex-wrap gap-1">
                                            {formData.genres.map(g => (
                                                <span key={g} className="px-2 py-1 bg-neutral-800 text-white/80 text-xs rounded">
                                                    {g}
                                                </span>
                                            ))}
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
                        onClick={step === 5 ? handleFinish : nextStep}
                        disabled={(step === 1 && !formData.stage_name) || loading}
                        className="flex-1 px-6 py-3 rounded-lg font-bold text-black bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {step === 5 ? '프로필 생성 완료' : '다음'}
                                {step !== 5 && <ChevronRight className="w-5 h-5" />}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
