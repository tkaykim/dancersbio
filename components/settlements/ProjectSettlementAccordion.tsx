'use client'

import { useState } from 'react'
import { ChevronDown, ArrowUpRight, ArrowDownRight, Calendar, Building2, DollarSign, FileText } from 'lucide-react'

export interface ProjectSettlementData {
    projectId: string
    projectTitle: string
    category: string
    companyName: string | null
    startDate: string | null
    endDate: string | null
    contractAmount: number | null
    incomeItems: SettlementItemDetail[]
    expenseItems: SettlementItemDetail[]
    totalIncome: number
    totalExpense: number
    netProfit: number
    hasUndecided: boolean
    settlementStatus: 'pending' | 'partial' | 'completed'
    perspectiveProfileName: string
}

export interface SettlementItemDetail {
    id: string
    dancerName: string | null
    fee: number | null
    label: string
    status: 'pending' | 'completed'
    date: string
}

interface ProjectSettlementAccordionProps {
    data: ProjectSettlementData
    onViewDetail: () => void
}

const CATEGORY_LABELS: Record<string, string> = {
    choreo: '안무',
    broadcast: '방송',
    performance: '공연',
    workshop: '워크샵',
    judge: '심사',
}

const STATUS_CONFIG = {
    pending: { label: '정산 대기', color: 'text-yellow-400 bg-yellow-400/10' },
    partial: { label: '일부 확정', color: 'text-blue-400 bg-blue-400/10' },
    completed: { label: '정산 완료', color: 'text-green-400 bg-green-400/10' },
}

export default function ProjectSettlementAccordion({ data, onViewDetail }: ProjectSettlementAccordionProps) {
    const [isOpen, setIsOpen] = useState(false)

    const statusInfo = STATUS_CONFIG[data.settlementStatus]
    const hasOnlyIncome = data.expenseItems.length === 0
    const hasOnlyExpense = data.incomeItems.length === 0

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            {/* Header (always visible) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 flex items-center gap-3 hover:bg-neutral-800/30 transition"
            >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    hasOnlyExpense ? 'bg-red-500/10' : 'bg-blue-500/10'
                }`}>
                    <DollarSign className={`w-5 h-5 ${hasOnlyExpense ? 'text-red-400' : 'text-blue-400'}`} />
                </div>

                <div className="flex-1 min-w-0 text-left">
                    <h3 className="text-white font-bold text-sm truncate">{data.projectTitle}</h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs flex-wrap">
                        {data.category && (
                            <span className="bg-white/5 px-1.5 py-0.5 rounded text-white/40 text-[10px]">
                                {CATEGORY_LABELS[data.category] || data.category}
                            </span>
                        )}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${statusInfo.color}`}>
                            {statusInfo.label}
                        </span>
                        {data.companyName && (
                            <span className="text-white/30 truncate text-[10px]">{data.companyName}</span>
                        )}
                    </div>
                </div>

                {/* Summary */}
                <div className="flex flex-col items-end gap-0.5 mr-2 flex-shrink-0">
                    {data.hasUndecided ? (
                        <p className="font-bold text-sm text-yellow-400/70">미정 포함</p>
                    ) : (
                        <p className={`font-bold text-sm ${
                            data.netProfit > 0 ? 'text-green-400' :
                            data.netProfit < 0 ? 'text-red-400' :
                            'text-white/40'
                        }`}>
                            {data.netProfit >= 0 ? '+' : ''}{data.netProfit.toLocaleString()}원
                        </p>
                    )}
                    <div className="flex items-center gap-1.5 text-[10px] text-white/30">
                        {data.totalIncome > 0 && <span className="text-blue-400/70">매출 {data.totalIncome.toLocaleString()}</span>}
                        {data.totalExpense > 0 && <span className="text-red-400/70">지출 {data.totalExpense.toLocaleString()}</span>}
                    </div>
                </div>

                <ChevronDown className={`w-5 h-5 text-white/40 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Expanded content */}
            {isOpen && (
                <div className="border-t border-neutral-800 bg-neutral-950/30">
                    <div className="p-4 space-y-4">
                        {/* Project Info */}
                        <div className="flex items-center gap-4 text-xs text-white/30 flex-wrap">
                            <span className="text-primary/70">기준: {data.perspectiveProfileName}</span>
                            {data.companyName && (
                                <span className="flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {data.companyName}
                                </span>
                            )}
                            {data.startDate && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {data.startDate}{data.endDate ? ` ~ ${data.endDate}` : ''}
                                </span>
                            )}
                            {data.contractAmount && (
                                <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    계약금 {data.contractAmount.toLocaleString()}원
                                </span>
                            )}
                        </div>

                        {/* Income Items */}
                        {data.incomeItems.length > 0 && (
                            <div className="space-y-1.5">
                                <h4 className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                                    <ArrowDownRight className="w-3.5 h-3.5" />
                                    매출 ({data.incomeItems.length}건)
                                </h4>
                                {data.incomeItems.map(item => (
                                    <div key={item.id} className="bg-neutral-900/50 border border-neutral-800/50 rounded-lg px-3 py-2 flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-white/70 truncate">
                                                {item.dancerName || '프로젝트'} <span className="text-white/30">— {item.label}</span>
                                            </p>
                                            <p className="text-[10px] text-white/25 mt-0.5">
                                                {new Date(item.date).toLocaleDateString('ko-KR')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-2">
                                            <p className={`text-xs font-semibold ${item.fee ? 'text-blue-400' : 'text-yellow-400/70'}`}>
                                                {item.fee ? `+${item.fee.toLocaleString()}원` : '미정'}
                                            </p>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                                                item.status === 'completed'
                                                    ? 'bg-green-500/10 text-green-400'
                                                    : 'bg-yellow-500/10 text-yellow-400'
                                            }`}>
                                                {item.status === 'completed' ? '확정' : '대기'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Expense Items */}
                        {data.expenseItems.length > 0 && (
                            <div className="space-y-1.5">
                                <h4 className="text-xs font-semibold text-red-400 flex items-center gap-1">
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                    지출 ({data.expenseItems.length}건)
                                </h4>
                                {data.expenseItems.map(item => (
                                    <div key={item.id} className="bg-neutral-900/50 border border-neutral-800/50 rounded-lg px-3 py-2 flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-white/70 truncate">
                                                {item.dancerName || '댄서'} <span className="text-white/30">— {item.label}</span>
                                            </p>
                                            <p className="text-[10px] text-white/25 mt-0.5">
                                                {new Date(item.date).toLocaleDateString('ko-KR')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-2">
                                            <p className={`text-xs font-semibold ${item.fee ? 'text-red-400' : 'text-yellow-400/70'}`}>
                                                {item.fee ? `-${item.fee.toLocaleString()}원` : '미정'}
                                            </p>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                                                item.status === 'completed'
                                                    ? 'bg-green-500/10 text-green-400'
                                                    : 'bg-yellow-500/10 text-yellow-400'
                                            }`}>
                                                {item.status === 'completed' ? '확정' : '대기'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Summary */}
                        <div className="pt-3 border-t border-neutral-800/50 space-y-1.5">
                            {data.totalIncome > 0 && (
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-white/40">총 매출</span>
                                    <span className="text-blue-400 font-semibold">+{data.totalIncome.toLocaleString()}원</span>
                                </div>
                            )}
                            {data.totalExpense > 0 && (
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-white/40">총 지출</span>
                                    <span className="text-red-400 font-semibold">-{data.totalExpense.toLocaleString()}원</span>
                                </div>
                            )}
                            {data.totalIncome > 0 && data.totalExpense > 0 && (
                                <div className="flex items-center justify-between text-sm font-bold pt-1 border-t border-neutral-800/50">
                                    <span className="text-white">순이익</span>
                                    <span className={
                                        data.netProfit > 0 ? 'text-green-400' :
                                        data.netProfit < 0 ? 'text-red-400' :
                                        'text-white/40'
                                    }>
                                        {data.netProfit >= 0 ? '+' : ''}{data.netProfit.toLocaleString()}원
                                    </span>
                                </div>
                            )}
                            {data.hasUndecided && (
                                <p className="text-[10px] text-yellow-400/60 text-center pt-1">
                                    * 금액 미정 항목이 포함되어 있습니다
                                </p>
                            )}
                        </div>

                        {/* View Detail Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onViewDetail()
                            }}
                            className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-lg transition"
                        >
                            상세보기
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
