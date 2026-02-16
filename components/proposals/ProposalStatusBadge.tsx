import { CheckCircle2, XCircle, Clock, Ban, CircleCheckBig } from 'lucide-react'

/**
 * displayStatus는 getProposalDisplayStatus()의 결과값 사용 권장:
 * negotiating | confirmed | declined | cancelled | completed
 */
export default function ProposalStatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'confirmed':
        case 'accepted':
            return <span className="flex items-center gap-1 text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs font-bold"><CheckCircle2 className="w-3 h-3" /> 진행확정</span>
        case 'declined':
            return <span className="flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-1 rounded text-xs font-bold"><XCircle className="w-3 h-3" /> 거절됨</span>
        case 'cancelled':
            return <span className="flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-1 rounded text-xs font-bold"><Ban className="w-3 h-3" /> 취소됨</span>
        case 'completed':
            return <span className="flex items-center gap-1 text-white/50 bg-white/5 px-2 py-1 rounded text-xs font-bold"><CircleCheckBig className="w-3 h-3" /> 완료</span>
        case 'negotiating':
        default:
            return <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-xs font-bold"><Clock className="w-3 h-3" /> 조율중</span>
    }
}
