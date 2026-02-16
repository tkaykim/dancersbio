import { Clock, CheckCircle2, ArrowDownRight, ArrowUpRight, HelpCircle } from 'lucide-react'

export type TransactionType = 'income' | 'expense'

interface SettlementCardProps {
    projectTitle: string
    category: string
    companyName?: string | null
    dancerName?: string | null
    fee: number | null
    type: TransactionType
    status: 'pending' | 'completed'
    date: string
    label?: string
}

const CATEGORY_LABELS: Record<string, string> = {
    choreo: '안무', broadcast: '방송', performance: '공연', workshop: '워크샵', judge: '심사',
}

export default function SettlementCard({
    projectTitle, category, companyName, dancerName, fee, type, status, date, label
}: SettlementCardProps) {
    const isIncome = type === 'income'
    const isUndecided = fee === null || fee === undefined

    return (
        <div className={`bg-neutral-900 border rounded-xl p-4 flex items-center gap-3 ${
            isUndecided ? 'border-yellow-500/20' : 'border-neutral-800'
        }`}>
            {/* Type Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                isUndecided ? 'bg-yellow-500/10'
                : isIncome ? 'bg-blue-500/10'
                : 'bg-red-500/10'
            }`}>
                {isUndecided
                    ? <HelpCircle className="w-5 h-5 text-yellow-400" />
                    : isIncome
                        ? <ArrowDownRight className="w-5 h-5 text-blue-400" />
                        : <ArrowUpRight className="w-5 h-5 text-red-400" />
                }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm truncate">{projectTitle}</h3>
                <div className="flex items-center gap-2 mt-0.5 text-xs flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        isUndecided ? 'bg-yellow-500/10 text-yellow-400'
                        : isIncome ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                        {label || (isIncome ? '매출' : '지출')}
                    </span>
                    {category && (
                        <span className="bg-white/5 px-1.5 py-0.5 rounded text-white/40">
                            {CATEGORY_LABELS[category] || category}
                        </span>
                    )}
                    {dancerName && (
                        <span className="text-white/30 truncate">{dancerName}</span>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-white/25">
                    {companyName && <span>{companyName}</span>}
                    <span>{new Date(date).toLocaleDateString('ko-KR')}</span>
                </div>
            </div>

            {/* Amount */}
            <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                {isUndecided ? (
                    <p className="font-bold text-sm text-yellow-400/70">미정</p>
                ) : (
                    <p className={`font-bold text-sm ${isIncome ? 'text-blue-400' : 'text-red-400'}`}>
                        {isIncome ? '+' : '-'}{fee!.toLocaleString()}원
                    </p>
                )}
                {status === 'pending' ? (
                    <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded text-[10px] font-bold">
                        <Clock className="w-3 h-3" /> 대기
                    </span>
                ) : (
                    <span className="flex items-center gap-1 text-green-500 bg-green-500/10 px-2 py-0.5 rounded text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" /> 확정
                    </span>
                )}
            </div>
        </div>
    )
}
