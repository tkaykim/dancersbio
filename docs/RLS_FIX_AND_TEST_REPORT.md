# RLS 수정 및 시나리오 테스트 보고

## 1. RLS 수정 (Supabase MCP 적용 완료)

### 원인
- **에러**: `new row violates row-level security policy for table "projects"`
- **발생 위치**: PM(Deukie)이 브리프 프로젝트에서 testdancer를 초대할 때
- **원인**: invite 페이지에서 브리프(isBriefProject)일 때 수신자별로 **프로젝트 복제**를 하며 `projects.insert`를 호출하는데, 복제 행의 `owner_id`는 **원본 오너(클라이언트)**로 설정됨. 로그인한 사용자는 PM이므로 `auth.uid() = owner_id`가 아니어서 기존 "Owner can manage projects" 정책으로는 INSERT 불가.

### 적용한 마이그레이션
- **이름**: `projects_rls_pm_insert_child`
- **내용**: PM이 부모 프로젝트의 오너와 동일한 `owner_id`로 **자식 프로젝트**(`parent_project_id` 설정)를 INSERT할 수 있도록 정책 추가.

```sql
CREATE POLICY "PM can insert child project with parent owner"
ON public.projects FOR INSERT TO authenticated
WITH CHECK (
  parent_project_id IS NOT NULL
  AND owner_id = (SELECT p.owner_id FROM public.projects p WHERE p.id = parent_project_id LIMIT 1)
  AND EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.dancers d ON d.id = p.pm_dancer_id AND (d.owner_id = auth.uid() OR d.manager_id = auth.uid())
    WHERE p.id = parent_project_id
  )
);
```

### 검증
- `pg_policies` 조회로 정책 **"PM can insert child project with parent owner"** 존재 확인 (INSERT, WITH_CHECK 있음).

---

## 2. 시나리오 테스트 요약

### 참고 계정 (.cursor/forplaywrighttest.mdc)
| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 클라이언트 | client@client.com | 123123 |
| Deukie | tommy0621@naver.com | 123123 |
| testdancer | test@dance.com | 123123 |

### 이전 Playwright MCP 테스트에서 확인된 항목
- 클라이언트 로그인 → Deukie에게 제안(새 프로젝트) → **성공**
- Deukie 로그인 → 제안 수락 → **성공**
- 프로젝트 상세: 매출/지출/순이익(재무), 프로젝트 상태, **보관하기 → 보관함 → 보관 해제** → **성공**
- **PM이 testdancer 초대** → 당시 RLS 오류로 **실패** → 위 RLS 수정으로 해결 예상
- testdancer 수락, 정산 페이지, 수락/거절 반복 시나리오 → RLS 수정 후 **재테스트 필요**

### 권한/RLS 검증 체크리스트 (수동 DB 조작 없이)
- **proposals**: 수신자(댄서 오너/매니저)가 `status` 등 UPDATE 가능 (`Receivers can update proposal status`).
- **projects**: 오너가 관리 가능; 제안 수락자(해당 proposal이 이미 `accepted`인 경우)가 PM/확정/진행 상태 UPDATE 가능 (`Accepter can set PM and status on project`).  
  → 수락 플로우에서는 **반드시 proposals를 먼저 `accepted`로 UPDATE한 뒤** projects를 UPDATE해야 RLS 통과.
- **projects INSERT**: PM이 부모 프로젝트의 자식 프로젝트를 복제해 INSERT 가능 (`PM can insert child project with parent owner`, WITH CHECK는 삽입 행의 `parent_project_id`로 부모와 비교).

### 권장 재테스트 시나리오
1. **클라이언트 → Deukie 제안** (새 프로젝트)
2. **Deukie 제안 수락** (받은 제안 상세에서 수락 → 프로젝트 상태/PM 자동 반영 확인)
3. **Deukie → testdancer 초대** (브리프 시 자식 프로젝트 복제)
4. **testdancer 제안 수락**
5. **정산 페이지** (매출/지출/순이익) 확인
6. **프로젝트 상태 변경** (확정/진행 상태)
7. **제안 거절** 시나리오 1회
8. **보관 → 보관함 → 보관 해제** (개인 보관)
9. **엠바고 설정 후 공개** (오너 계정)

---

## 3. 실행 방법

- **자동 테스트**: `npm run dev` 실행 후 `npm run test:e2e` 또는 `npm run test:e2e:headed`
- **수동 테스트**: Playwright MCP 또는 브라우저에서 위 계정으로 로그인 후 위 시나리오 순서대로 진행.

RLS 수정은 이미 Supabase에 반영되어 있으므로, 동일한 invite 플로우를 다시 실행하면 PM의 프로젝트 복제 INSERT가 허용되어야 합니다.

---

## 4. 2사이클 시나리오 테스트 결과 (2026-02-17)

### 시나리오
- **클라이언트** → Deukie(tommy0621@naver.com)에게 **5천만원** 제안
- **Deukie** 수락 후 → testdancer(test@dance.com)를 **100만원**에 섭외 제안
- **testdancer** 수락
- 위 플로우를 **2사이클** 반복 (사이클1 프로젝트, 사이클2 프로젝트)

### 코드/정책 수정 사항 (테스트 및 권한 검증 후 반영)
1. **제안 보내기 버튼**: `app/my/proposals/new/page.tsx`에 `data-testid="submit-proposal"` 추가하여 E2E/Playwright에서 안정적으로 클릭.
2. **RLS 정책 버그 수정**: `projects` 테이블 정책 "PM can insert child project with parent owner"의 WITH CHECK에서, 서브쿼리가 `p.id = p.parent_project_id`로 잘못되어 있어 **삽입 행**의 `parent_project_id`와 비교하도록 수정.  
   - 마이그레이션: `fix_projects_rls_pm_insert_child_with_check`  
   - 수정 후: `p.id = projects.parent_project_id`.
3. **제안 수락 시 프로젝트 업데이트 순서 (RLS 충족)**:  
   - 기존 RLS 정책 "Accepter can set PM and status on project"는 **이미 수신자(댄서)가 제안을 수락한 경우** 프로젝트 UPDATE를 허용함.  
   - 단, **제안(proposals) 업데이트가 프로젝트(projects) 업데이트보다 나중에 실행**되면, 프로젝트 UPDATE 시점에 `proposals.status = 'accepted'`가 아직 반영되지 않아 RLS에 걸림.  
   - **수정**: `ProposalDetailModal`에서 **먼저 proposals를 `accepted`로 업데이트한 뒤**, 이어서 projects의 `pm_dancer_id`, `confirmation_status`, `progress_status`를 업데이트하도록 순서 변경.  
   - 수동 DB 조작 없이, 각 계정(클라이언트 / Deukie / testdancer) 권한과 RLS만으로 전체 플로우 동작.
4. **에러 처리**: 프로젝트 상태 전환 실패 시 사용자에게 알림 표시(콘솔 로그 + alert).

### 사이클1 결과
| 단계 | 결과 |
|------|------|
| 클라이언트 → Deukie 5천만원 제안 전송 | ✅ 성공 |
| Deukie 제안 수락 | ✅ 성공 |
| Deukie → testdancer 100만원 초대 (브리프→자식 프로젝트 복제) | ✅ 성공 (RLS 수정 후) |
| testdancer 제안 수락 | ✅ 성공 |

**계정별 검증**
- **testdancer**: 프로젝트 관리 1건(사이클1), 매출/순익 1,000,000원; 정산 탭에서 순수익 +1,000,000원, 매출 1,000,000, 지출 0, 사이클1 프로젝트 정산 완료 표시 ✅
- **Deukie**: 프로젝트 관리에 사이클1 프로젝트(진행 확정·모집 중), 매출 50,000,000, 순익 50,000,000; 정산 탭에서 사이클1 +50,000,000원 등 표시 ✅
- **클라이언트**: 프로젝트 관리에 사이클1 브리프(진행 확정, 참여 확정 1명) 및 파생 프로젝트 노출; 정산 탭은 오너 기준(댄서 프로필 없음)으로 0원 ✅

### 사이클2 결과
| 단계 | 결과 |
|------|------|
| 클라이언트 → Deukie 5천만원 제안 전송 (사이클2 프로젝트) | ✅ 성공 |
| Deukie 제안 수락 | ✅ 성공 |
| Deukie → testdancer 100만원 초대 | ✅ 성공 |
| testdancer 제안 수락 | ✅ 성공 |

**검증**
- **testdancer**: 진행 중 2건(사이클1, 사이클2), 각 매출 1,000,000원·순익 1,000,000원 ✅

### 결론
- **2사이클** 모두 클라이언트 → Deukie 5천만원 제안 → Deukie 수락 → Deukie → testdancer 100만원 섭외 → testdancer 수락까지 **수동 DB 조작 없이** 정상 동작.
- **프로젝트 관리·비용·정산 탭**은 각 계정(클라이언트, Deukie, testdancer)에서 기대한 대로 동작함.
- **권한/RLS**: 제안 수락 시 프로젝트 상태 반영은 **제안 먼저 업데이트 → 프로젝트 업데이트** 순서로 수행하면, 기존 RLS 정책 "Accepter can set PM and status on project"만으로 수신자(댄서)가 프로젝트를 갱신할 수 있음. 테스트 시 DB 인젝션 없이 사용자 플로우만으로 검증 가능.
