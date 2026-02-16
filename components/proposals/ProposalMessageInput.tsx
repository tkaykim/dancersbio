'use client'

import { useState } from 'react'
import { Send, DollarSign, XCircle } from 'lucide-react'

interface ProposalMessageInputProps {
    status: string
    onSendMessage: (type: 'text' | 'offer' | 'decline' | 'accept', content?: string, fee?: number) => void
}

export default function ProposalMessageInput({ status, onSendMessage }: ProposalMessageInputProps) {
    const [newMessage, setNewMessage] = useState('')
    const [showFeeInput, setShowFeeInput] = useState(false)
    const [suggestedFee, setSuggestedFee] = useState('')

    const handleSend = (type: 'text' | 'offer' | 'decline' | 'accept', content?: string) => {
        if (type === 'offer') {
            onSendMessage('offer', content || `${suggestedFee}원으로 금액 조정을 제안합니다.`, parseInt(suggestedFee))
            setSuggestedFee('')
            setShowFeeInput(false)
        } else if (type === 'text') {
            if (!newMessage.trim()) return
            onSendMessage('text', newMessage)
            setNewMessage('')
        } else {
            onSendMessage(type, content)
        }
    }

    const isClosed = status === 'accepted' || status === 'declined'

    return (
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
                            onClick={() => handleSend('offer')}
                            className="bg-primary text-black font-bold px-4 rounded-lg text-sm"
                        >
                            제안 전송
                        </button>
                    </div>
                </div>
            )}

            {!isClosed ? (
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
                                    handleSend('text')
                                }
                            }}
                            placeholder="메시지를 입력하세요..."
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary resize-none max-h-24 min-h-[46px]"
                            rows={1}
                        />
                    </div>
                    <button
                        onClick={() => handleSend('text')}
                        disabled={!newMessage.trim()}
                        className="p-3 bg-primary text-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            ) : (
                <div className="text-center py-2 text-white/50 text-sm bg-neutral-800/50 rounded-xl">
                    {status === 'accepted' ? '수락된 제안입니다.' : '거절된 제안입니다.'}
                </div>
            )}

            {!isClosed && (
                <div className="mt-2 flex justify-end gap-2 text-xs">
                    <button
                        onClick={() => { if (confirm('정말 거절하시겠습니까?')) handleSend('decline') }}
                        className="px-3 py-1.5 text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20"
                    >
                        거절하기
                    </button>
                    <button
                        onClick={() => { if (confirm('제안을 수락하시겠습니까?')) handleSend('accept') }}
                        className="px-3 py-1.5 text-green-500 bg-green-500/10 rounded-lg hover:bg-green-500/20"
                    >
                        수락하기
                    </button>
                </div>
            )}
        </div>
    )
}
