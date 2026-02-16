# 데이터베이스 설계 명세서 (Database Schema Specification) v2.2

## 1. 개요 (Overview)
본 문서는 `dancers.bio` 서비스의 데이터 영속성 계층을 정의합니다. 
**v2.2 변경사항**: 관리자 승인 워크플로우 추가. `users.role` 필드, `profile_requests` 테이블 신규 추가. `dancers.is_verified`를 관리자 승인 게이트로 활용.

---

## 2. ERD 요약 (Entity Relationships)
*   **Users** 1 : 1 **Dancers** (Optional)
*   **Users** 1 : N **Clients** (Optional - 여러 사업자 등록 가능)
*   **Users** 1 : N **Projects** (Project Owner)
*   **Projects** 1 : N **Proposals**
*   **Teams** N : M **Dancers** (via `team_members` - 한 댄서는 여러 팀 소속 가능)
*   **Teams** 1 : 1 **Users** (Team Leader/Owner)

---

## 3. 테이블 상세 명세 (Table Definitions)

### 3.1. `users` (통합 계정)
Supabase Auth와 1:1로 매핑되는 최상위 사용자 테이블입니다.
*   **`active_mode` 삭제**: 모드 구분 없이 통합 뷰를 제공하므로 DB 레벨에서 모드를 저장할 필요가 없습니다. (UI State로 처리)

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | No | `auth.users.id` (PK) |
| `email` | text | No | 고유 이메일 |
| `name` | text | No | 실명 |
| `role` | text | No | `'user'` \| `'admin'` (default: `'user'`) |
| `created_at` | timestamptz | No | 가입일 |

### 3.2. `dancers` (아티스트 프로필)
섭외의 대상이 되는 프로필입니다.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | No | PK |
| **`owner_id`** | uuid | **Yes** | `users.id` (NULL = 미등록 상태) |
| `manager_id` | uuid | Yes | `users.id` (매니저) |
| `stage_name` | text | No | 활동명 (검색 인덱싱) |
| `profile_img` | text | Yes | 대표 이미지 URL |
| **`is_verified`** | boolean | No | **관리자 승인 여부** (default: `false`). `true`여야 공개 검색/리스팅에 노출 |
| **`specialties`** | text[] | Yes | **['choreo', 'broadcast', 'battle']** (주요 활동 영역) |
| **`genres`** | text[] | Yes | **['HipHop', 'Popping', 'Locking', 'Waacking', 'Voguing']** |
| `location` | text | Yes | 주 활동 지역 |
| `social_links` | jsonb | Yes | SNS 링크 `{ instagram?, twitter?, youtube? }` |
| `portfolio` | jsonb | Yes | 포트폴리오 미디어 (사진/영상) 배열 |

### 3.3. `clients` (비즈니스 프로필)
"비즈니스 명의"가 필요한 경우에만 등록합니다. (세금계산서 발행 등)
*   **댄서가 개인 자격으로 제안할 때는 이 테이블이 없어도 됨.**

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | No | PK |
| `owner_id` | uuid | No | `users.id` (소유자) |
| `company_name` | text | Yes | 상호명 |
| `contact_person`| text | No | 담당자명 |

### 3.4. `projects` (업무/일감)
모든 제안은 이 '프로젝트' 단위로 관리됩니다. 프로젝트는 **두 가지 상태 축**을 갖습니다.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | No | PK |
| **`owner_id`** | uuid | No | 생성자 (`users.id`) |
| **`client_profile_id`** | uuid | **Yes** | 비즈니스 프로필 연결 (없으면 개인 자격) |
| `title` | text | No | 프로젝트명 |
| `description` | text | Yes | 프로젝트 설명 |
| `category` | text | Yes | `'choreo'` \| `'broadcast'` \| `'performance'` \| `'workshop'` \| `'judge'` |
| **`confirmation_status`** | text | No | 클라이언트 ↔ 오너 간 확정 상태. `'negotiating'` \| `'confirmed'` \| `'declined'` \| `'cancelled'` \| `'completed'` |
| **`progress_status`** | text | No | 내부 진행 상태. `'idle'` \| `'recruiting'` \| `'in_progress'` \| `'completed'` \| `'cancelled'` |
| `budget` | int | Yes | 총 예산 (원) |
| `start_date` | date | Yes | 시작일 |
| `end_date` | date | Yes | 종료일 |
| `notes` | text | Yes | 진행 메모/계획 |
| `created_at` | timestamptz | No | 생성일 (default: `now()`) |

**상태 흐름:**
*   **축 1 — 확정 상태 (`confirmation_status`)**: 클라이언트와 프로젝트 오너 사이의 관계
    *   `negotiating` → 협상/조율 중
    *   `confirmed` → 진행 확정 (양측 합의)
    *   `declined` → 거절됨
    *   `cancelled` → 취소됨 (확정 후 취소)
    *   `completed` → 완료
*   **축 2 — 진행 상태 (`progress_status`)**: 프로젝트 오너 + 참여 댄서들의 내부 관리
    *   `idle` → 대기 (confirmation이 확정되기 전)
    *   `recruiting` → 모집 중 (confirmation이 `confirmed`일 때만 유효)
    *   `in_progress` → 진행 중
    *   `completed` → 진행 완료
    *   `cancelled` → 취소됨

**규칙:**
*   `confirmation_status`가 `confirmed`가 되어야 `progress_status`를 `recruiting` 이상으로 변경 가능
*   댄서 초대(모집)는 `confirmation_status === 'confirmed'` && `progress_status === 'recruiting'`일 때만 가능
*   직접 프로젝트를 만드는 경우(이미 클라이언트와 확정된 상태): `confirmed` + `recruiting`으로 시작

### 3.5. `proposals` (제안서)
특정 프로젝트(Project)에 댄서(Dancer)를 초대하는 연결 테이블입니다.
*   프로젝트 오너가 댄서를 초대하면, 해당 댄서의 `dancer_id`와 함께 `role`(역할), `fee`(금액)이 기록됩니다.
*   제안 금액은 **발신자에게는 지출, 수신 댄서에게는 매출**로 해석됩니다.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | No | PK |
| `project_id` | uuid | No | FK `projects` |
| `dancer_id` | uuid | No | FK `dancers` (수신자) |
| `sender_id` | uuid | No | FK `users` (발신자 - 추적용) |
| `fee` | int | Yes | 제안 금액 (발신자 지출 / 수신자 매출) |
| `role` | text | Yes | 역할 (예: '안무제작', '메인 댄서', '백업 댄서' 등) |
| `details` | text | Yes | 제안 메시지/설명 |
| **`status`** | text | No | `'pending'` \| `'accepted'` \| `'declined'` \| `'negotiating'` |
| `negotiation_history` | jsonb | Yes | 협상/메시지 이력 배열 |
| `sender_last_read_at` | timestamptz | Yes | 발신자 마지막 읽은 시각 |
| `receiver_last_read_at` | timestamptz | Yes | 수신자 마지막 읽은 시각 |
| `created_at` | timestamptz | No | 생성일 (default: `now()`) |

**역할(role) 가이드:**
*   프로젝트 오너 본인(안무가): `'안무제작'`, `'출연'`, `'공연'`, `'워크샵 강사'`, `'심사위원'` 등 (카테고리 기반 자동 할당)
*   초대된 댄서: `'메인 댄서'`, `'백업 댄서'`, `'공동 안무'`, `'게스트'`, `'디렉터'` 등 (자유 입력 + 빠른 선택)

**경력 연결:**
*   프로젝트 완료 시(`progress_status = 'completed'`), 참여 확정된(`status = 'accepted'`) 모든 댄서의 `careers` 테이블에 자동으로 경력 항목이 생성됩니다.

### 3.6. `careers` (포트폴리오)
JSONB를 활용하여 다양한 활동 유형을 유연하게 저장합니다.
프로젝트 완료 시 자동 생성된 경력은 `details.project_id`로 원본 프로젝트를 추적합니다.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | int8 | No | PK |
| `dancer_id` | uuid | No | FK `dancers` |
| `type` | text | No | 'choreo', 'judge', 'workshop' 등 |
| `title` | text | No | 활동 제목 |
| `details` | jsonb | Yes | 유형별 상세 데이터 |

### 3.7. `teams` (팀/크루)
댄서들이 소속될 수 있는 팀(크루) 정보를 저장합니다.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | No | PK |
| `name` | text | No | 팀 이름 (예: Just Jerk, BEBE, LaChica) |
| `leader_id` | uuid | Yes | `users.id` (팀 리더) |
| `profile_img` | text | Yes | 팀 대표 이미지 |
| `bio` | text | Yes | 팀 소개 |
| `founded_date` | date | Yes | 창단일 |
| `location` | text | Yes | 주 활동 지역 |
| `is_verified` | boolean | No | 공식 인증 여부 (default: false) |
| `created_at` | timestamptz | No | 등록일 |

### 3.8. `team_members` (팀 멤버십 - Junction Table)
팀과 댄서의 다대다(N:M) 관계를 관리하는 연결 테이블입니다.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | No | PK |
| `team_id` | uuid | No | FK `teams` |
| `dancer_id` | uuid | No | FK `dancers` |
| `role` | text | Yes | 팀 내 역할 (예: Leader, Main Dancer, Choreographer) |
| `joined_date` | date | Yes | 팀 합류일 |
| `is_active` | boolean | No | 현재 활동 중 여부 (default: true) |
| `created_at` | timestamptz | No | 등록일 |

**Unique Constraint**: `(team_id, dancer_id)` - 한 댄서가 같은 팀에 중복 등록 불가

### 3.9. `profile_requests` (프로필 권한 요청)
프로필 소유권(claim) 또는 매니저 권한 요청을 관리자가 승인/거절하는 워크플로우입니다.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | No | PK (default: `gen_random_uuid()`) |
| `dancer_id` | uuid | No | FK `dancers` — 대상 프로필 |
| `requester_id` | uuid | No | FK `users` — 요청한 사용자 |
| `type` | text | No | `'claim'` \| `'manager'` |
| `status` | text | No | `'pending'` \| `'approved'` \| `'rejected'` (default: `'pending'`) |
| `note` | text | Yes | 요청자 메모 (사유 등) |
| `reviewed_by` | uuid | Yes | FK `users` — 처리한 관리자 |
| `reviewed_at` | timestamptz | Yes | 처리 시각 |
| `created_at` | timestamptz | No | 요청 시각 (default: `now()`) |

**Unique Constraint**: `(dancer_id, requester_id, type)` WHERE `status = 'pending'` — 동일 요청 중복 방지

**워크플로우:**
1. 사용자가 프로필 생성 → `is_verified = false` (승인 대기) → 관리자가 `is_verified = true`로 설정 시 공개
2. 사용자가 기존 프로필 Claim 요청 → `profile_requests` 레코드 생성 → 관리자 승인 시 `dancers.owner_id` 업데이트
3. 사용자가 매니저 권한 요청 → `profile_requests` 레코드 생성 → 관리자 승인 시 `dancers.manager_id` 업데이트

---

## 4. 설계 의도 및 가이드
1.  **Dancer Categorization**: `specialties`(활동 영역)와 `genres`(춤 장르)를 분리하여 저장합니다.
    *   **Specialties**: 안무제작(Choreo), 방송(Broadcast), 뮤직비디오(MV), 배틀(Battle), 심사(Judge) 등.
    *   **Genres**: 코레오, 힙합, 팝핑, 락킹, 왁킹, 보깅, 크럼프, 브레이킹, 힐댄스 등.
2.  **Team Membership (Many-to-Many)**: 한 댄서는 여러 팀에 동시 소속 가능합니다.
    *   예: J-Ho는 "Just Jerk"와 "Bank Two Brothers"에 모두 소속 가능
    *   `team_members` 테이블의 `is_active` 필드로 과거/현재 소속 구분
3.  **Flexible Sender Identity**: `projects` 테이블의 `client_profile_id`가 NULL이면, 해당 유저는 **"개인 자격(댄서 등)"**으로 프로젝트를 생성한 것입니다.
4.  **Unified User**: `users` 테이블은 인증과 식별만을 담당하고, 실제 댄서로서의 역할(`dancers`)과 비즈니스로서의 역할(`clients`)은 별도 테이블로 관리됩니다.

이 문서는 백엔드 DB 스키마 구축의 절대적 기준이 됩니다.
