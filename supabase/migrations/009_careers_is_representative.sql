-- 대표 경력: 각 이력에 대표 여부 설정 가능
ALTER TABLE public.careers
  ADD COLUMN IF NOT EXISTS is_representative boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.careers.is_representative IS '대표 경력 여부. true면 프로필 등에서 대표 경력으로 노출. 사용자/관리자가 설정.';
