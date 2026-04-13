-- dancer_agencies: 댄서-소속사 N:M 관계
CREATE TABLE IF NOT EXISTS public.dancer_agencies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  dancer_id uuid NOT NULL REFERENCES public.dancers(id) ON DELETE CASCADE,
  agency_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  role text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dancer_id, agency_id)
);

CREATE INDEX IF NOT EXISTS idx_dancer_agencies_dancer_id ON public.dancer_agencies(dancer_id);
CREATE INDEX IF NOT EXISTS idx_dancer_agencies_agency_id ON public.dancer_agencies(agency_id);

-- 기존 dancers.agency_id 데이터를 junction 테이블로 마이그레이션
INSERT INTO public.dancer_agencies (dancer_id, agency_id, is_primary)
SELECT id, agency_id, true
FROM public.dancers
WHERE agency_id IS NOT NULL
ON CONFLICT (dancer_id, agency_id) DO NOTHING;

COMMENT ON TABLE public.dancer_agencies IS '댄서-소속사(에이전시) N:M 관계';
COMMENT ON COLUMN public.dancer_agencies.is_primary IS '주 소속사 여부';
COMMENT ON COLUMN public.dancer_agencies.role IS '소속 역할 (선택)';
