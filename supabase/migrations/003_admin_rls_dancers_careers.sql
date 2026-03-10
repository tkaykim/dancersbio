-- Admin RLS: allow admin users to manage dancers and careers from /admin
-- public.users.role = 'admin' for auth.uid() → full CRUD on dancers & careers

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Dancers: admin can SELECT, INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS "Admin full access dancers" ON public.dancers;
CREATE POLICY "Admin full access dancers"
  ON public.dancers
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Careers: admin can SELECT, INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS "Admin full access careers" ON public.careers;
CREATE POLICY "Admin full access careers"
  ON public.careers
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
