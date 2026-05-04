-- 018_fix_projects_rls_recursion.sql
-- Root cause:
--   public.project_members 의 4개 RLS 정책(pm_select/insert/update/delete)이
--   본문에서 같은 테이블을 EXISTS 서브쿼리로 다시 참조 → 자기참조 RLS.
--   또한 is_project_member / is_project_owner / can_manage_project SECURITY DEFINER
--   함수에 SET row_security = off 가 없어 함수 내부 SELECT 가 동일 정책을 다시
--   거치며 재귀가 발생, /projects 와 /project_members 요청이 500/403 으로 깨짐.
--
-- 수정:
--   1) helper 함수에 SET row_security = off 추가 → 함수 내부 RLS 재진입 차단.
--   2) project_members 4개 정책의 자기참조 EXISTS 제거 → helper 함수 호출로 교체.

-- 1) helper 함수 재정의
CREATE OR REPLACE FUNCTION public.is_project_member(pid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = pid AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_owner(pid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = pid AND user_id = auth.uid() AND role = 'owner'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_project(pid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = pid AND user_id = auth.uid()
      AND role IN ('owner','manager')
  ) OR public.is_admin();
$$;

-- 2) project_members 정책 재작성
DROP POLICY IF EXISTS pm_select ON public.project_members;
DROP POLICY IF EXISTS pm_insert ON public.project_members;
DROP POLICY IF EXISTS pm_update ON public.project_members;
DROP POLICY IF EXISTS pm_delete ON public.project_members;

CREATE POLICY pm_select ON public.project_members
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_project_member(project_id)
    OR public.is_admin()
  );

CREATE POLICY pm_insert ON public.project_members
  FOR INSERT
  WITH CHECK (
    public.is_project_owner(project_id)
    OR public.is_admin()
  );

CREATE POLICY pm_update ON public.project_members
  FOR UPDATE
  USING (
    public.is_project_owner(project_id)
    OR public.is_admin()
  );

CREATE POLICY pm_delete ON public.project_members
  FOR DELETE
  USING (
    public.is_project_owner(project_id)
    OR (user_id = auth.uid() AND role <> 'owner')
    OR public.is_admin()
  );
