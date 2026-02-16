'use client'

import { X, Calendar, Building2, DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Clock, FileText } from 'lucide-react'
import type { ProjectSettlementData } from './ProjectSettlementAccordion'

interface ProjectSettlementDetailModalProps {
    data: ProjectSettlementData
    onClose: () => void
}

const CATEGORY_LABELS: Record<string, string> = {
    choreo: '안무',
    broadcast: '방송',
    performance: '공연',
    workshop: '워크샵',
    judge: '심사',
}

export default function ProjectSettlementDetailModal({ data, onClose }: ProjectSettlementDetailModalProps) {
    const completedIncome = data.incomeItems.filter(i => i.status === 'completed' && i.fee).reduce((acc, i) => acc + (i.fee || 0), 0)
    const pendingIncome = data.incomeItems.filter(i => i.status === 'pending' && i.fee).reduce((acc, i) => acc + (i.fee || 0), 0)
    const completedExpense = data.expenseItems.filter(i => i.status === 'completed' && i.fee).reduce((acc, i) => acc + (i.fee || 0), 0)
    const pendingExpense = data.expenseItems.filter(i => i.status === 'pending' && i.fee).reduce((acc, i) => acc + (i.fee || 0), 0)

    const confirmedNetProfit = completedIncome - completedExpense
    const expectedNetProfit = (completedIncome + pendingIncome) - (completedExpense + pendingExpense)

    const allItemsCompleted = [...data.incomeItems, ...data.expenseItems].every(i => i.status === 'completed')
    const noUndecidedFees = !data.hasUndecided

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 p-6 flex items-start justify-between z-10 rounded-t-2xl">
                    <div className="flex-1 min-w-0 mr-4">
                        <h2 className="text-xl font-bold text-white mb-2">{data.projectTitle}</h2>
                        <div className="flex items-center gap-2 flex-wrap">
                            {data.category && (
                                <span className="bg-white/5 px-2 py-1 rounded text-white/40 text-xs">
                                    {CATEGORY_LABELS[data.category] || data.category}
                                </span>
                            )}
                            {data.companyName && (
                                <span className="flex items-center gap-1 text-xs text-white/40">
                                    <Building2 className="w-3 h-3" />
                                    {data.companyName}
                                </span>
                            )}
                            {data.startDate && (
                                <span className="flex items-center gap-1 text-xs text-white/40">
                                    <Calendar className="w-3 h-3" />
                                    {data.startDate}{data.endDate ? ` ~ ${data.endDate}` : ''}
                                </span>
                            )}
                        </div>
                        {data.contractAmount && (
                            <div className="flex items-center gap-1 text-xs text-white/30 mt-2">
                                <FileText className="w-3 h-3" />
                                프로젝트 계약금: {data.contractAmount.toLocaleString()}원
                            </div>
                        )}
                        <div className="text-[11px] text-primary/70 mt-1">
                            기준 프로필: {data.perspectiveProfileName}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/50 hover:text-white transition rounded-lg hover:bg-white/5"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status Overview */}
                    <div className="bg-neutral-950/50 border border-neutral-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <DollarSign className="w-5 h-5 text-primary" />
                            <h3 className="text-sm font-semibold text-white">정산 현황</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-neutral-900/50 rounded-lg p-3">
                                <p className="text-xs text-white/40 mb-1">확정 정산액</p>
                                <p className={`text-lg font-bold ${
                                    confirmedNetProfit > 0 ? 'text-green-400' :
                                    confirmedNetProfit < 0 ? 'text-red-400' :
                                    'text-white/40'
                                }`}>
                                    {confirmedNetProfit >= 0 ? '+' : ''}{confirmedNetProfit.toLocaleString()}원
                                </p>
                                <p className="text-[10px] text-white/25 mt-1">
                                    수락 완료된 항목만 포함
                                </p>
                            </div>
                            <div className="bg-neutral-900/50 rounded-lg p-3">
                                <p className="text-xs text-white/40 mb-1">예상 정산액</p>
                                <p className={`text-lg font-bold ${
                                    data.hasUndecided ? 'text-yellow-400' :
                                    expectedNetProfit > 0 ? 'text-green-400' :
                                    expectedNetProfit < 0 ? 'text-red-400' :
                                    'text-white/40'
                                }`}>
                                    {data.hasUndecided ? '미정' : `${expectedNetProfit >= 0 ? '+' : ''}${expectedNetProfit.toLocaleString()}원`}
                                </p>
                                <p className="text-[10px] text-white/25 mt-1">
                                    {data.hasUndecided ? '금액 미정 포함' : '대기 항목 포함'}
                                </p>
                            </div>
                        </div>

                        {/* Settlement Status */}
                        <div className="mt-3 pt-3 border-t border-neutral-800/50">
                            {allItemsCompleted && noUndecidedFees ? (
                                <div className="flex items-center gap-2 text-green-400 text-xs">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="font-medium">모든 항목이 확정되었습니다</span>
                                </div>
                            ) : data.hasUndecided ? (
                                <div className="flex items-center gap-2 text-yellow-400 text-xs">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="font-medium">금액 미정 항목이 있습니다</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-blue-400 text-xs">
                                    <Clock className="w-4 h-4" />
                                    <span className="font-medium">일부 항목이 대기 중입니다</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Income Section */}
                    {data.incomeItems.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    매출 ({data.incomeItems.length}건)
                                </h3>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-blue-400">+{data.totalIncome.toLocaleString()}원</p>
                                    <div className="flex items-center gap-2 text-[10px] text-white/30 mt-0.5">
                                        {completedIncome > 0 && <span className="text-green-400">확정 {completedIncome.toLocaleString()}</span>}
                                        {pendingIncome > 0 && <span className="text-yellow-400">대기 {pendingIncome.toLocaleString()}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {data.incomeItems.map(item => (
                                    <div key={item.id} className="bg-neutral-950/30 border border-neutral-800/50 rounded-lg p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white/80 font-medium">
                                                    {item.dancerName || '프로젝트'}
                                                </p>
                                                <p className="text-xs text-white/40 mt-0.5">{item.label}</p>
                                                <p className="text-[10px] text-white/25 mt-1">
                                                    {new Date(item.date).toLocaleDateString('ko-KR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <p className={`text-sm font-bold ${item.fee ? 'text-blue-400' : 'text-yellow-400/70'}`}>
                                                    {item.fee ? `+${item.fee.toLocaleString()}원` : '미정'}
                                                </p>
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                                    item.status === 'completed'
                                                        ? 'bg-green-500/10 text-green-400'
                                                        : 'bg-yellow-500/10 text-yellow-400'
                                                }`}>
                                                    {item.status === 'completed' ? '확정' : '대기'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Expense Section */}
                    {data.expenseItems.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                                    <TrendingDown className="w-4 h-4" />
                                    지출 ({data.expenseItems.length}건)
                                </h3>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-red-400">-{data.totalExpense.toLocaleString()}원</p>
                                    <div className="flex items-center gap-2 text-[10px] text-white/30 mt-0.5">
                                        {completedExpense > 0 && <span className="text-green-400">확정 {completedExpense.toLocaleString()}</span>}
                                        {pendingExpense > 0 && <span className="text-yellow-400">대기 {pendingExpense.toLocaleString()}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {data.expenseItems.map(item => (
                                    <div key={item.id} className="bg-neutral-950/30 border border-neutral-800/50 rounded-lg p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white/80 font-medium">
                                                    {item.dancerName || '댄서'}
                                                </p>
                                                <p className="text-xs text-white/40 mt-0.5">{item.label}</p>
                                                <p className="text-[10px] text-white/25 mt-1">
                                                    {new Date(item.date).toLocaleDateString('ko-KR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <p className={`text-sm font-bold ${item.fee ? 'text-red-400' : 'text-yellow-400/70'}`}>
                                                    {item.fee ? `-${item.fee.toLocaleString()}원` : '미정'}
                                                </p>
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                                    item.status === 'completed'
                                                        ? 'bg-green-500/10 text-green-400'
                                                        : 'bg-yellow-500/10 text-yellow-400'
                                                }`}>
                                                    {item.status === 'completed' ? '확정' : '대기'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Final Summary */}
                    <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-xl p-4">
                        <h3 className="text-xs font-semibold text-white/40 mb-3">최종 정산 요약</h3>
                        <div className="space-y-2">
                            {data.totalIncome > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/60">총 매출</span>
                                    <span className="text-blue-400 font-semibold">+{data.totalIncome.toLocaleString()}원</span>
                                </div>
                            )}
                            {data.totalExpense > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/60">총 지출</span>
                                    <span className="text-red-400 font-semibold">-{data.totalExpense.toLocaleString()}원</span>
                                </div>
                            )}
                            {data.totalIncome > 0 && data.totalExpense > 0 && (
                                <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-2" />
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold">
                                    {data.totalIncome > 0 && data.totalExpense > 0 ? '순이익' : data.totalIncome > 0 ? '매출 합계' : '지출 합계'}
                                </span>
                                <span className={`text-lg font-bold ${
                                    data.netProfit > 0 ? 'text-green-400' :
                                    data.netProfit < 0 ? 'text-red-400' :
                                    'text-white/40'
                                }`}>
                                    {data.netProfit >= 0 ? '+' : ''}{data.netProfit.toLocaleString()}원
                                </span>
                            </div>
                            {data.hasUndecided && (
                                <p className="text-[10px] text-yellow-400/60 text-center pt-2 border-t border-neutral-800/50">
                                    * 금액 미정 항목이 포함되어 있어 실제 금액과 다를 수 있습니다
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Explanation */}
                    <div className="bg-neutral-950/30 border border-neutral-800/30 rounded-lg p-3 space-y-1">
                        <p className="text-[10px] text-white/25">
                            <span className="text-blue-400/50">매출</span> = 기준 프로필({data.perspectiveProfileName})이 받는 금액
                        </p>
                        <p className="text-[10px] text-white/25">
                            <span className="text-red-400/50">지출</span> = 기준 프로필이 PM인 프로젝트에서 다른 참여자에게 지급하는 금액
                        </p>
                        <p className="text-[10px] text-white/25">
                            <span className="text-green-400/50">순이익</span> = 매출 - 지출 (동일 계정 내부 거래도 기준 프로필 관점으로 반영)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
