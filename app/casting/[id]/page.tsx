'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import MobileContainer from '@/components/layout/MobileContainer'
import { Ico, BookmarkButton } from '@/components/cue'
import { CASTING_MOCKS, formatPay, type CastingMock } from '@/lib/castingMockData'
import { useBackWithFallback } from '@/lib/useBackWithFallback'
import ApplyCastingSheet from '../_components/ApplyCastingSheet'

const OFFER_MODEL_LABEL: Record<CastingMock['offerModel'], string> = {
    public: '공개 캐스팅',
    direct: '다이렉트 오퍼',
    hybrid: '공개+초대',
}

const BRIEF_BY_ID: Record<string, string> = {
    'mock-1':
        '뉴진스 혜인의 솔로 무대 백업 댄서 4인을 모집합니다. 리허설 2회와 본 촬영 1일, Lia Kim 안무 베이스의 섬세한 매칭이 필요합니다.',
    'mock-2':
        '나이키 여성 풋볼 캠페인을 위한 안무 6인 라인업. 도쿄 4일 촬영, 항공·숙박 지원. 힙합 베이스의 강인한 무브를 보여줄 수 있는 댄서를 찾습니다.',
    'mock-3':
        'Daisy McKenzie 신곡 GLOSS 뮤직비디오 안무 디렉팅. 사전 미팅 1회 + 촬영 단일. 재즈 기반 여성 솔로 안무 경험 있는 안무가 우대.',
    'mock-4':
        'LDP 컴퍼니 앙상블 정단원 오디션. 컨템포러리 베이스, 연봉제. 5/4 신촌 본관 오픈콜.',
    'mock-5':
        '강남 1ON1 스튜디오 K-pop 강사 상시 모집. 주 2~3회 평일 저녁 클래스, 시급 협의 가능.',
    'mock-6':
        '[다이렉트 오퍼] STRAY KIDS 월드투어 백업. 6개 도시 4개월 일정, 30대 가능. 응답 D-3 내 회신 요망.',
    'mock-7':
        '뮤직비디오 1인 배우 구인. 노댄스 컨셉, 6/22 단일 촬영. 페이는 협의.',
}

export default function CastingDetailPage() {
    const params = useParams<{ id: string }>()
    const search = useSearchParams()
    const goBack = useBackWithFallback('/casting')
    const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : ''

    const item = CASTING_MOCKS.find((m) => m.id === id)
    const [openApply, setOpenApply] = useState(false)

    useEffect(() => {
        if (search?.get('apply') === '1') setOpenApply(true)
    }, [search])

    if (!item) {
        return (
            <MobileContainer>
                <div
                    className="min-h-screen flex flex-col items-center justify-center px-6"
                    style={{ background: 'var(--cue-bg)', color: 'var(--cue-ink)' }}
                >
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        style={{ background: 'var(--cue-surface)', border: '1px solid var(--cue-hairline)' }}
                    >
                        {Ico.briefcase('var(--cue-ink-4)', 28)}
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--cue-ink-2)', marginBottom: 16 }}>
                        존재하지 않는 공고입니다
                    </p>
                    <button
                        type="button"
                        onClick={goBack}
                        className="px-5 py-3 rounded-full font-medium"
                        style={{
                            background: 'var(--cue-surface-2)',
                            color: 'var(--cue-ink)',
                            fontSize: 13,
                            border: '1px solid var(--cue-hairline)',
                        }}
                    >
                        목록으로 돌아가기
                    </button>
                </div>
            </MobileContainer>
        )
    }

    const brief =
        BRIEF_BY_ID[item.id] ||
        '상세 설명은 백엔드 연동 후 제공됩니다. 현재는 캐스팅 상세 UI 스캐폴드입니다.'

    return (
        <MobileContainer>
            <div
                className="min-h-screen pb-44"
                style={{ background: 'var(--cue-bg)', color: 'var(--cue-ink)' }}
            >
                <header
                    className="sticky top-0 z-10 pt-header-safe"
                    style={{
                        background: 'color-mix(in srgb, var(--cue-bg) 92%, transparent)',
                        backdropFilter: 'blur(18px)',
                        WebkitBackdropFilter: 'blur(18px)',
                        borderBottom: '1px solid var(--cue-hairline)',
                    }}
                >
                    <div className="px-6 py-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                type="button"
                                aria-label="뒤로"
                                onClick={goBack}
                                className="p-2 rounded-full flex-shrink-0"
                                style={{
                                    background: 'var(--cue-surface)',
                                    border: '1px solid var(--cue-hairline)',
                                    color: 'var(--cue-ink)',
                                }}
                            >
                                {Ico.chevLeft('currentColor', 16)}
                            </button>
                            <div className="min-w-0">
                                <div
                                    style={{
                                        fontSize: 11,
                                        letterSpacing: 1.4,
                                        textTransform: 'uppercase',
                                        color: 'var(--cue-ink-3)',
                                        fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                                    }}
                                >
                                    CASTING · {item.category}
                                </div>
                                <div
                                    style={{
                                        fontFamily: 'var(--font-cue-serif), serif',
                                        fontStyle: 'italic',
                                        fontSize: 18,
                                        letterSpacing: -0.4,
                                        color: 'var(--cue-ink)',
                                    }}
                                    className="truncate"
                                >
                                    Detail<span style={{ color: 'var(--cue-accent)' }}>.</span>
                                </div>
                            </div>
                        </div>
                        <BookmarkButton kind="casting" id={item.id} size={20} />
                    </div>
                </header>

                <div className="px-6 pt-5 space-y-5">
                    <section>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                            <Chip tone="accent">{item.category}</Chip>
                            <Chip>{OFFER_MODEL_LABEL[item.offerModel]}</Chip>
                            {item.tags.map((t) => (
                                <Chip key={t}>{t}</Chip>
                            ))}
                        </div>
                        <h1
                            style={{
                                fontFamily: 'var(--font-cue-serif), serif',
                                fontStyle: 'italic',
                                fontSize: 28,
                                lineHeight: 1.15,
                                letterSpacing: -0.4,
                                color: 'var(--cue-ink)',
                            }}
                        >
                            {item.title}
                            <span style={{ color: 'var(--cue-accent)' }}>.</span>
                        </h1>
                        <p style={{ fontSize: 13, color: 'var(--cue-ink-3)', marginTop: 8 }}>
                            {item.poster} · {item.posterRole}
                        </p>
                    </section>

                    <section
                        style={{
                            padding: 16,
                            borderRadius: 18,
                            background: 'var(--cue-surface)',
                            border: '1px solid var(--cue-hairline)',
                            display: 'grid',
                            gap: 12,
                        }}
                    >
                        <Row label="모델" value={OFFER_MODEL_LABEL[item.offerModel]} />
                        <Row label="페이" value={formatPay(item.pay)} mono />
                        <Row label="일정" value={item.schedule} />
                        {item.location && <Row label="장소" value={item.location} />}
                        {item.deadlineLabel && (
                            <Row label="마감" value={item.deadlineLabel} mono accent />
                        )}
                    </section>

                    <section>
                        <div
                            style={{
                                fontSize: 10,
                                letterSpacing: 1.2,
                                fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                                color: 'var(--cue-ink-3)',
                                textTransform: 'uppercase',
                                marginBottom: 8,
                            }}
                        >
                            ↳ BRIEF
                        </div>
                        <p
                            style={{
                                fontSize: 14,
                                lineHeight: 1.65,
                                color: 'var(--cue-ink-2)',
                            }}
                        >
                            {brief}
                        </p>
                    </section>

                    <div
                        style={{
                            padding: 12,
                            borderRadius: 12,
                            background: 'var(--cue-surface)',
                            border: '1px dashed var(--cue-hairline)',
                            fontSize: 11,
                            color: 'var(--cue-ink-3)',
                            lineHeight: 1.55,
                        }}
                    >
                        ↳ 현재는 UI 스캐폴드입니다. 실제 지원 접수와 메시지 발송은 백엔드 연동 후 동작합니다.
                    </div>
                </div>

                <div
                    className="fixed left-1/2 -translate-x-1/2 w-full px-4 pt-3 pb-3"
                    style={{
                        bottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
                        maxWidth: 480,
                        background: 'color-mix(in srgb, var(--cue-bg) 94%, transparent)',
                        backdropFilter: 'blur(18px)',
                        WebkitBackdropFilter: 'blur(18px)',
                        borderTop: '1px solid var(--cue-hairline)',
                        zIndex: 40,
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setOpenApply(true)}
                        className="w-full py-4 rounded-full font-semibold flex items-center justify-center gap-2"
                        style={{
                            background: 'var(--cue-accent)',
                            color: 'var(--cue-accent-ink)',
                            fontSize: 14,
                            letterSpacing: 0.4,
                            border: 'none',
                        }}
                    >
                        지원하기 {Ico.arrow('var(--cue-accent-ink)', 16)}
                    </button>
                </div>
            </div>

            <ApplyCastingSheet
                open={openApply}
                onClose={() => setOpenApply(false)}
                casting={item}
            />
        </MobileContainer>
    )
}

function Row({
    label,
    value,
    mono,
    accent,
}: {
    label: string
    value: string
    mono?: boolean
    accent?: boolean
}) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span
                style={{
                    fontSize: 11,
                    letterSpacing: 1.2,
                    fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                    color: 'var(--cue-ink-3)',
                    textTransform: 'uppercase',
                }}
            >
                {label}
            </span>
            <span
                style={{
                    fontSize: mono ? 13 : 13,
                    fontFamily: mono
                        ? 'var(--font-cue-mono), ui-monospace, monospace'
                        : 'inherit',
                    fontWeight: mono ? 600 : 500,
                    color: accent ? 'var(--cue-accent)' : 'var(--cue-ink)',
                    textAlign: 'right',
                }}
            >
                {value}
            </span>
        </div>
    )
}

function Chip({
    children,
    tone = 'default',
}: {
    children: React.ReactNode
    tone?: 'default' | 'accent'
}) {
    return (
        <span
            style={{
                fontSize: 10,
                padding: '3px 8px',
                borderRadius: 999,
                background: tone === 'accent' ? 'var(--cue-accent-dim)' : 'var(--cue-surface-2)',
                color: tone === 'accent' ? 'var(--cue-accent)' : 'var(--cue-ink-2)',
                border: '1px solid var(--cue-hairline)',
                fontFamily: 'var(--font-cue-mono), ui-monospace, monospace',
                letterSpacing: 0.4,
                textTransform: 'uppercase',
            }}
        >
            {children}
        </span>
    )
}
