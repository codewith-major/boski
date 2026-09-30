-- Create a function to handle new user signups securely
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role, verification_status, account_status)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), 
    'STUDENT',
    'UNVERIFIED',
    'ACTIVE'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
