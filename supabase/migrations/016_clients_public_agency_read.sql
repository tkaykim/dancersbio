-- Allow public (unauthenticated) read access for agency-type clients
-- Required for public profile pages that display agency info via joins
CREATE POLICY "Public can read agency clients"
  ON public.clients
  FOR SELECT
  TO public
  USING (type = 'agency');
