'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, X, Plus, Loader2, UserPlus } from 'lucide-react'
import Image from 'next/image'

interface MemberRow {
    id: string
    dancer_id: string
    role: string | null
    is_active: boolean
    dancers: { id: string; stage_name: string; profile_img: string | null }
}

interface TeamMemberManagerProps {
    teamId: string
    members: MemberRow[]
    onMembersChange: (members: MemberRow[]) => void
}

export default function TeamMemberManager({ teamId, members, onMembersChange }: TeamMemberManagerProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [searching, setSearching] = useState(false)
    const [showSearch, setShowSearch] = useState(false)

    const searchDancers = useCallback(async (q: string) => {
        if (q.length < 2) { setSearchResults([]); return }
        setSearching(true)
        const { data } = await supabase
            .from('dancers')
            .select('id, stage_name, profile_img')
            .ilike('stage_name', `%${q}%`)
            .limit(10)
        setSearchResults(data || [])
        setSearching(false)
    }, [])

    const handleSearchChange = (val: string) => {
        setSearchQuery(val)
        const timer = setTimeout(() => searchDancers(val), 300)
        return () => clearTimeout(timer)
    }

    const addMember = async (dancer: { id: string; stage_name: string; profile_img: string | null }) => {
        if (members.some(m => m.dancer_id === dancer.id)) {
            alert('이미 팀에 소속된 멤버입니다')
            return
        }
        const { data, error } = await supabase
            .from('team_members')
            .insert({ team_id: teamId, dancer_id: dancer.id })
            .select('id, dancer_id, role, is_active')
            .single()

        if (error) { alert('멤버 추가 실패: ' + error.message); return }
        onMembersChange([...members, { ...data, dancers: dancer }])
        setShowSearch(false)
        setSearchQuery('')
        setSearchResults([])
    }

    const removeMember = async (memberId: string) => {
        if (!confirm('이 멤버를 팀에서 제거하시겠습니까?')) return
        const { error } = await supabase
            .from('team_members')
            .delete()
            .eq('id', memberId)
        if (error) { alert('제거 실패: ' + error.message); return }
        onMembersChange(members.filter(m => m.id !== memberId))
    }

    const updateRole = async (memberId: string, role: string) => {
        await supabase.from('team_members').update({ role: role || null }).eq('id', memberId)
        onMembersChange(members.map(m => m.id === memberId ? { ...m, role: role || null } : m))
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">팀 멤버</h2>
                <button
                    type="button"
                    onClick={() => setShowSearch(!showSearch)}
                    className="text-sm text-primary flex items-center gap-1 hover:text-primary/80"
                >
                    <UserPlus className="w-4 h-4" />
                    멤버 추가
                </button>
            </div>

            {showSearch && (
                <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="댄서 이름으로 검색..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-primary"
                            autoFocus
                        />
                    </div>
                    {searching && <div className="text-center py-2"><Loader2 className="w-4 h-4 animate-spin text-white/40 mx-auto" /></div>}
                    {searchResults.map(d => (
                        <button
                            key={d.id}
                            type="button"
                            onClick={() => addMember(d)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-800 flex-shrink-0 relative">
                                {d.profile_img ? <Image src={d.profile_img} alt="" fill className="object-cover" /> :
                                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">{d.stage_name[0]}</div>}
                            </div>
                            <span className="text-sm text-white">{d.stage_name}</span>
                            <Plus className="w-4 h-4 text-primary ml-auto" />
                        </button>
                    ))}
                </div>
            )}

            {members.length === 0 ? (
                <p className="text-sm text-white/40 text-center py-6">아직 멤버가 없습니다</p>
            ) : (
                <div className="space-y-2">
                    {members.map(m => (
                        <div key={m.id} className="flex items-center gap-3 p-3 bg-neutral-900/50 border border-neutral-800 rounded-lg">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-800 flex-shrink-0 relative">
                                {m.dancers.profile_img ? <Image src={m.dancers.profile_img} alt="" fill className="object-cover" /> :
                                    <div className="w-full h-full flex items-center justify-center text-white/30 font-bold">{m.dancers.stage_name[0]}</div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{m.dancers.stage_name}</p>
                                <input
                                    type="text"
                                    placeholder="역할 (예: Leader, Main)"
                                    value={m.role || ''}
                                    onChange={(e) => updateRole(m.id, e.target.value)}
                                    className="mt-1 w-full text-xs px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-white/60 placeholder-white/30 focus:outline-none focus:border-primary"
                                />
                            </div>
                            <button type="button" onClick={() => removeMember(m.id)} className="p-1 text-white/30 hover:text-red-400 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
