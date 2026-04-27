-- Prevent duplicate applications: one proposal per (project, dancer) pair.
-- The /casting Apply flow already pre-checks via SELECT, but a race could insert twice.
-- This unique index turns concurrent duplicates into a 23505 error that the UI handles.
CREATE UNIQUE INDEX IF NOT EXISTS proposals_project_dancer_uk
  ON public.proposals (project_id, dancer_id);

COMMENT ON INDEX public.proposals_project_dancer_uk IS
  'Ensures a single proposal exists per (project, dancer). The casting apply UI relies on 23505 from this constraint to detect duplicate applications under race conditions.';
