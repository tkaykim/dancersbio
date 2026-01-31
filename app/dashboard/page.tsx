'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Inbox, Send, Plus, Filter, ChevronDown, CheckCircle2, XCircle, Clock, User as UserIcon, Building2, DollarSign } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Proposal {
    id: string
    project_id: string
    dancer_id: string
    sender_id: string
    role: string
    fee: number | null
    status: 'pending' | 'accepted' | 'declined' | 'negotiating'
    sender_last_read_at: string | null
    receiver_last_read_at: string | null
    negotiation_history: any[] | null
    details: string | null
    created_at: string
    projects: {
        title: string
        category: string
        status: string
        clients: {
            company_name: string | null
        } | null
    }
    dancers: {
        id: string
        stage_name: string
        profile_img: string | null
    }
    sender?: {
        name: string | null
    }
}

interface DancerProfile {
    id: string
    stage_name: string
    profile_img: string | null
    role: 'owner' | 'manager'
}

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    // State
    const [activeTab, setActiveTab] = useState<'inbox' | 'outbox'>('inbox')
    const [myProfiles, setMyProfiles] = useState<DancerProfile[]>([])
    const [selectedProfileId, setSelectedProfileId] = useState<string>('all')
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)

    // Chat & Action State
    const [newMessage, setNewMessage] = useState('')
    const [showFeeInput, setShowFeeInput] = useState(false)
    const [suggestedFee, setSuggestedFee] = useState<string>('')
    const chatContainerRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom of chat
    useEffect(() => {
        if (selectedProposal && chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [selectedProposal, selectedProposal?.negotiation_history])

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (user) {
            fetchMyProfiles()
        }
    }, [user])

    useEffect(() => {
        if (user && myProfiles.length > 0) {
            fetchProposals()
        } else if (user && myProfiles.length === 0 && !loading) {
            fetchProposals()
        }
    }, [user, activeTab, selectedProfileId, myProfiles])

    // Mark as read when proposal is selected
    useEffect(() => {
        if (selectedProposal && user) {
            markAsRead(selectedProposal)
        }
    }, [selectedProposal?.id])

    const fetchMyProfiles = async () => {
        const { data: owned } = await supabase
            .from('dancers')
            .select('id, stage_name, profile_img')
            .eq('owner_id', user!.id)

        const { data: managed } = await supabase
            .from('dancers')
            .select('id, stage_name, profile_img')
            .eq('manager_id', user!.id)

        const allProfiles: DancerProfile[] = [
            ...(owned?.map(p => ({ ...p, role: 'owner' as const })) || []),
            ...(managed?.map(p => ({ ...p, role: 'manager' as const })) || [])
        ]

        setMyProfiles(allProfiles)
    }

    const fetchProposals = async () => {
        setLoading(true)
        try {
            let query = supabase
                .from('proposals')
                .select(`
                    *,
                    projects (
                        title, 
                        category, 
                        status,
                        clients (company_name)
                    ),
                    dancers (id, stage_name, profile_img),
                    sender:users!sender_id (name)
                `)
                .order('created_at', { ascending: false })

            if (activeTab === 'inbox') {
                if (myProfiles.length === 0) {
                    setProposals([])
                    setLoading(false)
                    return
                }
                if (selectedProfileId !== 'all') {
                    query = query.eq('dancer_id', selectedProfileId)
                } else {
                    const allMyDancerIds = myProfiles.map(p => p.id)
                    query = query.in('dancer_id', allMyDancerIds)
                }
            } else {
                query = query.eq('sender_id', user!.id)
            }

            const { data, error } = await query
            if (error) throw error
            setProposals(data as any || [])
        } catch (err) {
            console.error('Error fetching proposals:', err)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (proposal: Proposal) => {
        if (!user) return

        const isSender = proposal.sender_id === user.id
        const updateField = isSender ? 'sender_last_read_at' : 'receiver_last_read_at'

        const { error } = await supabase
            .from('proposals')
            .update({ [updateField]: new Date().toISOString() })
            .eq('id', proposal.id)

        if (!error) {
            setProposals(prev => prev.map(p => {
                if (p.id === proposal.id) {
                    return { ...p, [updateField]: new Date().toISOString() }
                }
                return p
            }))
        }
    }

    const getUnreadCount = (proposal: Proposal) => {
        if (!user) return 0
        const isSender = proposal.sender_id === user.id
        const lastReadAt = isSender ? proposal.sender_last_read_at : proposal.receiver_last_read_at

        // Calculate unread messages from negotiation history
        const unreadHistoryMessages = proposal.negotiation_history?.filter((h: any) =>
            h.actor_id !== user.id && (!lastReadAt || new Date(h.date) > new Date(lastReadAt))
        ).length || 0

        if (!lastReadAt) {
            // If never read:
            // 1. If I am the proposal sender (Creator), and no history, it's my own proposal - count 0.
            // 2. If I am the receiver, and no history, the proposal itself is 1 unread message.
            if (!proposal.negotiation_history || proposal.negotiation_history.length === 0) {
                return isSender ? 0 : 1
            }
            // If history exists but I never read presumably (unlikely if I participated, but possible if I'm receiver and just got 10 messages)
            // Count all messages from OTHER people. If I am receiver, add 1 for the base proposal?
            // Let's assume the base proposal is "read" if I read the history? 
            // If I haven't read anything, I should see total unread count.
            // Base proposal counts as 1 if I am receiver. History counts as N.
            return unreadHistoryMessages + (isSender ? 0 : 1)
        }

        // If I have read it before:
        if (!proposal.negotiation_history || proposal.negotiation_history.length === 0) {
            if (isSender) return 0
            return new Date(proposal.created_at) > new Date(lastReadAt) ? 1 : 0
        }

        return unreadHistoryMessages
    }

    const handleSendMessage = async (type: 'text' | 'offer' | 'decline' | 'accept', content?: string, fee?: number) => {
        if (!selectedProposal || !user) return

        const timestamp = new Date().toISOString()
        const actorName = activeTab === 'inbox'
            ? (selectedProposal.dancers.stage_name)
            : (selectedProposal.sender?.name || 'Unknown')

        let updateData: any = {}
        let messageText = content || newMessage

        if (type === 'decline') {
            updateData.status = 'declined'
            messageText = content || "제안을 거절했습니다."
        } else if (type === 'accept') {
            updateData.status = 'accepted'
            messageText = "제안을 수락했습니다."
        } else if (type === 'offer') {
            updateData.status = 'negotiating'
        } else if (type === 'text') {
            if (selectedProposal.status === 'pending') {
                updateData.status = 'negotiating'
            }
        }

        const newHistoryItem = {
            date: timestamp,
            actor: actorName,
            actor_id: user.id,
            message: messageText,
            suggested_fee: fee || (type === 'offer' && suggestedFee ? parseInt(suggestedFee) : null),
            type: type === 'text' ? 'message' : type
        }

        const currentHistory = selectedProposal.negotiation_history || []
        // @ts-ignore
        const updatedHistory = [...currentHistory, newHistoryItem]
        updateData.negotiation_history = updatedHistory

        setSelectedProposal({ ...selectedProposal, ...updateData, negotiation_history: updatedHistory })
        setNewMessage('')
        setSuggestedFee('')
        setShowFeeInput(false)

        const { error } = await supabase
            .from('proposals')
            .update(updateData)
            .eq('id', selectedProposal.id)

        if (!error) {
            await fetchProposals()
        } else {
            alert('메시지 전송 실패')
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted': return <span className="flex items-center gap-1 text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs font-bold"><CheckCircle2 className="w-3 h-3" /> 수락됨</span>
            case 'declined': return <span className="flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-1 rounded text-xs font-bold"><XCircle className="w-3 h-3" /> 거절됨</span>
            case 'negotiating': return <span className="flex items-center gap-1 text-blue-500 bg-blue-500/10 px-2 py-1 rounded text-xs font-bold"><Clock className="w-3 h-3" /> 협상/조율중</span>
            default: return <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-xs font-bold"><Clock className="w-3 h-3" /> 대기중</span>
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white">로딩 중...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-10">
                <div className="px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">대시보드</h1>
                        <p className="text-white/60 text-sm">{user?.email}</p>
                    </div>
                    {activeTab === 'inbox' && (
                        <Link
                            href="/dashboard/proposals/new"
                            className="p-2 bg-neutral-800 rounded-full text-primary hover:bg-neutral-700 transition"
                        >
                            <Plus className="w-5 h-5" />
                        </Link>
                    )}
                </div>

                {activeTab === 'inbox' && myProfiles.length > 0 && (
                    <div className="px-6 pb-2">
                        <div className="relative">
                            <select
                                value={selectedProfileId}
                                onChange={(e) => setSelectedProfileId(e.target.value)}
                                className="w-full appearance-none bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary"
                            >
                                <option value="all">모든 프로필 ({myProfiles.length})</option>
                                {myProfiles.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.stage_name} {p.role === 'manager' ? '(매니저 권한)' : ''}
                                    </option>
                                ))}
                            </select>
                            <Filter className="absolute left-3 top-2.5 w-4 h-4 text-white/50" />
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-white/50 pointer-events-none" />
                        </div>
                    </div>
                )}

                <div className="flex border-t border-neutral-800 mt-2">
                    <button
                        onClick={() => setActiveTab('inbox')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'inbox'
                            ? 'text-primary'
                            : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Inbox className="w-4 h-4" />
                            받은 제안
                        </div>
                        {activeTab === 'inbox' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('outbox')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === 'outbox'
                            ? 'text-primary'
                            : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Send className="w-4 h-4" />
                            보낸 제안
                        </div>
                        {activeTab === 'outbox' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-3">
                {loading ? (
                    <div className="text-white/60 text-center py-12">로딩 중...</div>
                ) : proposals.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            {activeTab === 'inbox' ? <Inbox className="w-8 h-8 text-white/20" /> : <Send className="w-8 h-8 text-white/20" />}
                        </div>
                        <p className="text-white/60">
                            {activeTab === 'inbox' ? '받은 제안이 없습니다.' : '보낸 제안이 없습니다.'}
                        </p>
                    </div>
                ) : (
                    proposals.map((proposal) => {
                        const unreadCount = getUnreadCount(proposal)
                        return (
                            <div
                                key={proposal.id}
                                onClick={() => setSelectedProposal(proposal)}
                                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-800/50 transition active:scale-[0.98] relative"
                            >
                                {unreadCount > 0 && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-neutral-900 min-w-[20px] text-center z-10 box-content">
                                        {unreadCount}
                                    </div>
                                )}

                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 bg-neutral-800 rounded-full overflow-hidden flex-shrink-0 relative">
                                        {activeTab === 'inbox' ? (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                                <UserIcon className="w-6 h-6 text-primary" />
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
                                        <h3 className="text-white font-bold text-base truncate mb-0.5">{proposal.projects.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-white/60">
                                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-white/80">{proposal.projects.category}</span>
                                            <span className="truncate">
                                                {activeTab === 'inbox'
                                                    ? `From: ${proposal.sender?.name || 'Unknown'} ${proposal.projects.clients?.company_name ? `(${proposal.projects.clients.company_name})` : ''}`
                                                    : `To: ${proposal.dancers.stage_name}`
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-shrink-0 ml-4">
                                    {getStatusBadge(proposal.status)}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {selectedProposal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setSelectedProposal(null)}>
                    <div
                        className="bg-neutral-900 border border-neutral-800 rounded-t-2xl lg:rounded-2xl w-full max-w-md h-[85vh] lg:h-[800px] flex flex-col shadow-2xl animate-in slide-in-from-bottom-2 duration-200 mt-auto lg:mt-0 mb-4 lg:mb-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex-shrink-0 bg-neutral-900 border-b border-neutral-800 p-4 flex justify-between items-center z-10 rounded-t-2xl">
                            <div>
                                <h2 className="font-bold text-white text-lg line-clamp-1">{selectedProposal.projects.title}</h2>
                                <p className="text-white/50 text-xs text-left">
                                    {activeTab === 'inbox' ? selectedProposal.sender?.name : selectedProposal.dancers.stage_name}
                                </p>
                            </div>
                            <button onClick={() => setSelectedProposal(null)} className="p-2 text-white/50 hover:text-white">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950/50" ref={chatContainerRef}>
                            <div className="bg-neutral-800/20 border border-neutral-800 rounded-xl p-4 mb-6">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-primary text-xs font-bold px-2 py-0.5 bg-primary/10 rounded">{selectedProposal.projects.category}</span>
                                    <span className="text-white/40 text-xs">{new Date(selectedProposal.created_at).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-white font-bold text-sm mb-2">초기 제안 상세</h3>
                                <p className="text-white/80 text-sm whitespace-pre-wrap mb-3">{selectedProposal.details || "내용 없음"}</p>
                                <div className="flex gap-2 text-xs">
                                    <span className="bg-neutral-800 px-2 py-1 rounded text-white/60">역할: {selectedProposal.role}</span>
                                    <span className="bg-neutral-800 px-2 py-1 rounded text-white/60">금액: {selectedProposal.fee ? selectedProposal.fee.toLocaleString() + '원' : '협의'}</span>
                                </div>
                            </div>

                            {/* @ts-ignore */}
                            {selectedProposal.negotiation_history?.map((msg: any, idx: number) => {
                                const isMe = msg.actor_id === user!.id
                                const isProposalSender = selectedProposal.sender_id === user!.id
                                const otherPartyLastReadAt = isProposalSender
                                    ? selectedProposal.receiver_last_read_at
                                    : selectedProposal.sender_last_read_at

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
                        </div>

                        <div className="flex-shrink-0 bg-neutral-900 border-t border-neutral-800 p-3">
                            {showFeeInput && (
                                <div className="mb-3 p-3 bg-neutral-800 rounded-xl animate-in slide-in-from-bottom-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-white text-xs font-bold">제안 금액 변경</span>
                                        <button onClick={() => setShowFeeInput(false)} className="text-white/40 hover:text-white"><XCircle className="w-4 h-4" /></button>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={suggestedFee}
                                            onChange={(e) => setSuggestedFee(e.target.value)}
                                            placeholder="변경할 금액 (원)"
                                            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                                        />
                                        <button
                                            onClick={() => handleSendMessage('offer', `${suggestedFee}원으로 금액 조정을 제안합니다.`)}
                                            className="bg-primary text-black font-bold px-4 rounded-lg text-sm"
                                        >
                                            제안 전송
                                        </button>
                                    </div>
                                </div>
                            )}

                            {selectedProposal.status !== 'accepted' && selectedProposal.status !== 'declined' ? (
                                <div className="flex gap-2 items-end">
                                    <button
                                        onClick={() => setShowFeeInput(!showFeeInput)}
                                        className={`p-3 rounded-xl transition ${showFeeInput ? 'bg-primary text-black' : 'bg-neutral-800 text-white hover:bg-neutral-700'}`}
                                    >
                                        <DollarSign className="w-5 h-5" />
                                    </button>
                                    <div className="flex-1 relative">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault()
                                                    handleSendMessage('text')
                                                }
                                            }}
                                            placeholder="메시지를 입력하세요..."
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary resize-none max-h-24 min-h-[46px]"
                                            rows={1}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleSendMessage('text')}
                                        disabled={!newMessage.trim()}
                                        className="p-3 bg-primary text-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-2 text-white/50 text-sm bg-neutral-800/50 rounded-xl">
                                    {selectedProposal.status === 'accepted' ? '수락된 제안입니다.' : '거절된 제안입니다.'}
                                </div>
                            )}

                            {selectedProposal.status !== 'accepted' && selectedProposal.status !== 'declined' && (
                                <div className="mt-2 flex justify-end gap-2 text-xs">
                                    <button
                                        onClick={() => {
                                            if (confirm('정말 거절하시겠습니까?')) handleSendMessage('decline')
                                        }}
                                        className="px-3 py-1.5 text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20"
                                    >
                                        거절하기
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('제안을 수락하시겠습니까?')) handleSendMessage('accept')
                                        }}
                                        className="px-3 py-1.5 text-green-500 bg-green-500/10 rounded-lg hover:bg-green-500/20"
                                    >
                                        수락하기
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


