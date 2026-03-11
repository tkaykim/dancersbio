-- Allow deleting dancers: set FK to CASCADE/SET NULL so admin delete does not fail
-- Run after 003_admin_rls_dancers_careers.sql (RLS already allows admin DELETE)

-- careers.dancer_id → ON DELETE CASCADE (delete careers when dancer is deleted)
DO $$
DECLARE
  cname text;
BEGIN
  SELECT con.conname INTO cname
  FROM pg_constraint con
  WHERE con.conrelid = 'public.careers'::regclass AND con.contype = 'f'
    AND con.confrelid = 'public.dancers'::regclass
  LIMIT 1;
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.careers DROP CONSTRAINT %I', cname);
  END IF;
END $$;
ALTER TABLE public.careers
  ADD CONSTRAINT careers_dancer_id_fkey
  FOREIGN KEY (dancer_id) REFERENCES public.dancers(id) ON DELETE CASCADE;

-- proposals.dancer_id → ON DELETE CASCADE
DO $$
DECLARE
  cname text;
BEGIN
  SELECT con.conname INTO cname
  FROM pg_constraint con
  WHERE con.conrelid = 'public.proposals'::regclass AND con.contype = 'f'
    AND con.confrelid = 'public.dancers'::regclass
  LIMIT 1;
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.proposals DROP CONSTRAINT %I', cname);
  END IF;
END $$;
ALTER TABLE public.proposals
  ADD CONSTRAINT proposals_dancer_id_fkey
  FOREIGN KEY (dancer_id) REFERENCES public.dancers(id) ON DELETE CASCADE;

-- projects.pm_dancer_id → ON DELETE SET NULL (project stays, PM reference cleared)
DO $$
DECLARE
  cname text;
BEGIN
  SELECT con.conname INTO cname
  FROM pg_constraint con
  WHERE con.conrelid = 'public.projects'::regclass AND con.contype = 'f'
    AND con.confrelid = 'public.dancers'::regclass
  LIMIT 1;
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.projects DROP CONSTRAINT %I', cname);
  END IF;
END $$;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_pm_dancer_id_fkey
  FOREIGN KEY (pm_dancer_id) REFERENCES public.dancers(id) ON DELETE SET NULL;
