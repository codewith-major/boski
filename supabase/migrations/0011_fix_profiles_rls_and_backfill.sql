-- ============================================================================
-- 0011_harden_profile_provisioning.sql
-- ============================================================================

-- 1. Ensure RLS is active on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Prevent direct INSERT by authenticated users to prevent privilege escalation
-- (role='ADMIN', verification_status='VERIFIED'). Profile creation must occur
-- strictly through handle_new_user() or the secure ensure_user_profile() RPC.
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- 3. Hardened SECURITY DEFINER function for on-demand profile provisioning
CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_display_name TEXT DEFAULT NULL)
RETURNS JSONB
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER AS $$
DECLARE
    v_uid UUID := auth.uid();
    v_name TEXT;
    v_profile RECORD;
BEGIN
    -- 1. Must be an authenticated session
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User is not authenticated';
    END IF;

    -- 2. If profile already exists, return it immediately without modifying any fields
    SELECT * INTO v_profile FROM public.profiles WHERE id = v_uid;
    IF FOUND THEN
        RETURN to_jsonb(v_profile);
    END IF;

    -- 3. Determine safe fallback display name
    v_name := COALESCE(
        NULLIF(TRIM(user_display_name), ''),
        (SELECT COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1), 'User') FROM auth.users WHERE id = v_uid),
        'User'
    );

    -- 4. Insert new profile with strictly hardcoded non-privileged defaults:
    -- role = 'STUDENT', verification_status = 'UNVERIFIED', account_status = 'ACTIVE'.
    -- If a concurrent insert occurred, do nothing (do not overwrite existing values).
    INSERT INTO public.profiles (
        id, 
        display_name, 
        role, 
        verification_status, 
        account_status
    )
    VALUES (
        v_uid, 
        v_name, 
        'STUDENT', 
        'UNVERIFIED', 
        'ACTIVE'
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING * INTO v_profile;

    -- 5. If row was inserted concurrently by another request, fetch the existing record
    IF v_profile.id IS NULL THEN
        SELECT * INTO v_profile FROM public.profiles WHERE id = v_uid;
    END IF;

    RETURN to_jsonb(v_profile);
END;
$$;

-- Grant execution to authenticated users
REVOKE EXECUTE ON FUNCTION public.ensure_user_profile(TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile(TEXT) TO authenticated;

-- 4. Backfill profiles from auth.users for any users that signed up without a profile record
INSERT INTO public.profiles (
    id, 
    display_name, 
    role, 
    verification_status, 
    account_status
)
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

-- 5. Re-attach and harden the auth trigger for future signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        display_name, 
        role, 
        verification_status, 
        account_status
    )
    VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'User'), 
        'STUDENT',
        'UNVERIFIED',
        'ACTIVE'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
