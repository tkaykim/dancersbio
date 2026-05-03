'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import ProjectForm from './ProjectForm'

interface Props {
    isOpen: boolean
    onClose: () => void
    /** 있으면 수정 모드 */
    projectId?: string
    onSuccess?: (projectId: string) => void
}

export default function ProjectFormModal({ isOpen, onClose, projectId, onSuccess }: Props) {
    // ESC 닫기
    useEffect(() => {
        if (!isOpen) return
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        // body 스크롤 잠금
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            window.removeEventListener('keydown', handler)
            document.body.style.overflow = prev
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--cue-bg, #0E0E0C)',
                    color: 'var(--cue-ink, #F4F0E6)',
                    borderRadius: 16,
                    width: '100%', maxWidth: 560,
                    maxHeight: '90vh', overflow: 'auto',
                    border: '1px solid var(--cue-hairline)',
                    boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '14px 20px',
                        borderBottom: '1px solid var(--cue-hairline)',
                        position: 'sticky', top: 0,
                        background: 'var(--cue-bg, #0E0E0C)',
                        zIndex: 1,
                    }}
                >
                    <h2 style={{ fontSize: 15, fontWeight: 700 }}>
                        {projectId ? '프로젝트 수정' : '새 프로젝트'}
                    </h2>
                    <button
                        type="button" onClick={onClose} aria-label="닫기"
                        style={{ padding: 6, borderRadius: 8, color: 'var(--cue-ink-2)' }}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <ProjectForm
                    projectId={projectId}
                    onSuccess={(id) => {
                        onSuccess?.(id)
                        onClose()
                    }}
                    onCancel={onClose}
                />
            </div>
        </div>
    )
}
