-- teams 테이블
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE,
  leader_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  profile_img text,
  bio text,
  founded_date date,
  location text,
  social_links jsonb,
  portfolio jsonb,
  representative_video text,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- team_members (N:M junction)
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  dancer_id uuid NOT NULL REFERENCES public.dancers(id) ON DELETE CASCADE,
  role text,
  joined_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, dancer_id)
);

-- team_careers (팀 단위 경력)
CREATE TABLE IF NOT EXISTS public.team_careers (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  date text,
  details jsonb,
  is_public boolean NOT NULL DEFAULT false,
  is_representative boolean NOT NULL DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- indexes
CREATE INDEX IF NOT EXISTS idx_teams_slug ON public.teams(slug);
CREATE INDEX IF NOT EXISTS idx_teams_leader_id ON public.teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_dancer_id ON public.team_members(dancer_id);
CREATE INDEX IF NOT EXISTS idx_team_careers_team_id ON public.team_careers(team_id);

COMMENT ON TABLE public.teams IS '댄서 팀/크루';
COMMENT ON TABLE public.team_members IS '팀-댄서 N:M 관계';
COMMENT ON TABLE public.team_careers IS '팀 단위 경력사항';
COMMENT ON COLUMN public.teams.portfolio IS '포트폴리오 미디어 배열 (dancers.portfolio와 동일 구조)';
COMMENT ON COLUMN public.teams.representative_video IS '대표영상 URL (YouTube 등)';
