'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Wallet } from 'lucide-react'
import Link from 'next/link'
import { useMyProfiles } from '@/hooks/useMyProfiles'
import BalanceSummaryCard from '@/components/settlements/BalanceSummaryCard'
import SettlementCard from '@/components/settlements/SettlementCard'

interface SettlementItem {
    id: string
    projectTitle: string
    category: string
    companyName: string | null
    fee: number
    status: 'pending' | 'completed'
    date: string
}

export default function SettlementsPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const { allProfiles, loading: profilesLoading } = useMyProfiles()
    const [settlements, setSettlements] = useState<SettlementItem[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user && allProfiles.length > 0) {
            fetchSettlements()
        } else if (user && !profilesLoading && allProfiles.length === 0) {
            setLoading(false)
        }
    }, [user, allProfiles, profilesLoading])

    const fetchSettlements = async () => {
        setLoading(true)
        try {
            const dancerIds = allProfiles.map(p => p.id)

            const { data, error } = await supabase
                .from('proposals')
                .select(`
                    id, fee, status, created_at,
                    projects (title, category, clients (company_name))
                `)
                .in('dancer_id', dancerIds)
                .eq('status', 'accepted')
                .not('fee', 'is', null)
                .order('created_at', { ascending: false })

            if (error) throw error

            const items: SettlementItem[] = (data || []).map((p: any) => ({
                id: p.id,
                projectTitle: p.projects?.title || '제목 없음',
                category: p.projects?.category || '',
                companyName: p.projects?.clients?.company_name || null,
                fee: p.fee,
                status: 'pending' as const,
                date: p.created_at
            }))

            setSettlements(items)
        } catch (err) {
            console.error('Error fetching settlements:', err)
        } finally {
            setLoading(false)
        }
    }

    const filteredSettlements = filter === 'all'
        ? settlements
        : settlements.filter(s => s.status === filter)

    const pendingAmount = settlements.filter(s => s.status === 'pending').reduce((acc, s) => acc + s.fee, 0)
    const completedAmount = settlements.filter(s => s.status === 'completed').reduce((acc, s) => acc + s.fee, 0)
    const totalEarnings = pendingAmount + completedAmount

    if (authLoading || profilesLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-10">
                <div className="px-6 py-4 flex items-center gap-4">
                    <Link href="/my">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </Link>
                    <h1 className="text-xl font-bold text-white">정산 관리</h1>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Balance Summary */}
                <BalanceSummaryCard
                    totalEarnings={totalEarnings}
                    pendingAmount={pendingAmount}
                    completedAmount={completedAmount}
                />

                {/* Filter */}
                <div className="flex gap-2">
                    {([
                        { value: 'all', label: '전체' },
                        { value: 'pending', label: '정산 대기' },
                        { value: 'completed', label: '정산 완료' },
                    ] as const).map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setFilter(opt.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === opt.value
                                ? 'bg-primary text-black'
                                : 'bg-neutral-800 text-white/60 hover:text-white'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Settlement List */}
                {loading ? (
                    <div className="text-white/60 text-center py-12">로딩 중...</div>
                ) : filteredSettlements.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="w-8 h-8 text-white/20" />
                        </div>
                        <p className="text-white/60 text-sm">
                            {filter === 'all' ? '아직 정산 내역이 없습니다.' : `${filter === 'pending' ? '정산 대기' : '정산 완료'} 내역이 없습니다.`}
                        </p>
                        <p className="text-white/30 text-xs mt-2">수락된 제안에 금액이 있을 때 정산 내역이 생성됩니다.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredSettlements.map(settlement => (
                            <SettlementCard
                                key={settlement.id}
                                projectTitle={settlement.projectTitle}
                                category={settlement.category}
                                companyName={settlement.companyName}
                                fee={settlement.fee}
                                status={settlement.status}
                                date={settlement.date}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
