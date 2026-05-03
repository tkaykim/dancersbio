'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import ProjectForm from '@/components/projects/ProjectForm'
import { useBackWithFallback } from '@/lib/useBackWithFallback'

export default function EditProjectPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const handleBack = useBackWithFallback(`/my/projects/${id}`)

    return (
        <div className="min-h-screen bg-background pb-nav-safe">
            <div className="sticky top-0 bg-background border-b border-neutral-800 z-10 pt-header-safe">
                <div className="px-5 pb-3.5 flex items-center gap-3">
                    <button type="button" onClick={handleBack} className="-ml-1 p-1" aria-label="뒤로">
                        <ArrowLeft className="w-5 h-5 text-white/70" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">프로젝트 수정</h1>
                        <p className="text-white/35 text-[11px]">변경 사항을 저장하면 즉시 반영됩니다</p>
                    </div>
                </div>
            </div>

            <ProjectForm
                projectId={id}
                onSuccess={(pid) => router.push(`/my/projects/${pid}`)}
                onCancel={handleBack}
            />
        </div>
    )
}
