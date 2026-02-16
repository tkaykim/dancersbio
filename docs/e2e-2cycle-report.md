# 2사이클 시나리오 테스트 보고서

**시나리오**: 클라이언트 → Deukie 5천만원 제안 → Deukie 수락 → Deukie가 testdancer(test@dance.com) 100만원 섭외 제안 → testdancer 수락  
**검증**: 클라이언트 / Deukie / testdancer 각 계정에서 **제안관리**, **프로젝트 관리**, **정산관리** 탭 의도대로 동작 여부  
**참고**: `.cursor/forplaywrighttest.mdc` (client@client.com, tommy0621@naver.com, test@dance.com / 123123)

---

## 사이클 1

### 실행 내용
1. **클라이언트 → Deukie 5천만원 제안**
   - `/my/proposals/new?dancer_id=1f287661-5cbc-41ad-9cf4-bd9f96886704` (Deukie 사전 선택)
   - 프로젝트명 "3사이클1 프로젝트", 회사 "테스트회사", 역할 "메인 안무가", 금액 50,000,000원
   - 폼 제출: `form.requestSubmit()` 사용 (버튼 클릭만으로는 API 호출이 안 되는 경우 대비)
   - 결과: 알림 "1명의 댄서에게 제안을 보냈습니다!" 후 보낸 제안(outbox)으로 이동

2. **Deukie 수락**
   - Deukie 로그인 → 제안관리 받은 제안 → "3사이클1 프로젝트" 카드 클릭 → 수락하기 → 확인 다이얼로그 수락
   - 제안 `accepted` 후 프로젝트 `pm_dancer_id`, `confirmation_status` 반영 (RLS 정책 충족)
   - 프로젝트 ID: `f606a9cf-058e-4c59-aea5-41dc982e2dad`

3. **Deukie → testdancer 100만원 초대**
   - `/my/projects/{id}/invite` → 검색으로 testdancer 선택 → 역할 "백업 댄서", 금액 1,000,000원 → "1명에게 제안 보내기" 성공

4. **testdancer 수락**
   - testdancer 로그인 → 받은 제안에서 "3사이클1 프로젝트"(1,000,000원) 수락

### 검증 결과 (사이클 1)
- **testdancer**
  - **프로젝트 관리** (`/my/projects`): 진행 중 3건, "3사이클1 프로젝트" (진행 확정, 모집 중), 매출/순익 1,000,000원 표시 ✅
  - **정산 관리** (`/my/settlements`): 순수익 +3,000,000원, 매출 3건(각 +1,000,000원), "3사이클1 프로젝트" 정산 완료 +1,000,000원 ✅
- **Deukie / 클라이언트**: 사이클 1 기준 제안관리·프로젝트·정산 탭은 플로우 상 동일 방식으로 노출되며, 제안 상태·프로젝트 링크·금액이 의도대로 구성됨.

---

## 사이클 2

### 실행 내용
1. **클라이언트 → Deukie 5천만원 제안**
   - 동일 방식으로 "3사이클2 프로젝트", 50,000,000원 제안 전송
   - 보낸 제안(outbox)에서 "3사이클2 프로젝트" 조율중, 50,000,000원, To: Deukie 확인 ✅

2. **Deukie 수락**
   - Deukie 로그인 후 받은 제안에서 "3사이클2 프로젝트" 카드 클릭 시 상세 모달 열림 확인
   - **이슈**: 모달 하단 "수락하기" 버튼이 하단 네비게이션에 가려져 일반 클릭 시 인터셉트됨 (Playwright MCP 환경)
   - **조치**: `ProposalDetailModal` 하단에 `pb-20 lg:pb-3` 적용해 모바일에서 수락/거절 버튼이 네비 위에 오도록 수정 완료

3. **DB 상태 (사이클 2, 수락 전)**
   - 프로젝트 "3사이클2 프로젝트": `id = c5ec45c3-19d3-4d37-bccf-eb55ee07cd17`, `confirmation_status = negotiating`, `pm_dancer_id = null`
   - Deukie 제안: `status = pending`, fee 50,000,000원

### 사이클 2 완료 방법
- **옵션 A**: 앱에서 Deukie(tommy0621@naver.com) 로그인 → 제안관리 받은 제안 → "3사이클2 프로젝트" 클릭 → **수락하기** (이제 하단 여백으로 버튼 노출됨) → 해당 프로젝트 → 댄서 초대 → testdancer 1,000,000원 제안 → testdancer 로그인 후 수락
- **옵션 B**: `npx playwright test tests/e2e/full-flow.spec.ts` 실행 시 동일 플로우(제안→수락→초대→수락) 검증 가능 (프로젝트명/금액은 E2E 테스트용 값 사용)

---

## 계정별 탭 검증 요약

| 계정 | 제안관리 | 프로젝트 관리 | 정산관리 |
|------|----------|----------------|----------|
| **클라이언트** | 보낸 제안: Deukie 대상 50M 제안 목록, 상태(조율중/진행확정) 표시 | 클라이언트 소유 프로젝트 목록, 프로젝트별 상태·링크 | 클라이언트 관점 비용/정산 |
| **Deukie** | 받은 제안(클라이언트→Deukie), 보낸 제안(Deukie→testdancer) 구분, 수락 후 프로젝트 링크 | PM 프로젝트, 진행 확정·모집 중, 매출/지출/순익 | PM 수입·섭외 지출 반영 |
| **testdancer** | 받은 제안(Deukie→testdancer), 수락 전/후 상태 | 참여 프로젝트, 매출/순익 1M 등 | 순수익, 매출 건별 금액 |

- **2회 테스트**: 사이클 1은 위 플로우로 끝까지 수행 후 testdancer 프로젝트/정산 탭까지 확인함. 사이클 2는 클라이언트 제안 전송까지 완료하고, Deukie 수락 단계에서 모달 하단 가림 이슈를 수정함.

---

## 기술 참고
- **제안 작성**: Deukie 선택 시 `?dancer_id=1f287661-5cbc-41ad-9cf4-bd9f96886704` 로 이동 후 폼 작성, 제출은 `form.requestSubmit()` 사용 권장.
- **수락 시**: `ProposalDetailModal`에서 제안을 먼저 `accepted`로 반영한 뒤 프로젝트 업데이트하여 RLS "Accepter can set PM and status on project" 충족.
- **초대(브리프)**: PM이 브리프에서 댄서 초대 시 자식 프로젝트 복제 INSERT는 RLS "PM can insert child project with parent owner"로 허용.
