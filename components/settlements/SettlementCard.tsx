import { Clock, CheckCircle2 } from 'lucide-react'

interface SettlementCardProps {
    projectTitle: string
    category: string
    companyName?: string | null
    fee: number
    status: 'pending' | 'completed'
    date: string
}

export default function SettlementCard({ projectTitle, category, companyName, fee, status, date }: SettlementCardProps) {
    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm truncate">{projectTitle}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="bg-white/10 px-1.5 py-0.5 rounded text-white/60">{category}</span>
                    {companyName && <span className="text-white/40 truncate">{companyName}</span>}
                </div>
                <p className="text-white/30 text-xs mt-1">{new Date(date).toLocaleDateString('ko-KR')}</p>
            </div>
            <div className="flex flex-col items-end gap-1 ml-4">
                <p className="text-white font-bold text-sm">{fee.toLocaleString()}원</p>
                {status === 'pending' ? (
                    <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded text-[10px] font-bold">
                        <Clock className="w-3 h-3" /> 대기
                    </span>
                ) : (
                    <span className="flex items-center gap-1 text-green-500 bg-green-500/10 px-2 py-0.5 rounded text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" /> 완료
                    </span>
                )}
            </div>
        </div>
    )
}
