'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Crown, Plus, Trash2, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useMyProfiles } from '@/hooks/useMyProfiles'
import { formatEmbargoDate, getKSTDateString } from '@/lib/utils'

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
    const { allProfiles } = useMyProfiles()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '', description: '', category: 'choreo',
        contractAmount: '', budget: '',
        startDate: '', endDate: '', dueDate: '',
        companyName: '', contactPerson: '',
        pmDancerId: '', embargoDate: '',
    })
    type EventDateRow = { date: string; time: string; label: string }
    const [eventDates, setEventDates] = useState<EventDateRow[]>([{ date: '', time: '', label: '' }])

    useEffect(() => {
        if (allProfiles.length > 0 && !formData.pmDancerId) {
            setFormData(prev => ({ ...prev, pmDancerId: allProfiles[0].id }))
        }
    }, [allProfiles])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setLoading(true)

        try {
            let clientProfileId: string | null = null
            if (formData.companyName.trim()) {
                const { data: existingClient } = await supabase.from('clients').select('id')
                    .eq('owner_id', user.id).eq('company_name', formData.companyName.trim()).single()
                if (existingClient) {
                    clientProfileId = existingClient.id
                } else {
                    const { data: newClient, error: clientError } = await supabase.from('clients')
                        .insert({ owner_id: user.id, company_name: formData.companyName.trim(), contact_person: formData.contactPerson.trim() || user.email || '' })
                        .select('id').single()
                    if (clientError) throw clientError
                    clientProfileId = newClient.id
                }
            }

            const { data: project, error } = await supabase.from('projects').insert({
                owner_id: user.id, client_profile_id: clientProfileId,
                pm_dancer_id: formData.pmDancerId || null,
                contract_amount: formData.contractAmount ? parseInt(formData.contractAmount) : null,
                title: formData.title.trim(), description: formData.description.trim() || null,
                category: formData.category,
                status: 'active', confirmation_status: 'confirmed', progress_status: 'recruiting',
                visibility: 'private',
                embargo_date: formData.embargoDate || null,
                budget: formData.budget ? parseInt(formData.budget) : null,
                start_date: formData.startDate || null,
                end_date: formData.endDate || null,
                due_date: formData.dueDate || null,
            }).select('id').single()

            if (error) throw error

            const validEventDates = eventDates.filter((r) => r.date.trim())
            if (validEventDates.length > 0) {
                await supabase.from('project_event_dates').insert(
                    validEventDates.map((r, i) => ({
                        project_id: project.id,
                        event_date: r.date,
                        event_time: r.time.trim() || null,
                        label: r.label.trim() || null,
                        sort_order: i,
                    }))
                )
            }

            router.push(`/my/projects/${project.id}/invite`)
        } catch (err: any) {
            alert('오류: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const u = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }))

    const inputClass = "w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-primary"
    const labelClass = "block text-sm font-medium text-white/80 mb-1.5"
    const hintClass = "text-[11px] text-white/35 mb-2"

    return (
        <div className="min-h-screen bg-background">
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-10">
                <div className="px-5 py-3.5 flex items-center gap-3">
                    <Link href="/my/projects"><ArrowLeft className="w-5 h-5 text-white/70" /></Link>
                    <div>
                        <h1 className="text-lg font-bold text-white">새 프로젝트</h1>
                        <p className="text-white/35 text-[11px]">프로젝트를 만들고 댄서를 초대하세요</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* 프로젝트명 */}
                <div>
                    <label className={labelClass}>프로젝트명 *</label>
                    <input type="text" value={formData.title} onChange={(e) => u('title', e.target.value)}
                        required placeholder="예: 뮤직비디오 안무 제작" className={inputClass} />
                </div>

                {/* 설명 */}
                <div>
                    <label className={labelClass}>설명</label>
                    <textarea value={formData.description} onChange={(e) => u('description', e.target.value)}
                        rows={2} placeholder="프로젝트 간략 설명" className={`${inputClass} resize-none`} />
                </div>

                {/* 카테고리 + PM 선택 */}
                <div className={`grid gap-3 ${allProfiles.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <div>
                        <label className={labelClass}>카테고리 *</label>
                        <select value={formData.category} onChange={(e) => u('category', e.target.value)} className={inputClass}>
                            {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    {allProfiles.length > 0 && (
                        <div>
                            <label className={labelClass}>
                                <Crown className="w-3.5 h-3.5 inline mr-0.5 text-primary" /> PM 댄서
                            </label>
                            <select value={formData.pmDancerId} onChange={(e) => u('pmDancerId', e.target.value)} className={inputClass}>
                                <option value="">선택 안함</option>
                                {allProfiles.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.stage_name} {p.role === 'manager' ? '(매니저)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* 금액 (계약 + 예산) */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClass}>계약 금액 (원)</label>
                        <p className={hintClass}>PM 댄서의 매출</p>
                        <input type="number" value={formData.contractAmount} onChange={(e) => u('contractAmount', e.target.value)}
                            placeholder="미정 가능" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>섭외 예산 (원)</label>
                        <p className={hintClass}>댄서 섭외 배정 예산</p>
                        <input type="number" value={formData.budget} onChange={(e) => u('budget', e.target.value)}
                            placeholder="선택사항" className={inputClass} />
                    </div>
                </div>

                {/* 행사 일정 (여러 날짜 + 선택 시각) */}
                <div>
                    <label className={labelClass}>
                        <Calendar className="w-3.5 h-3.5 inline mr-0.5 text-primary" />
                        행사 일정
                    </label>
                    <p className={hintClass}>날짜는 필수, 시각은 선택. 여러 일정을 추가할 수 있습니다 (예: 1일차 워크샵, 2일차 대회).</p>
                    <div className="space-y-2">
                        {eventDates.map((row, idx) => (
                            <div key={idx} className="flex flex-wrap items-center gap-2">
                                <input
                                    type="date"
                                    value={row.date}
                                    onChange={(e) =>
                                        setEventDates((prev) =>
                                            prev.map((r, i) => (i === idx ? { ...r, date: e.target.value } : r))
                                        )
                                    }
                                    className={`${inputClass} flex-1 min-w-[120px]`}
                                />
                                <input
                                    type="time"
                                    value={row.time}
                                    onChange={(e) =>
                                        setEventDates((prev) =>
                                            prev.map((r, i) => (i === idx ? { ...r, time: e.target.value } : r))
                                        )
                                    }
                                    className={`${inputClass} w-28`}
                                    placeholder="시각(선택)"
                                />
                                <input
                                    type="text"
                                    value={row.label}
                                    onChange={(e) =>
                                        setEventDates((prev) =>
                                            prev.map((r, i) => (i === idx ? { ...r, label: e.target.value } : r))
                                        )
                                    }
                                    placeholder="예: 워크샵, 대회"
                                    className={`${inputClass} flex-1 min-w-[100px] max-w-[140px]`}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setEventDates((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev))
                                    }
                                    className="p-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
                                    aria-label="삭제"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setEventDates((prev) => [...prev, { date: '', time: '', label: '' }])}
                            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                            <Plus className="w-4 h-4" /> 일정 추가
                        </button>
                    </div>
                </div>

                {/* 시작일/종료일/마감일 (요약용, 선택) */}
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className={labelClass}>시작일</label>
                        <input type="date" value={formData.startDate} onChange={(e) => u('startDate', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>종료일</label>
                        <input type="date" value={formData.endDate} onChange={(e) => u('endDate', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>마감일</label>
                        <input type="date" value={formData.dueDate} onChange={(e) => u('dueDate', e.target.value)} className={inputClass} />
                    </div>
                </div>

                {/* 엠바고 (간결한 1줄) */}
                <div className="border-t border-neutral-800 pt-4">
                    <label className={labelClass}>엠바고 날짜 (선택)</label>
                    <p className={hintClass}>
                        프로젝트는 기본 비공개입니다. 엠바고 설정 시 해당 날짜까지 비공개 유지, 다음날 자동 공개됩니다.
                    </p>
                    <input type="date" value={formData.embargoDate}
                        onChange={(e) => {
                            const d = e.target.value
                            if (!d) { u('embargoDate', ''); return }
                            if (d <= getKSTDateString()) { alert('오늘(KST) 이후 날짜만 가능합니다.'); return }
                            const formatted = formatEmbargoDate(d)
                            if (confirm(
                                `엠바고: ${formatted} 23:59(KST)까지 비공개\n다음날 00:00(KST)부터 자동 공개\n\n* 한국시각(KST, UTC+9) 기준\n\n설정하시겠습니까?`
                            )) {
                                u('embargoDate', d)
                            }
                        }}
                        min={getKSTDateString()} className={inputClass} />
                    {formData.embargoDate && (
                        <p className="text-[11px] text-orange-400/60 mt-1.5">
                            {formatEmbargoDate(formData.embargoDate)} 23:59(KST)까지 비공개 → 다음날 자동 공개
                        </p>
                    )}
                </div>

                {/* 회사 정보 (간결) */}
                <div className="border-t border-neutral-800 pt-4">
                    <p className="text-xs text-white/35 mb-3">회사/단체 정보 (선택)</p>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" value={formData.companyName} onChange={(e) => u('companyName', e.target.value)}
                            placeholder="회사/단체명" className={inputClass} />
                        <input type="text" value={formData.contactPerson} onChange={(e) => u('contactPerson', e.target.value)}
                            placeholder="담당자명" className={inputClass} />
                    </div>
                </div>

                <button type="submit" disabled={loading || !formData.title.trim()}
                    className="w-full py-3.5 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '프로젝트 생성 & 댄서 초대'}
                </button>
            </form>
        </div>
    )
}
