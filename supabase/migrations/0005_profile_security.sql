-- 0005_profile_security.sql
-- Hardens the is_admin function and implements a BEFORE UPDATE trigger
-- to prevent ordinary users from escalating their privileges or bypassing suspensions.

-- 1. Harden the is_admin() function with an explicit search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$;

-- 2. Create the security trigger function
CREATE OR REPLACE FUNCTION public.check_profile_security()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER AS $$
BEGIN
  -- Allow updates if they are performed by the service_role or postgres superuser
  IF current_user IN ('postgres', 'service_role') OR coalesce(auth.role(), '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Allow the change if the user is a legitimate admin
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Otherwise, if any protected fields are changed, reject the update
  IF NEW.role IS DISTINCT FROM OLD.role OR
     NEW.account_status IS DISTINCT FROM OLD.account_status OR
     NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
     
     RAISE EXCEPTION 'Unauthorized: You do not have permission to modify protected profile fields.';
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Apply the trigger to the profiles table
DROP TRIGGER IF EXISTS enforce_profile_security ON public.profiles;
CREATE TRIGGER enforce_profile_security
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_security();
