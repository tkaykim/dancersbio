# E2E 테스트 (전체 시나리오)

`.cursor/forplaywrighttest.mdc`에 정의된 계정으로 다음 시나리오를 자동 검증합니다.

## 시나리오

1. **클라이언트** 로그인 → 새 프로젝트로 **Deukie**에게 제안 발송
2. **Deukie**(tommy0621@naver.com) 로그인 → 제안 수락
3. **Deukie**가 프로젝트에서 **testdancer**(test@dance.com) 초대 → **testdancer** 로그인 후 수락
4. **Deukie(PM)** 로그인 → 프로젝트 상세에서 **매출/지출/순이익** 재무 영역 확인
5. **프로젝트 상태** 표시 확인 (확정/모집 중 등)
6. **보관하기** → 보관함 이동 확인 → **보관 해제**
7. **클라이언트(오너)** 로그인 → **엠바고** 설정 → **공개 설정** 토글 확인

## 실행 방법

- **필수**: 앱이 `http://localhost:3000`에서 동작 중이어야 합니다. (`npm run dev`)
- **필수**: Supabase 환경 변수 설정 및 위 계정이 실제 DB에 존재해야 합니다.

```bash
# 헤드리스 (기본)
npm run test:e2e

# 브라우저 창을 띄워 보면서 실행
npm run test:e2e:headed

# 또는
npx playwright test tests/e2e/full-flow.spec.ts
npx playwright test tests/e2e/full-flow.spec.ts --headed
```

## Playwright MCP로 수동 테스트

Playwright MCP가 연결된 상태에서는 아래 순서로 동일 시나리오를 수동 진행할 수 있습니다.

1. `http://localhost:3000/auth/signin` 이동
2. **클라이언트**: client@client.com / 123123 로그인
3. `/my/proposals/new` 이동 → 프로젝트명·회사명 입력 → 댄서 검색 "Deukie" 선택 → 금액·역할 입력 → 제안 보내기
4. 로그아웃 (설정 → 로그아웃) 후 **Deukie**: tommy0621@naver.com / 123123 로그인
5. `/my/proposals` 받은 제안에서 "E2E 테스트 프로젝트" 클릭 → 수락하기
6. `/my/projects` → 해당 프로젝트 → "댄서 초대하기" → 검색 "testdancer" 선택 → 금액 입력 → 제안 보내기
7. 로그아웃 후 **testdancer**: test@dance.com / 123123 로그인 → 받은 제안 수락
8. **Deukie**로 재로그인 → 프로젝트 상세 → 재무 펼쳐서 매출/지출/순이익 확인 → 보관하기 → 보관함에서 보관 해제
9. **클라이언트** 로그인 → 프로젝트 상세 → 공개 설정 → 엠바고 날짜 적용 → (엠바고 해제 후) 공개로 전환

## 계정 (forplaywrighttest.mdc)

| 역할       | 이메일              | 비밀번호 |
|------------|---------------------|----------|
| 클라이언트 | client@client.com   | 123123   |
| Deukie     | tommy0621@naver.com | 123123   |
| testdancer | test@dance.com      | 123123   |
