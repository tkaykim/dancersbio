'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, X, Plus, Building2, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgencyOption {
    id: string
    company_name: string | null
    contact_person: string
    type: string
    logo_url: string | null
}

interface SelectedAgency {
    agency_id: string
    name: string
    is_primary: boolean
}

interface MultiAgencySelectorProps {
    dancerId: string
    value: SelectedAgency[]
    onChange: (agencies: SelectedAgency[]) => void
}

export default function MultiAgencySelector({ dancerId, value, onChange }: MultiAgencySelectorProps) {
    const [query, setQuery] = useState('')
    const [options, setOptions] = useState<AgencyOption[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showAddForm, setShowAddForm] = useState(false)
    const [addingAgency, setAddingAgency] = useState(false)
    const [newAgency, setNewAgency] = useState({ company_name: '', contact_person: '' })
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const searchClients = useCallback(async (searchQuery: string) => {
        setLoading(true)
        try {
            let q = supabase
                .from('clients')
                .select('id, company_name, contact_person, type, logo_url')
                .order('company_name', { ascending: true })
                .limit(20)

            if (searchQuery.trim()) {
                q = q.or(`company_name.ilike.%${searchQuery}%,contact_person.ilike.%${searchQuery}%`)
            }

            const { data, error } = await q
            if (error) throw error
            setOptions(data || [])
        } catch {
            setOptions([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => searchClients(query), 300)
            return () => clearTimeout(timer)
        }
    }, [query, isOpen, searchClients])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
                setShowAddForm(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (agency: AgencyOption) => {
        if (value.some(a => a.agency_id === agency.id)) return
        const name = agency.company_name || agency.contact_person
        onChange([...value, { agency_id: agency.id, name, is_primary: value.length === 0 }])
        setQuery('')
    }

    const handleRemove = (agencyId: string) => {
        const updated = value.filter(a => a.agency_id !== agencyId)
        if (updated.length > 0 && !updated.some(a => a.is_primary)) {
            updated[0].is_primary = true
        }
        onChange(updated)
    }

    const handleSetPrimary = (agencyId: string) => {
        onChange(value.map(a => ({ ...a, is_primary: a.agency_id === agencyId })))
    }

    const handleAddAgency = async () => {
        if (!newAgency.company_name.trim()) return
        setAddingAgency(true)
        try {
            const { data, error } = await supabase
                .from('clients')
                .insert({
                    owner_id: (await supabase.auth.getUser()).data.user?.id,
                    company_name: newAgency.company_name.trim(),
                    contact_person: newAgency.contact_person.trim() || newAgency.company_name.trim(),
                    type: 'agency',
                })
                .select('id, company_name, contact_person, type, logo_url')
                .single()

            if (error) throw error
            if (data) {
                handleSelect(data)
                setShowAddForm(false)
                setNewAgency({ company_name: '', contact_person: '' })
            }
        } catch (err: any) {
            alert('소속사 추가 실패: ' + err.message)
        } finally {
            setAddingAgency(false)
        }
    }

    const displayName = (agency: AgencyOption) => agency.company_name || agency.contact_person

    return (
        <div ref={containerRef} className="space-y-3">
            {/* Selected agencies */}
            {value.length > 0 && (
                <div className="space-y-2">
                    {value.map((a) => (
                        <div key={a.agency_id} className="flex items-center gap-3 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg">
                            <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-white flex-1 truncate text-sm">{a.name}</span>
                            {value.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleSetPrimary(a.agency_id)}
                                    className={cn(
                                        'text-[10px] px-1.5 py-0.5 rounded transition-colors',
                                        a.is_primary
                                            ? 'bg-primary/20 text-primary'
                                            : 'bg-neutral-800 text-white/40 hover:text-white/60'
                                    )}
                                >
                                    {a.is_primary ? '주 소속' : '주 소속으로'}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => handleRemove(a.agency_id)}
                                className="p-1 text-white/40 hover:text-white/80 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Search input */}
            <div
                className={cn(
                    'flex items-center gap-3 px-4 py-3 bg-neutral-900 border rounded-lg cursor-text transition-colors',
                    isOpen ? 'border-primary' : 'border-neutral-800'
                )}
                onClick={() => {
                    setIsOpen(true)
                    setTimeout(() => inputRef.current?.focus(), 0)
                }}
            >
                <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="소속사 검색하여 추가..."
                    className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none text-sm"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                />
                {loading && <Loader2 className="w-4 h-4 text-white/40 animate-spin" />}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="relative">
                    <div className="absolute left-0 right-0 top-0 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                        {options.length > 0 ? (
                            options
                                .filter(o => !value.some(v => v.agency_id === o.id))
                                .map((agency) => (
                                    <button
                                        key={agency.id}
                                        type="button"
                                        onClick={() => handleSelect(agency)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800 transition-colors text-left"
                                    >
                                        <Building2 className="w-4 h-4 text-white/40 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{displayName(agency)}</p>
                                        </div>
                                        <Plus className="w-4 h-4 text-primary" />
                                    </button>
                                ))
                        ) : !loading ? (
                            <div className="px-4 py-3 text-sm text-white/40 text-center">
                                {query ? '검색 결과가 없습니다' : '등록된 소속사가 없습니다'}
                            </div>
                        ) : null}

                        <div className="border-t border-neutral-800">
                            {!showAddForm ? (
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(true)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-primary hover:bg-neutral-800 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="text-sm font-medium">새 소속사 추가</span>
                                </button>
                            ) : (
                                <div className="p-4 space-y-3">
                                    <p className="text-xs text-white/60 font-medium">새 소속사 정보</p>
                                    <input
                                        type="text"
                                        placeholder="소속사 이름 *"
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-primary"
                                        value={newAgency.company_name}
                                        onChange={(e) => setNewAgency({ ...newAgency, company_name: e.target.value })}
                                        autoFocus
                                    />
                                    <input
                                        type="text"
                                        placeholder="담당자명 (선택)"
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-primary"
                                        value={newAgency.contact_person}
                                        onChange={(e) => setNewAgency({ ...newAgency, contact_person: e.target.value })}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => { setShowAddForm(false); setNewAgency({ company_name: '', contact_person: '' }) }}
                                            className="flex-1 py-2 text-sm text-white/60 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
                                        >
                                            취소
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleAddAgency}
                                            disabled={!newAgency.company_name.trim() || addingAgency}
                                            className="flex-1 py-2 text-sm text-black bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                                        >
                                            {addingAgency ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" />추가</>}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
