'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { TeamCareer } from '@/lib/supabase'
import { Plus, Trash2, ChevronDown, ChevronUp, Eye, EyeOff, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const CAREER_TYPES = [
    { value: 'choreo', label: '안무/MV' },
    { value: 'broadcast', label: '방송' },
    { value: 'performance', label: '공연' },
    { value: 'award', label: '수상' },
    { value: 'judge', label: '심사' },
    { value: 'workshop', label: '워크샵' },
    { value: 'other', label: '기타' },
]

interface TeamCareerManagerProps {
    teamId: string
}

export default function TeamCareerManager({ teamId }: TeamCareerManagerProps) {
    const [careers, setCareers] = useState<TeamCareer[]>([])
    const [expanded, setExpanded] = useState<number | null>(null)
    const [adding, setAdding] = useState(false)
    const [newCareer, setNewCareer] = useState({ type: 'choreo', title: '', date: '', youtube_url: '' })

    useEffect(() => {
        fetchCareers()
    }, [teamId])

    const fetchCareers = async () => {
        const { data } = await supabase
            .from('team_careers')
            .select('*')
            .eq('team_id', teamId)
            .order('date', { ascending: false })
        if (data) setCareers(data)
    }

    const addCareer = async () => {
        if (!newCareer.title.trim()) return
        const { error } = await supabase.from('team_careers').insert({
            team_id: teamId,
            type: newCareer.type,
            title: newCareer.title.trim(),
            date: newCareer.date || null,
            details: newCareer.youtube_url ? { youtube_url: newCareer.youtube_url } : null,
            is_public: false,
        })
        if (error) { alert('추가 실패: ' + error.message); return }
        setNewCareer({ type: 'choreo', title: '', date: '', youtube_url: '' })
        setAdding(false)
        fetchCareers()
    }

    const deleteCareer = async (id: number) => {
        if (!confirm('이 경력을 삭제하시겠습니까?')) return
        await supabase.from('team_careers').delete().eq('id', id)
        fetchCareers()
    }

    const togglePublic = async (career: TeamCareer) => {
        await supabase.from('team_careers').update({ is_public: !career.is_public }).eq('id', career.id)
        fetchCareers()
    }

    const toggleRepresentative = async (career: TeamCareer) => {
        await supabase.from('team_careers').update({ is_representative: !career.is_representative }).eq('id', career.id)
        fetchCareers()
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">팀 경력</h2>
                <button type="button" onClick={() => setAdding(!adding)} className="text-sm text-primary flex items-center gap-1">
                    <Plus className="w-4 h-4" />추가
                </button>
            </div>

            {adding && (
                <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 space-y-3">
                    <select
                        value={newCareer.type}
                        onChange={(e) => setNewCareer({ ...newCareer, type: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                    >
                        {CAREER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="제목 *"
                        value={newCareer.title}
                        onChange={(e) => setNewCareer({ ...newCareer, title: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-primary"
                    />
                    <input
                        type="text"
                        placeholder="날짜 (예: 2024)"
                        value={newCareer.date}
                        onChange={(e) => setNewCareer({ ...newCareer, date: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-primary"
                    />
                    <input
                        type="text"
                        placeholder="YouTube URL (선택)"
                        value={newCareer.youtube_url}
                        onChange={(e) => setNewCareer({ ...newCareer, youtube_url: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-primary"
                    />
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setAdding(false)} className="flex-1 py-2 text-sm text-white/60 bg-neutral-800 rounded-lg">취소</button>
                        <button type="button" onClick={addCareer} disabled={!newCareer.title.trim()} className="flex-1 py-2 text-sm text-black bg-primary rounded-lg disabled:opacity-50">추가</button>
                    </div>
                </div>
            )}

            {careers.length === 0 && !adding ? (
                <p className="text-sm text-white/40 text-center py-6">아직 등록된 경력이 없습니다</p>
            ) : (
                <div className="space-y-2">
                    {careers.map(c => (
                        <div key={c.id} className="bg-neutral-900/50 border border-neutral-800 rounded-lg">
                            <div className="flex items-center gap-3 p-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{c.title}</p>
                                    <p className="text-xs text-white/40">{CAREER_TYPES.find(t => t.value === c.type)?.label} {c.date && `· ${c.date}`}</p>
                                </div>
                                <button type="button" onClick={() => togglePublic(c)} title={c.is_public ? '공개' : '비공개'}>
                                    {c.is_public ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-white/30" />}
                                </button>
                                <button type="button" onClick={() => toggleRepresentative(c)} title={c.is_representative ? '대표' : '일반'}>
                                    <Star className={cn("w-4 h-4", c.is_representative ? "text-yellow-400 fill-yellow-400" : "text-white/30")} />
                                </button>
                                <button type="button" onClick={() => deleteCareer(c.id)} className="text-white/30 hover:text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
