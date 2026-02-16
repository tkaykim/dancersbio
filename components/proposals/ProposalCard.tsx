import { User as UserIcon, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import ProposalStatusBadge from './ProposalStatusBadge'
import { getProposalDisplayStatus } from './ProposalFilterBar'
import { getRelativeTime } from '@/lib/utils'
import type { Proposal, ProposalTab } from '@/lib/types'

interface ProposalCardProps {
    proposal: Proposal
    activeTab: ProposalTab
    unreadCount: number
    onSelect: (proposal: Proposal) => void
}

export default function ProposalCard({ proposal, activeTab, unreadCount, onSelect }: ProposalCardProps) {
    const displayStatus = getProposalDisplayStatus(proposal)

    return (
        <div
            onClick={() => onSelect(proposal)}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-start justify-between cursor-pointer hover:bg-neutral-800/50 transition active:scale-[0.98] relative"
        >
            {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-neutral-900 min-w-[20px] text-center z-10 box-content">
                    {unreadCount}
                </div>
            )}

            <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="w-11 h-11 bg-neutral-800 rounded-full overflow-hidden flex-shrink-0 relative mt-0.5">
                    {activeTab === 'inbox' ? (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <UserIcon className="w-5 h-5 text-primary" />
                        </div>
                    ) : (
                        proposal.dancers.profile_img ? (
                            <Image src={proposal.dancers.profile_img} alt={proposal.dancers.stage_name} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px]">{proposal.dancers.stage_name[0]}</div>
                        )
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h3 className="text-white font-bold text-sm truncate">{proposal.projects.title}</h3>
                        <ProposalStatusBadge status={displayStatus} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/60 mb-1.5">
                        <span className="bg-white/10 px-1.5 py-0.5 rounded text-white/80">{proposal.projects.category}</span>
                        <span className="truncate">
                            {activeTab === 'inbox'
                                ? `${proposal.sender?.name || 'Unknown'}${proposal.projects.clients?.company_name ? ` (${proposal.projects.clients.company_name})` : ''}`
                                : `To: ${proposal.dancers.stage_name}`
                            }
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-primary/80 font-semibold">
                            {proposal.fee ? `${proposal.fee.toLocaleString()}원` : '금액 협의'}
                        </span>
                        <span className="text-white/30">
                            {getRelativeTime(proposal.created_at)}
                        </span>
                        {proposal.status === 'accepted' && (
                            <Link
                                href={`/my/projects/${proposal.project_id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="ml-auto flex items-center gap-0.5 text-green-400 hover:underline"
                            >
                                <ExternalLink className="w-3 h-3" />
                                프로젝트
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
