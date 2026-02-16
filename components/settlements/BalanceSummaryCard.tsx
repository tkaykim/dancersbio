import { Wallet, Clock, CheckCircle2 } from 'lucide-react'

interface BalanceSummaryCardProps {
    totalEarnings: number
    pendingAmount: number
    completedAmount: number
}

export default function BalanceSummaryCard({ totalEarnings, pendingAmount, completedAmount }: BalanceSummaryCardProps) {
    return (
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-white">잔액 요약</h2>
            </div>

            <p className="text-3xl font-bold text-white mb-4">
                {totalEarnings.toLocaleString()}원
            </p>

            <div className="flex gap-4">
                <div className="flex-1 bg-neutral-800/50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Clock className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="text-white/50 text-xs">정산 대기</span>
                    </div>
                    <p className="text-yellow-500 font-bold text-sm">{pendingAmount.toLocaleString()}원</p>
                </div>
                <div className="flex-1 bg-neutral-800/50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-white/50 text-xs">정산 완료</span>
                    </div>
                    <p className="text-green-500 font-bold text-sm">{completedAmount.toLocaleString()}원</p>
                </div>
            </div>
        </section>
    )
}
