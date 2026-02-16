'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

const CATEGORY_OPTIONS = [
    { value: 'choreo', label: '안무 제작' },
    { value: 'broadcast', label: '방송 출연' },
    { value: 'performance', label: '공연' },
    { value: 'workshop', label: '워크샵' },
    { value: 'judge', label: '심사' },
]

export default function NewProjectPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'choreo',
        budget: '',
        startDate: '',
        endDate: '',
        companyName: '',
        contactPerson: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setLoading(true)

        try {
            let clientProfileId: string | null = null

            if (formData.companyName.trim()) {
                const { data: existingClient } = await supabase
                    .from('clients')
                    .select('id')
                    .eq('owner_id', user.id)
                    .eq('company_name', formData.companyName.trim())
                    .single()

                if (existingClient) {
                    clientProfileId = existingClient.id
                } else {
                    const { data: newClient, error: clientError } = await supabase
                        .from('clients')
                        .insert({
                            owner_id: user.id,
                            company_name: formData.companyName.trim(),
                            contact_person: formData.contactPerson.trim() || user.email || '',
                        })
                        .select('id')
                        .single()

                    if (clientError) throw clientError
                    clientProfileId = newClient.id
                }
            }

            const { data: project, error } = await supabase
                .from('projects')
                .insert({
                    owner_id: user.id,
                    client_profile_id: clientProfileId,
                    title: formData.title.trim(),
                    description: formData.description.trim() || null,
                    category: formData.category,
                    status: 'active',
                    confirmation_status: 'confirmed',
                    progress_status: 'recruiting',
                    budget: formData.budget ? parseInt(formData.budget) : null,
                    start_date: formData.startDate || null,
                    end_date: formData.endDate || null,
                })
                .select('id')
                .single()

            if (error) throw error

            router.push(`/my/projects/${project.id}/invite`)
        } catch (err: any) {
            alert('오류: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-10">
                <div className="px-6 py-4 flex items-center gap-4">
                    <Link href="/my/projects"><ArrowLeft className="w-6 h-6 text-white" /></Link>
                    <div>
                        <h1 className="text-xl font-bold text-white">새 프로젝트</h1>
                        <p className="text-white/40 text-xs">프로젝트를 만들고 댄서를 초대하세요</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">프로젝트명 *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        required
                        placeholder="예: 뮤직비디오 안무 제작"
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-primary"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">프로젝트 설명</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        rows={3}
                        placeholder="프로젝트에 대한 간략한 설명을 입력하세요"
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-primary resize-none"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">카테고리 *</label>
                    <select
                        value={formData.category}
                        onChange={(e) => updateField('category', e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-primary"
                    >
                        {CATEGORY_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Budget */}
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">총 예산 (원)</label>
                    <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => updateField('budget', e.target.value)}
                        placeholder="예: 5000000"
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-primary"
                    />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">시작일</label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => updateField('startDate', e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">종료일</label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => updateField('endDate', e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>

                {/* Divider - Company Info */}
                <div className="border-t border-neutral-800 pt-5">
                    <p className="text-sm font-medium text-white/60 mb-1">회사/단체 정보 (선택)</p>
                    <p className="text-xs text-white/30 mb-4">비즈니스 명의가 필요한 경우 입력하세요</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">회사/단체명</label>
                            <input
                                type="text"
                                value={formData.companyName}
                                onChange={(e) => updateField('companyName', e.target.value)}
                                placeholder="예: YG Entertainment"
                                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">담당자명</label>
                            <input
                                type="text"
                                value={formData.contactPerson}
                                onChange={(e) => updateField('contactPerson', e.target.value)}
                                placeholder="예: 김담당"
                                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !formData.title.trim()}
                    className="w-full py-3.5 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        '프로젝트 생성 & 댄서 초대'
                    )}
                </button>
            </form>
        </div>
    )
}
