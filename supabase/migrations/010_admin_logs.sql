-- 등록/수정/삭제 로그: 프로필·커리어 변경 시 관리자 화면에서 기록
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  target_type text NOT NULL CHECK (target_type IN ('profile', 'career')),
  target_id text NOT NULL,
  target_label text,
  details jsonb,
  admin_user_id uuid REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON public.admin_logs(target_type, target_id);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- 관리자만 삽입·조회 가능
CREATE POLICY "Admin insert admin_logs"
  ON public.admin_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin select admin_logs"
  ON public.admin_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- insert 시 현재 사용자 id 자동 설정
CREATE OR REPLACE FUNCTION public.set_admin_log_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.admin_user_id := auth.uid();
  RETURN NEW;
END;
$$;

CREATE TRIGGER admin_logs_set_admin_user_id
  BEFORE INSERT ON public.admin_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_admin_log_user_id();
