import { Wallet, ArrowDownRight, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react'

interface BalanceSummaryCardProps {
    totalIncome: number
    totalExpense: number
}

export default function BalanceSummaryCard({ totalIncome, totalExpense }: BalanceSummaryCardProps) {
    const netProfit = totalIncome - totalExpense
    const isPositive = netProfit >= 0

    return (
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            {/* Net Profit Header */}
            <div className="p-6 pb-4">
                <div className="flex items-center gap-2 mb-3">
                    <Wallet className="w-5 h-5 text-primary" />
                    <h2 className="text-sm font-bold text-white/60">순수익</h2>
                </div>
                <div className="flex items-end gap-2">
                    <p className={`text-3xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{netProfit.toLocaleString()}원
                    </p>
                    {isPositive
                        ? <TrendingUp className="w-5 h-5 text-green-400 mb-1" />
                        : <TrendingDown className="w-5 h-5 text-red-400 mb-1" />
                    }
                </div>
            </div>

            {/* Income / Expense Grid */}
            <div className="grid grid-cols-2 gap-px bg-neutral-800/50">
                <div className="bg-neutral-900 p-4">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <ArrowDownRight className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-white/40 text-xs font-medium">매출 (수입)</span>
                    </div>
                    <p className={`font-bold text-lg ${totalIncome > 0 ? 'text-blue-400' : 'text-white/20'}`}>
                        {totalIncome > 0 ? `+${totalIncome.toLocaleString()}` : '0'}원
                    </p>
                    <p className="text-[10px] text-white/20 mt-1">PM 수입 + 섭외 수입</p>
                </div>
                <div className="bg-neutral-900 p-4">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-white/40 text-xs font-medium">지출</span>
                    </div>
                    <p className={`font-bold text-lg ${totalExpense > 0 ? 'text-red-400' : 'text-white/20'}`}>
                        {totalExpense > 0 ? `-${totalExpense.toLocaleString()}` : '0'}원
                    </p>
                    <p className="text-[10px] text-white/20 mt-1">외부 댄서 섭외비</p>
                </div>
            </div>
        </section>
    )
}
