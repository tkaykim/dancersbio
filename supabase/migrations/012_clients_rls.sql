-- RLS policies for clients table
-- is_admin() function already exists from 003_admin_rls_dancers_careers.sql

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Owner can read own clients
DROP POLICY IF EXISTS "Owner can read own clients" ON public.clients;
CREATE POLICY "Owner can read own clients"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- Authenticated users can create clients
DROP POLICY IF EXISTS "Authenticated users can create clients" ON public.clients;
CREATE POLICY "Authenticated users can create clients"
  ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Owner can update own clients
DROP POLICY IF EXISTS "Owner can update own clients" ON public.clients;
CREATE POLICY "Owner can update own clients"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Owner can delete own clients
DROP POLICY IF EXISTS "Owner can delete own clients" ON public.clients;
CREATE POLICY "Owner can delete own clients"
  ON public.clients
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Admin full access
DROP POLICY IF EXISTS "Admin full access clients" ON public.clients;
CREATE POLICY "Admin full access clients"
  ON public.clients
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Anyone can read clients for agency selector (public listing)
DROP POLICY IF EXISTS "Anyone can read agency clients" ON public.clients;
CREATE POLICY "Anyone can read agency clients"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (type = 'agency');
