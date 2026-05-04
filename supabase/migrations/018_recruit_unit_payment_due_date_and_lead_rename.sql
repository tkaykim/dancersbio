-- ============================================================
-- 018: recruit_unit, payment_due_date 컬럼 추가 + pm_dancer_id → lead_dancer_id 리네임
--
-- 배경:
--   - 프로젝트별 모집 단위(개인/팀/둘다) 옵션 도입
--   - 정산 지급 예정일을 프로젝트 마감(due_date)과 분리
--   - "PM"이라는 워딩이 project_members.manager와 혼선되어, 정산 lead 역할로 의미 명확화
--   - 운영 권한(승인/거절/멤버관리)은 project_members(owner/manager)로 일원화. RLS는 이미
--     can_manage_project() helper로 처리되고 있어 정책 변경 불필요.
-- ============================================================

-- 1) recruit_unit 컬럼 (개인/팀/둘다)
alter table public.projects
  add column if not exists recruit_unit text not null default 'individual';

do $$ begin
  if not exists (
    select 1 from information_schema.constraint_column_usage
    where table_schema='public' and table_name='projects' and constraint_name='projects_recruit_unit_check'
  ) then
    alter table public.projects
      add constraint projects_recruit_unit_check
      check (recruit_unit in ('individual','team','both'));
  end if;
end $$;

comment on column public.projects.recruit_unit is
  'individual(개인만) | team(팀만) | both(개인/팀 모두). 지원 폼에서 검증.';

-- 2) payment_due_date (정산 지급 예정일)
alter table public.projects
  add column if not exists payment_due_date date;

comment on column public.projects.payment_due_date is
  '정산 지급 예정일. lead 댄서·참여 댄서들에게 지급될 시점. due_date(프로젝트 마감)와 별개.';

-- 3) pm_dancer_id → lead_dancer_id 리네임
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='projects' and column_name='pm_dancer_id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='projects' and column_name='lead_dancer_id'
  ) then
    alter table public.projects rename column pm_dancer_id to lead_dancer_id;
  end if;
end $$;

do $$ begin
  if exists (
    select 1 from pg_constraint
    where conrelid='public.projects'::regclass and conname='projects_pm_dancer_id_fkey'
  ) then
    alter table public.projects rename constraint projects_pm_dancer_id_fkey to projects_lead_dancer_id_fkey;
  end if;
end $$;

comment on column public.projects.lead_dancer_id is
  '정산 lead 댄서. contract_amount의 직접 수령자이자 밑 댄서들 지급 주체. 운영 권한(승인/거절/멤버관리)은 project_members.role(owner/manager)로 분리됨.';
