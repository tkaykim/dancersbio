export type CastingCategory = '광고' | '안무제작' | '댄서참여' | '강사구인' | '오디션' | '기타'
export type CastingPayType = 'fixed' | 'range' | 'negotiable' | 'unpaid'
export type CastingOfferModel = 'public' | 'direct' | 'hybrid'

export interface CastingPay {
    type: CastingPayType
    fixed?: number
    min?: number
    max?: number
    note?: string
}

export interface CastingMock {
    id: string
    category: CastingCategory
    offerModel: CastingOfferModel
    title: string
    poster: string
    posterRole: string
    deadlineLabel?: string
    schedule: string
    location?: string
    tags: string[]
    pay: CastingPay
    featured?: boolean
}

export const CASTING_MOCKS: CastingMock[] = [
    {
        id: 'mock-1',
        category: '댄서참여',
        offerModel: 'public',
        featured: true,
        title: '뉴진스 혜인 솔로 무대 백업 댄서',
        poster: 'ADOR · 안무 Lia Kim',
        posterRole: '클라이언트',
        deadlineLabel: 'D-2',
        schedule: '5/12 · 리허설 2회 + 본 촬영',
        location: '서울 성동',
        tags: ['Backup', 'Female', 'Seoul'],
        pay: { type: 'fixed', fixed: 1_800_000 },
    },
    {
        id: 'mock-2',
        category: '광고',
        offerModel: 'public',
        title: '나이키 여성 풋볼 캠페인 — 안무 6명',
        poster: 'Wieden+Kennedy Tokyo',
        posterRole: '클라이언트',
        deadlineLabel: 'D-5',
        schedule: '6월 첫째주 · 4일 촬영',
        location: '도쿄 (항공 제공)',
        tags: ['CF', 'Hip-hop', 'Any'],
        pay: { type: 'range', min: 3_500_000, max: 5_000_000 },
    },
    {
        id: 'mock-3',
        category: '안무제작',
        offerModel: 'hybrid',
        title: 'Daisy McKenzie "GLOSS" MV 안무',
        poster: '독립 레이블 · A&R Direct',
        posterRole: '클라이언트',
        deadlineLabel: 'D-9',
        schedule: '4/30 단일 · 사전 미팅 1회',
        tags: ['MV', 'Jazz', 'Female'],
        pay: { type: 'fixed', fixed: 6_500_000 },
    },
    {
        id: 'mock-4',
        category: '오디션',
        offerModel: 'public',
        title: 'LDP 컴퍼니 — 앙상블 정단원 오디션',
        poster: 'LDP Dance Company',
        posterRole: '에이전시',
        deadlineLabel: 'D-11',
        schedule: '5/4 오픈콜',
        location: '서울 신촌',
        tags: ['Audition', 'Contemporary'],
        pay: { type: 'fixed', fixed: 32_000_000, note: '연봉제' },
    },
    {
        id: 'mock-5',
        category: '강사구인',
        offerModel: 'public',
        title: '강남 1On1 스튜디오 K-pop 강사 모집',
        poster: '1ON1 Studio Gangnam',
        posterRole: '클라이언트',
        deadlineLabel: '상시',
        schedule: '주 2~3회 · 평일 저녁',
        location: '서울 강남',
        tags: ['Lesson', 'K-pop', 'Weekly'],
        pay: { type: 'range', min: 60_000, max: 120_000, note: '시급' },
    },
    {
        id: 'mock-6',
        category: '댄서참여',
        offerModel: 'direct',
        title: '[다이렉트] STRAY KIDS 월드투어 백업 — 30대 가능',
        poster: 'JYP Entertainment',
        posterRole: '클라이언트',
        deadlineLabel: '응답 D-3',
        schedule: '6 도시 · 4개월 일정',
        tags: ['Tour', 'Hip-hop'],
        pay: { type: 'fixed', fixed: 12_400_000 },
    },
    {
        id: 'mock-7',
        category: '기타',
        offerModel: 'public',
        title: '뮤직비디오 배우 1인 구인 — 노댄스',
        poster: '익명 클라이언트',
        posterRole: '클라이언트',
        deadlineLabel: 'D-14',
        schedule: '6/22 · 1일',
        tags: ['Acting', 'Any'],
        pay: { type: 'negotiable' },
    },
]

export function formatPay(pay: CastingPay): string {
    const w = (n: number) => `₩${n.toLocaleString('ko-KR')}`
    switch (pay.type) {
        case 'fixed':
            return pay.note ? `${w(pay.fixed!)} · ${pay.note}` : w(pay.fixed!)
        case 'range':
            return pay.note ? `${w(pay.min!)}~${w(pay.max!)} · ${pay.note}` : `${w(pay.min!)}~${w(pay.max!)}`
        case 'negotiable':
            return '협의'
        case 'unpaid':
            return '무급'
    }
}
