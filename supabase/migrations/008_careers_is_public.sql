-- 경력(careers) 공개 여부: 사용자/관리자가 설정. 기본값 비공개.
ALTER TABLE public.careers
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.careers.is_public IS 'true면 공개 프로필에 노출. 기본값 false(비공개).';
