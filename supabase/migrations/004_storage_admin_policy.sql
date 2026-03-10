-- Storage: allow admin to upload/update/delete in profile-photos and portfolio-media
-- (Admin edits dancers and needs to attach photos; path is dancerId/... not auth.uid())
-- Requires 003_admin_rls_dancers_careers.sql (public.is_admin()) to be applied first.

-- Admin can INSERT (upload) to profile-photos and portfolio-media
DROP POLICY IF EXISTS "Admin storage insert profile and portfolio" ON storage.objects;
CREATE POLICY "Admin storage insert profile and portfolio"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('profile-photos', 'portfolio-media') AND public.is_admin()
  );

-- Admin can UPDATE (overwrite) in these buckets
DROP POLICY IF EXISTS "Admin storage update profile and portfolio" ON storage.objects;
CREATE POLICY "Admin storage update profile and portfolio"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('profile-photos', 'portfolio-media') AND public.is_admin())
  WITH CHECK (bucket_id IN ('profile-photos', 'portfolio-media') AND public.is_admin());

-- Admin can DELETE in these buckets
DROP POLICY IF EXISTS "Admin storage delete profile and portfolio" ON storage.objects;
CREATE POLICY "Admin storage delete profile and portfolio"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('profile-photos', 'portfolio-media') AND public.is_admin());

-- Admin can SELECT (read) from these buckets
DROP POLICY IF EXISTS "Admin storage select profile and portfolio" ON storage.objects;
CREATE POLICY "Admin storage select profile and portfolio"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('profile-photos', 'portfolio-media') AND public.is_admin());
