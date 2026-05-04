-- ============================================================
-- 019: proposal_settlements 테이블 + 자동 동기화 + RLS
--
-- 정산은 돈 문제와 직결되어 별도 테이블로 audit trail 확보.
-- 플랫폼이 escrow 역할(클라→플랫폼→댄서)을 하므로 댄서 지급 단위로 1 proposal = 1 settlement.
-- ============================================================

-- 1) 테이블
create table if not exists public.proposal_settlements (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null unique references public.proposals(id) on delete cascade,
  amount integer not null check (amount >= 0),
  status text not null default 'scheduled'
    check (status in ('scheduled','in_progress','paid','on_hold','cancelled')),
  scheduled_due_date date,
  paid_at timestamptz,
  paid_by uuid references public.users(id),
  reference_no text,
  payer_note text,
  payee_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.proposal_settlements is
  '정산 레코드. 1 proposal(수락된 캐스팅) = 1 settlement. 플랫폼이 댄서에게 지급하는 단위.';
comment on column public.proposal_settlements.status is
  'scheduled(예정) | in_progress(처리중) | paid(지급완료) | on_hold(보류) | cancelled(취소)';
comment on column public.proposal_settlements.amount is
  '정산 금액. proposal accepted 시점에 proposal.fee를 복사. 이후 fee 변경에는 자동 동기화하지 않음.';

create index if not exists proposal_settlements_status_idx on public.proposal_settlements (status);
create index if not exists proposal_settlements_due_idx on public.proposal_settlements (scheduled_due_date);

-- updated_at 자동 갱신
create or replace function public.tg_proposal_settlements_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_proposal_settlements_updated_at on public.proposal_settlements;
create trigger trg_proposal_settlements_updated_at
  before update on public.proposal_settlements
  for each row execute function public.tg_proposal_settlements_set_updated_at();

-- 2) proposals.status 변경 시 settlement 자동 동기화
create or replace function public.tg_sync_proposal_settlement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_due date;
begin
  if new.status = 'accepted' and (old.status is distinct from 'accepted') then
    select payment_due_date into v_due from public.projects where id = new.project_id;
    insert into public.proposal_settlements (proposal_id, amount, scheduled_due_date, status)
    values (new.id, coalesce(new.fee, 0), v_due, 'scheduled')
    on conflict (proposal_id) do update
      set status = case
            when public.proposal_settlements.status = 'paid' then 'paid'
            else 'scheduled'
          end,
          amount = excluded.amount,
          scheduled_due_date = coalesce(excluded.scheduled_due_date, public.proposal_settlements.scheduled_due_date),
          updated_at = now();
  end if;

  if new.status in ('declined','cancelled') and (old.status is distinct from new.status) then
    update public.proposal_settlements
       set status = 'cancelled', updated_at = now()
     where proposal_id = new.id and status <> 'paid';
  end if;

  return new;
end $$;

drop trigger if exists trg_sync_proposal_settlement on public.proposals;
create trigger trg_sync_proposal_settlement
  after update of status on public.proposals
  for each row execute function public.tg_sync_proposal_settlement();

-- 3) 기존 accepted proposals backfill
insert into public.proposal_settlements (proposal_id, amount, scheduled_due_date, status)
select p.id, coalesce(p.fee, 0), pr.payment_due_date, 'scheduled'
from public.proposals p
left join public.projects pr on pr.id = p.project_id
where p.status = 'accepted'
  and not exists (select 1 from public.proposal_settlements s where s.proposal_id = p.id);

-- 4) RLS
alter table public.proposal_settlements enable row level security;

drop policy if exists proposal_settlements_select on public.proposal_settlements;
create policy proposal_settlements_select on public.proposal_settlements
  for select
  using (
    exists (
      select 1
      from public.proposals p
      join public.dancers d on d.id = p.dancer_id
      where p.id = proposal_settlements.proposal_id
        and (
          p.sender_id = auth.uid()
          or d.owner_id = auth.uid()
          or d.manager_id = auth.uid()
          or public.can_manage_project(p.project_id)
        )
    )
    or public.is_admin()
  );

drop policy if exists proposal_settlements_insert_admin on public.proposal_settlements;
create policy proposal_settlements_insert_admin on public.proposal_settlements
  for insert with check (public.is_admin());

drop policy if exists proposal_settlements_update_admin on public.proposal_settlements;
create policy proposal_settlements_update_admin on public.proposal_settlements
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists proposal_settlements_no_delete on public.proposal_settlements;
create policy proposal_settlements_no_delete on public.proposal_settlements
  for delete using (false);
