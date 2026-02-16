'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewProposalPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        projectTitle: '',
        companyName: '',
        contactPerson: '',
        category: 'choreo',
        fee: '',
        startDate: '',
        endDate: '',
        message: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: dancer } = await supabase
                .from('dancers')
                .select('id')
                .eq('owner_id', user!.id)
                .single()

            if (!dancer) {
                alert('댄서 프로필을 먼저 생성해주세요.')
                return
            }

            const { data: project, error: projectError } = await supabase
                .from('projects')
                .insert({
                    owner_id: user!.id,
                    title: formData.projectTitle,
                    category: formData.category,
                    status: 'recruiting',
                    confirmation_status: 'negotiating',
                    progress_status: 'idle',
                    budget: formData.fee ? parseInt(formData.fee) : null,
                    start_date: formData.startDate || null,
                    end_date: formData.endDate || null
                })
                .select()
                .single()

            if (projectError) throw projectError

            const { error: proposalError } = await supabase
                .from('proposals')
                .insert({
                    project_id: project.id,
                    dancer_id: dancer.id,
                    sender_id: user!.id,
                    role: formData.projectTitle,
                    fee: formData.fee ? parseInt(formData.fee) : null,
                    details: formData.message,
                    status: 'pending'
                })

            if (proposalError) throw proposalError

            alert('제안이 등록되었습니다!')
            router.push('/my/proposals')
        } catch (err: any) {
            alert('오류: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-10">
                <div className="px-6 py-4 flex items-center gap-4">
                    <Link href="/my/proposals">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-white">수동 제안 추가</h1>
                        <p className="text-white/60 text-sm">오프라인 제안을 기록하세요</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">프로젝트 제목 *</label>
                    <input
                        type="text"
                        value={formData.projectTitle}
                        onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                        placeholder="예: 뮤직비디오 안무 제작"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">회사/단체명</label>
                    <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                        placeholder="예: YG Entertainment"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">담당자명</label>
                    <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                        placeholder="예: 김담당"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">카테고리 *</label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-primary"
                    >
                        <option value="choreo">안무 제작</option>
                        <option value="broadcast">방송 출연</option>
                        <option value="performance">공연</option>
                        <option value="workshop">워크샵</option>
                        <option value="judge">심사</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">제안 금액 (원)</label>
                    <input
                        type="number"
                        value={formData.fee}
                        onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                        placeholder="예: 5000000"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">시작일</label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">종료일</label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">메모</label>
                    <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary resize-none"
                        placeholder="추가 정보나 메모를 입력하세요"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? '등록 중...' : '제안 등록'}
                </button>
            </form>
        </div>
    )
}
