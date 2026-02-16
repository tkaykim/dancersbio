import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, X, Edit2, Loader2, Trash2, ChevronDown, ChevronUp, Save, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Drawer from '@/components/ui/Drawer'

interface CareerItem {
    id: number
    type: string
    title: string
    details: {
        year?: string
        month?: string
        role?: string
        description?: string
        link?: string
        location?: string
    }
}

interface CareerHistoryManagerProps {
    dancerId: string
}

const CATEGORIES = [
    { id: 'choreo', label: '안무', roles: ['제작', '공동제작', '참여'] },
    { id: 'performance', label: '공연', roles: ['댄서', '게스트', '디렉터'] },
    { id: 'broadcast', label: '방송', roles: ['출연', '안무', '백업댄서'] },
    { id: 'award', label: '수상', roles: ['우승', '준우승', '베스트상', '참가'] },
    { id: 'judge', label: '심사', roles: [] },
    { id: 'workshop', label: '워크샵', roles: [] },
    { id: 'education', label: '교육', roles: [] },
    { id: 'other', label: '기타', roles: [] }
]

export default function CareerHistoryManager({ dancerId }: CareerHistoryManagerProps) {
    const [careers, setCareers] = useState<CareerItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [activeCategory, setActiveCategory] = useState<string>('choreo')
    const [saving, setSaving] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        type: 'choreo',
        title: '',
        year: new Date().getFullYear().toString(),
        month: '',
        role: '',
        description: '',
        link: ''
    })

    useEffect(() => {
        fetchCareers()
    }, [dancerId])

    const fetchCareers = async () => {
        try {
            const { data, error } = await supabase
                .from('careers')
                .select('*')
                .eq('dancer_id', dancerId)
                .order('id', { ascending: false }) // Most recent added first, or sort by year in JS

            if (error) throw error

            // Sort by Date (Year DESC, Month DESC)
            const sorted = (data || []).sort((a, b) => {
                const yearA = parseInt(a.details.year || '0')
                const yearB = parseInt(b.details.year || '0')
                if (yearA !== yearB) return yearB - yearA

                const monthA = parseInt(a.details.month || '0')
                const monthB = parseInt(b.details.month || '0')
                return monthB - monthA
            })

            setCareers(sorted)
        } catch (err) {
            console.error('Error fetching careers:', err)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = (keepCategory = false) => {
        setFormData({
            type: keepCategory ? formData.type : activeCategory,
            title: '',
            year: formData.year || new Date().getFullYear().toString(), // Keep year for convenience
            month: '',
            role: '',
            description: '',
            link: ''
        })
        setEditingId(null)
    }

    const openDrawer = (item?: CareerItem, preSelectedCategory?: string) => {
        if (item) {
            setFormData({
                type: item.type,
                title: item.title,
                year: item.details.year || '',
                month: item.details.month || '',
                role: item.details.role || '',
                description: item.details.description || '',
                link: item.details.link || ''
            })
            setEditingId(item.id)
            // setActiveCategory(item.type) // Don't force switch main accordion, but maybe? 
            // Actually, for user context, it's nice if the accordion matches, but we don't need to force it if they just opened an item.
        } else {
            resetForm(true)
            if (preSelectedCategory) {
                setFormData(prev => ({ ...prev, type: preSelectedCategory }))
            }
        }
        setIsDrawerOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return

        try {
            const { error } = await supabase
                .from('careers')
                .delete()
                .eq('id', id)

            if (error) throw error
            setCareers(careers.filter(c => c.id !== id))
        } catch (err) {
            alert('삭제 실패')
        }
    }

    const handleSubmit = async (e: React.FormEvent, closeAfterSave = true) => {
        e.preventDefault()
        if (!formData.title) return alert('제목을 입력해주세요')

        setSaving(true)
        // date 컬럼: year/month로 구성, 없으면 현재 날짜
        const dateStr = formData.year
            ? `${formData.year}-${(formData.month || '01').padStart(2, '0')}-01`
            : new Date().toISOString().split('T')[0]

        const careerData = {
            dancer_id: dancerId,
            type: formData.type,
            title: formData.title,
            date: dateStr,
            details: {
                year: formData.year,
                month: formData.month,
                role: formData.role,
                description: formData.description,
                link: formData.link
            }
        }

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('careers')
                    .update(careerData)
                    .eq('id', editingId)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('careers')
                    .insert(careerData)
                if (error) throw error
            }

            await fetchCareers() // Refresh list

            if (closeAfterSave) {
                setIsDrawerOpen(false)
                resetForm()
            } else {
                // "Save & Add Another" logic
                alert('저장되었습니다. 다음 이력을 입력하세요.')
                resetForm(true) // Keep category
                // Focus title input? (Ref handling omitted for brevity)
            }
        } catch (err: any) {
            alert('저장 실패: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    // const filteredCareers = careers.filter(c => c.type === activeCategory) // Removed: Using categories map directly
    // const currentCategoryRoles = CATEGORIES.find(c => c.id === activeCategory)?.roles || [] // Removed: logic moved to form


    if (loading) return <div><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>

    return (
        <div className="space-y-4">
            {/* Accordion List */}
            <div className="space-y-4">
                {CATEGORIES.map(cat => {
                    const catItems = careers.filter(c => c.type === cat.id)
                    const isOpen = activeCategory === cat.id // Reusing activeCategory to track open section (Accordion behavior: one open at a time, or change to allow toggling)
                    // Let's implement independent open state handling if needed, but 'activeCategory' works for an Accordion where clicking one opens it.
                    // To allow closing, we need logic. Let's change this to use a dedicated state or logic.
                    // Actually, let's allow multiple open or just toggle visibility.
                    // For simplicity and typical mobile UX, 'Accordion' usually implies headers.

                    return (
                        <div key={cat.id} className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/50">
                            <button
                                onClick={() => setActiveCategory(activeCategory === cat.id ? '' : cat.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-5 py-4 transition-colors",
                                    activeCategory === cat.id ? "bg-neutral-800" : "hover:bg-neutral-800/50"
                                )}
                            >
                                <span className={cn("font-bold text-sm", activeCategory === cat.id ? "text-white" : "text-white/60")}>
                                    {cat.label} <span className="text-white/30 text-xs ml-1 font-normal">({catItems.length})</span>
                                </span>
                                {activeCategory === cat.id ? (
                                    <ChevronUp className="w-5 h-5 text-white/40" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-white/40" />
                                )}
                            </button>

                            {activeCategory === cat.id && (
                                <div className="p-2 space-y-2 border-t border-neutral-800 animate-in slide-in-from-top-2 duration-200">
                                    {catItems.length === 0 && (
                                        <div
                                            onClick={() => openDrawer(undefined, cat.id)}
                                            className="py-6 border border-dashed border-neutral-800/50 rounded-lg flex flex-col items-center justify-center text-white/30 cursor-pointer hover:border-primary/30 hover:text-primary transition-colors mx-2"
                                        >
                                            <Plus className="w-6 h-6 mb-1 opacity-50" />
                                            <p className="text-xs">이력 추가하기</p>
                                        </div>
                                    )}
                                    {catItems.map(item => (
                                        <div key={item.id} className="bg-black/40 border border-neutral-800/50 rounded-lg p-3 flex justify-between items-start group hover:border-neutral-700 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="shrink-0 text-primary/70 font-mono text-[10px] font-bold px-1.5 py-0.5 bg-primary/5 rounded border border-primary/10">
                                                        {item.details.year}
                                                        {item.details.month ? `.${item.details.month}` : ''}
                                                    </span>
                                                    {item.details.role && (
                                                        <span className="shrink-0 text-white/40 text-[10px] px-1.5 py-0.5 border border-white/5 rounded bg-white/5">
                                                            {item.details.role}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-white font-medium text-sm truncate pr-2">{item.title}</h3>
                                                {item.details.description && (
                                                    <p className="text-white/40 text-xs line-clamp-1 mt-0.5">{item.details.description}</p>
                                                )}
                                            </div>
                                            <button onClick={() => openDrawer(item)} className="p-1.5 hover:bg-white/10 rounded-md text-white/40 hover:text-white transition-colors">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Floating Add Button */}
            <button
                onClick={() => openDrawer()}
                className="w-full py-4 bg-neutral-900 border border-neutral-800 rounded-xl text-white font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 mt-6 shadow-lg"
            >
                <Plus className="w-5 h-5" />
                새로운 이력 추가하기
            </button>

            {/* Drawer Form */}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title={editingId ? '이력 수정' : '새 이력 추가'}
            >
                <form className="space-y-5 pb-8">
                    {/* Category Select Dropdown */}
                    <div>
                        <label className="block text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider">카테고리</label>
                        <div className="relative">
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value, role: '' }))}
                                className="w-full appearance-none bg-black/50 border border-neutral-800 rounded-xl px-4 py-3 text-white pr-10 focus:outline-none focus:border-primary cursor-pointer transition-colors"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">제목 <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 bg-black/50 border border-neutral-800 rounded-xl text-white focus:border-primary focus:outline-none"
                            placeholder="활동 제목 입력"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">연도</label>
                            <input
                                type="number"
                                value={formData.year}
                                onChange={e => setFormData({ ...formData, year: e.target.value })}
                                className="w-full px-4 py-3 bg-black/50 border border-neutral-800 rounded-xl text-white focus:border-primary focus:outline-none"
                                placeholder="YYYY"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">월</label>
                            <input
                                type="number"
                                max="12"
                                min="1"
                                value={formData.month}
                                onChange={e => setFormData({ ...formData, month: e.target.value })}
                                className="w-full px-4 py-3 bg-black/50 border border-neutral-800 rounded-xl text-white focus:border-primary focus:outline-none"
                                placeholder="MM"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">역할</label>
                        {
                            // Find roles for the *selected form type*, not the active tab
                            (() => {
                                const formCategoryRoles = CATEGORIES.find(c => c.id === formData.type)?.roles || []
                                return formCategoryRoles.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {formCategoryRoles.map(role => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role: role })}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border",
                                                    formData.role === role
                                                        ? "bg-neutral-200 text-black border-neutral-200"
                                                        : "bg-neutral-800 text-white/50 border-neutral-700 hover:text-white"
                                                )}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                ) : null
                            })()
                        }
                        <input
                            type="text"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-3 bg-black/50 border border-neutral-800 rounded-xl text-white focus:border-primary focus:outline-none"
                            placeholder="역할 직접 입력"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">관련 영상 링크 (선택사항)</label>
                        <input
                            type="url"
                            value={formData.link}
                            onChange={e => setFormData({ ...formData, link: e.target.value })}
                            className="w-full px-4 py-3 bg-black/50 border border-neutral-800 rounded-xl text-white focus:border-primary focus:outline-none"
                            placeholder="https://youtube.com/..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">상세 설명</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-black/50 border border-neutral-800 rounded-xl text-white focus:border-primary focus:outline-none resize-none h-24"
                            placeholder="추가 설명..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-neutral-800">
                        {editingId && (
                            <button
                                type="button"
                                onClick={async () => {
                                    await handleDelete(editingId)
                                    setIsDrawerOpen(false)
                                }}
                                className="px-4 py-3 bg-red-500/10 text-red-500 rounded-xl font-medium hover:bg-red-500/20"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}

                        <div className="flex-1 flex gap-2">
                            {!editingId && (
                                <button
                                    type="button"
                                    onClick={(e) => handleSubmit(e, false)}
                                    disabled={saving}
                                    className="flex-1 py-3 bg-neutral-800 text-white rounded-xl font-medium hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ChevronsRight className="w-4 h-4" />
                                    저장 후 계속
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e, true)}
                                disabled={saving}
                                className="flex-1 py-3 bg-primary text-black rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {editingId ? '수정 완료' : '저장 완료'}
                            </button>
                        </div>
                    </div>
                </form>
            </Drawer>
        </div>
    )
}
