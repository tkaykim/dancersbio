'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import MobileContainer from '@/components/layout/MobileContainer'
import { Ico } from '@/components/cue'
import { supabase } from '@/lib/supabase'
import { type CastingCategory, type CastingMock } from '@/lib/castingMockData'
import {
    projectToCastingMock,
    isCastableProject,
    type CastingProjectRow,
} from '@/lib/castingFromProjects'
import CastingCard from './_components/CastingCard'

type FilterValue = 'foryou' | CastingCategory

const FILTER_CHIPS: { value: FilterValue; label: string }[] = [
    { value: 'foryou', label: 'For you' },
    { value: '광고', label: '광고' },
    { value: '안무제작', label: '안무제작' },
    { value: '댄서참여', label: '댄서참여' },
    { value: '강사구인', label: '강사구인' },
    { value: '오디션', label: '오디션' },
    { value: '기타', label: '기타' },
]

export default function CastingPage() {
    const [filter, setFilter] = useState<FilterValue>('foryou')
    const [liveProjects, setLiveProjects] = useState<CastingMock[]>([])

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            const { data, error } = await supabase
                .from('projects')
                .select(`
                    id, title, category, visibility, progress_status,
                    embargo_date, budget, start_date, end_date, due_date, created_at,
                    clients (company_name),
                    owner:users!owner_id (name),
                    event_dates:project_event_dates (event_date, event_time, label, sort_order)
                `)
                .eq('visibility', 'public')
                .eq('progress_status', 'recruiting')
                .is('deleted_at', null)
                .is('parent_project_id', null)
                .order('created_at', { ascending: false })
                .limit(40)
            if (cancelled) return
            if (error) {
                console.error('Casting projects fetch error:', error)
                return
            }
            const rows = (data || []) as unknown as CastingProjectRow[]
            const visible = rows
                .filter(isCastableProject)
                .map(projectToCastingMock)
            setLiveProjects(visible)
        }
        load()
        return () => {
            cancelled = true
        }
    }, [])

    const visible = useMemo(() => {
        if (filter === 'foryou') return liveProjects
        return liveProjects.filter((c) => c.category === filter)
    }, [liveProjects, filter])

    return (
        <MobileContainer>
            <div
                className="min-h-screen pb-24"
                style={{ background: 'var(--cue-bg)', color: 'var(--cue-ink)' }}
            >
                <header
                    className="sticky top-0 z-10 pt-header-safe"
                    style={{
                        background: 'color-mix(in srgb, var(--cue-bg) 92%, transparent)',
                        backdropFilter: 'blur(18px)',
                        WebkitBackdropFilter: 'blur(18px)',
                        borderBottom: '1px solid var(--cue-hairline)',
                    }}
                >
                    <div className="px-6 py-4 flex items-end justify-between">
                        <div>
                            <h1
                                style={{
                                    fontSize: 26,
                                    fontWeight: 700,
                                    letterSpacing: '-0.02em',
                                    color: 'var(--cue-ink)',
                                }}
                            >
                                캐스팅
                            </h1>
                            <p
                                style={{
                                    fontSize: 13,
                                    color: 'var(--cue-ink-3)',
                                    marginTop: 2,
                                }}
                            >
                                진행 중인 공고 {visible.length}건
                            </p>
                        </div>
                        <Link
                            href="/my/projects/new"
                            aria-label="공고 올리기"
                            className="p-2 rounded-full inline-flex items-center justify-center"
                            style={{
                                background: 'var(--cue-surface-2)',
                                color: 'var(--cue-accent)',
                                border: '1px solid var(--cue-hairline)',
                            }}
                        >
                            {Ico.plus('currentColor', 20)}
                        </Link>
                    </div>

                    <div
                        className="px-6 pb-3 flex gap-2 overflow-x-auto"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {FILTER_CHIPS.map((chip) => {
                            const active = chip.value === filter
                            return (
                                <button
                                    key={chip.value}
                                    type="button"
                                    onClick={() => setFilter(chip.value)}
                                    style={{
                                        flexShrink: 0,
                                        padding: '6px 12px',
                                        borderRadius: 999,
                                        fontSize: 12,
                                        fontWeight: 500,
                                        background: active ? 'var(--cue-ink)' : 'var(--cue-surface)',
                                        color: active ? 'var(--cue-bg)' : 'var(--cue-ink-2)',
                                        border: active ? 'none' : '1px solid var(--cue-hairline)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {chip.label}
                                </button>
                            )
                        })}
                    </div>
                </header>

                <div className="px-4 pt-4">
                    {visible.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            {visible.map((item) => (
                                <CastingCard key={item.id} item={item} />
                            ))}
                            <Link
                                href="/inbox"
                                className="block mx-2 my-4 py-3 rounded-full text-center font-medium"
                                style={{
                                    background: 'var(--cue-surface-2)',
                                    color: 'var(--cue-ink)',
                                    fontSize: 13,
                                    border: '1px solid var(--cue-hairline)',
                                }}
                            >
                                받은 다이렉트 오퍼 보기
                            </Link>
                        </>
                    )}
                </div>
            </div>

        </MobileContainer>
    )
}

function EmptyState() {
    return (
        <div className="px-6 pt-12 pb-12 text-center">
            <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                    background: 'var(--cue-surface)',
                    border: '1px solid var(--cue-hairline)',
                }}
            >
                {Ico.briefcase('var(--cue-ink-4)', 28)}
            </div>
            <p
                style={{
                    fontSize: 14,
                    color: 'var(--cue-ink-2)',
                    marginBottom: 8,
                    lineHeight: 1.5,
                }}
            >
                이 카테고리엔 아직 공고가 없어요
            </p>
            <p style={{ fontSize: 12, color: 'var(--cue-ink-3)', lineHeight: 1.6 }}>
                다른 카테고리를 둘러보거나
                <br />
                직접 공고를 올려보세요
            </p>
        </div>
    )
}
