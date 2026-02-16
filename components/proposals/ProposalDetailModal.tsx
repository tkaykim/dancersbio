'use client'

import { useEffect, useRef } from 'react'
import { XCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import ProposalChat from './ProposalChat'
import ProposalMessageInput from './ProposalMessageInput'
import type { Proposal, ProposalTab } from '@/lib/types'

interface ProposalDetailModalProps {
    proposal: Proposal
    activeTab: ProposalTab
    onClose: () => void
    onUpdate: (updated: Proposal) => void
    onRefresh: () => void
}

export default function ProposalDetailModal({ proposal, activeTab, onClose, onUpdate, onRefresh }: ProposalDetailModalProps) {
    const { user } = useAuth()
    const chatContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [proposal.negotiation_history])

    const handleSendMessage = async (type: 'text' | 'offer' | 'decline' | 'accept', content?: string, fee?: number) => {
        if (!user) return

        const timestamp = new Date().toISOString()
        const actorName = activeTab === 'inbox'
            ? proposal.dancers.stage_name
            : (proposal.sender?.name || 'Unknown')

        let updateData: any = {}
        let messageText = content || ''

        if (type === 'decline') {
            updateData.status = 'declined'
            messageText = content || "제안을 거절했습니다."
        } else if (type === 'accept') {
            updateData.status = 'accepted'
            messageText = "제안을 수락했습니다."
            // 제안 수락 시 프로젝트 상태 자동 전환
            try {
                const { data: proj } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('id', proposal.project_id)
                    .single()
                if (proj) {
                    // 마이그레이션 후 스키마
                    if (proj.confirmation_status === 'negotiating') {
                        await supabase
                            .from('projects')
                            .update({ confirmation_status: 'confirmed', progress_status: 'recruiting' })
                            .eq('id', proposal.project_id)
                    }
                    // 마이그레이션 전 스키마
                    else if (proj.status === 'recruiting') {
                        await supabase
                            .from('projects')
                            .update({ status: 'active' })
                            .eq('id', proposal.project_id)
                    }
                }
            } catch { /* non-critical */ }
        } else if (type === 'offer') {
            updateData.status = 'negotiating'
        } else if (type === 'text') {
            if (proposal.status === 'pending') {
                updateData.status = 'negotiating'
            }
        }

        const newHistoryItem = {
            date: timestamp,
            actor: actorName,
            actor_id: user.id,
            message: messageText,
            suggested_fee: fee || null,
            type: type === 'text' ? 'message' : type
        }

        const currentHistory = proposal.negotiation_history || []
        const updatedHistory = [...currentHistory, newHistoryItem]
        updateData.negotiation_history = updatedHistory

        onUpdate({ ...proposal, ...updateData, negotiation_history: updatedHistory })

        const { error } = await supabase
            .from('proposals')
            .update(updateData)
            .eq('id', proposal.id)

        if (!error) {
            onRefresh()
        } else {
            alert('메시지 전송 실패')
        }
    }

    if (!user) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-neutral-900 border border-neutral-800 rounded-t-2xl lg:rounded-2xl w-full max-w-md h-[85vh] lg:h-[800px] flex flex-col shadow-2xl animate-in slide-in-from-bottom-2 duration-200 mt-auto lg:mt-0 mb-4 lg:mb-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex-shrink-0 bg-neutral-900 border-b border-neutral-800 p-4 flex justify-between items-center z-10 rounded-t-2xl">
                    <div>
                        <h2 className="font-bold text-white text-lg line-clamp-1">{proposal.projects.title}</h2>
                        <p className="text-white/50 text-xs text-left">
                            {activeTab === 'inbox' ? proposal.sender?.name : proposal.dancers.stage_name}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/50 hover:text-white">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                {/* Chat area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950/50" ref={chatContainerRef}>
                    <ProposalChat proposal={proposal} userId={user.id} />
                </div>

                {/* Message input */}
                <ProposalMessageInput
                    status={proposal.status}
                    onSendMessage={handleSendMessage}
                />
            </div>
        </div>
    )
}
