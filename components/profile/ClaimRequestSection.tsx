'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, UserCheck, Briefcase, X } from 'lucide-react'

interface ClaimRequestSectionProps {
  dancerId: string
}

export default function ClaimRequestSection({ dancerId }: ClaimRequestSectionProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="w-full px-6 pb-8">
        <p className="text-center text-xs text-white/40 mb-3">
          본인 또는 이 댄서의 매니저이신가요?
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 h-11 rounded-full border border-white/15 text-white/70 text-sm font-medium hover:bg-white/5 hover:border-white/25 transition-all"
        >
          <Shield className="w-4 h-4" />
          이 프로필 권한 신청하기
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 pb-3">
              <h3 className="text-lg font-bold text-white">프로필 권한 신청</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full text-white/40 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="px-5 text-xs text-white/50 mb-4">
              신청 유형을 선택하세요. 관리자 확인 후 승인됩니다.
            </p>

            <div className="px-5 pb-5 space-y-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  router.push(`/onboarding/claim?id=${dancerId}`)
                }}
                className="w-full flex items-start gap-4 p-4 rounded-xl border border-neutral-700 hover:border-[#22C55E]/50 hover:bg-[#22C55E]/5 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#22C55E]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#22C55E]/20 transition-colors">
                  <UserCheck className="w-5 h-5 text-[#22C55E]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-0.5">소유권 요청</p>
                  <p className="text-xs text-white/40 leading-relaxed">
                    본인의 프로필이라면 소유권을 요청하여 직접 관리하세요.
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowModal(false)
                  router.push(`/onboarding/claim?id=${dancerId}&mode=manager`)
                }}
                className="w-full flex items-start gap-4 p-4 rounded-xl border border-neutral-700 hover:border-white/30 hover:bg-white/5 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/15 transition-colors">
                  <Briefcase className="w-5 h-5 text-white/70" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-0.5">매니저 요청</p>
                  <p className="text-xs text-white/40 leading-relaxed">
                    이 댄서의 매니저라면 관리 권한을 요청할 수 있습니다.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
