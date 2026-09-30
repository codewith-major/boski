-- 0008_backfill_and_profile_insert_policy.sql
-- 1. Add INSERT policy on profiles so authenticated users can create their own profile row if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile" ON public.profiles
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2. Backfill profiles from auth.users for any users that signed up without a profile record
INSERT INTO public.profiles (id, display_name, role, verification_status, account_status)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1), 'User') AS display_name,
  'STUDENT' AS role,
  'UNVERIFIED' AS verification_status,
  'ACTIVE' AS account_status
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
