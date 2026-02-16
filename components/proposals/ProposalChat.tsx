import { CheckCircle2, XCircle } from 'lucide-react'
import type { Proposal, NegotiationHistoryItem } from '@/lib/types'

interface ProposalChatProps {
    proposal: Proposal
    userId: string
}

export default function ProposalChat({ proposal, userId }: ProposalChatProps) {
    return (
        <>
            {/* Initial proposal details */}
            <div className="bg-neutral-800/20 border border-neutral-800 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-start mb-3">
                    <span className="text-primary text-xs font-bold px-2 py-0.5 bg-primary/10 rounded">{proposal.projects.category}</span>
                    <span className="text-white/40 text-xs">{new Date(proposal.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="text-white font-bold text-sm mb-2">초기 제안 상세</h3>
                <p className="text-white/80 text-sm whitespace-pre-wrap mb-3">{proposal.details || "내용 없음"}</p>
                <div className="flex gap-2 text-xs">
                    <span className="bg-neutral-800 px-2 py-1 rounded text-white/60">역할: {proposal.role}</span>
                    <span className="bg-neutral-800 px-2 py-1 rounded text-white/60">금액: {proposal.fee ? proposal.fee.toLocaleString() + '원' : '협의'}</span>
                </div>
            </div>

            {/* Negotiation history */}
            {proposal.negotiation_history?.map((msg: NegotiationHistoryItem, idx: number) => {
                const isMe = msg.actor_id === userId
                const isProposalSender = proposal.sender_id === userId
                const otherPartyLastReadAt = isProposalSender
                    ? proposal.receiver_last_read_at
                    : proposal.sender_last_read_at

                const isRead = otherPartyLastReadAt && new Date(otherPartyLastReadAt) >= new Date(msg.date)

                return (
                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.type === 'offer' ? 'bg-neutral-800 border border-primary/30 w-full' :
                            isMe ? 'bg-primary text-black rounded-tr-none' : 'bg-neutral-800 text-white rounded-tl-none'
                            }`}>
                            {msg.type === 'offer' && (
                                <div className="mb-2 pb-2 border-b border-white/10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-1.5 py-0.5 rounded">NEW PROPOSAL</span>
                                    </div>
                                    <p className="text-white font-bold text-lg mb-1">{msg.suggested_fee?.toLocaleString()}원</p>
                                    <p className="text-white/60 text-xs">으로 제안 금액 변경을 요청했습니다.</p>
                                </div>
                            )}

                            {msg.type === 'accept' && <p className="font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> 제안을 수락했습니다.</p>}
                            {msg.type === 'decline' && <p className="font-bold flex items-center gap-1"><XCircle className="w-4 h-4" /> 제안을 거절했습니다.</p>}

                            <p>{msg.message}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1">
                            {isMe && isRead && <span className="text-[10px] text-primary/70 font-medium">읽음</span>}
                            <span className="text-[10px] text-white/30">{new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                )
            })}
        </>
    )
}
