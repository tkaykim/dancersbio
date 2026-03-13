ALTER TABLE public.dancers ADD COLUMN agency_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
COMMENT ON COLUMN public.dancers.agency_id IS '소속사(클라이언트) ID. NULL이면 소속사 없음';
