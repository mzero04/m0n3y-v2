/*
# Avatar Storage Bucket

Membuat storage bucket "avatars" (public) untuk menyimpan foto profil user.
Policies: public read, authenticated upload/update/delete own files.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Avatar read access" ON storage.objects;
CREATE POLICY "Avatar read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar upload authenticated" ON storage.objects;
CREATE POLICY "Avatar upload authenticated"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar update own" ON storage.objects;
CREATE POLICY "Avatar update own"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND owner_id = auth.uid()::text)
WITH CHECK (bucket_id = 'avatars' AND owner_id = auth.uid()::text);

DROP POLICY IF EXISTS "Avatar delete own" ON storage.objects;
CREATE POLICY "Avatar delete own"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND owner_id = auth.uid()::text);
