/**
 * 경력 영상 URL 채우기 우선순위.
 * 비어있으면 표기 순서가 맨 뒤로 밀리므로, 아래 순서로 하나라도 찾아서 넣는 것을 권장합니다.
 */
export const CAREER_YOUTUBE_URL_PRIORITY = [
  { order: 1, label: '안무가의 안무 시안 영상', description: '1MILLION 등 안무가 채널 업로드' },
  { order: 2, label: '가수의 퍼포먼스 비디오', description: '음방·공연 직캠 등' },
  { order: 3, label: '가수의 연습실 영상 (Practice)', description: 'Dance Practice' },
  { order: 4, label: '가수의 뮤직비디오', description: 'Official MV' },
] as const;

export const CAREER_YOUTUBE_PLACEHOLDER =
  'https://youtube.com/watch?v=... (우선순위: 안무 시안 → 퍼포먼스 → 연습실 → 뮤직비디오)';
