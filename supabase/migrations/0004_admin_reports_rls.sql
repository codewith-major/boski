-- Admin RLS Policies for Moderation & Reports

-- 1. Admins can view all reports
CREATE POLICY "Admins can view all reports" ON reports
    FOR SELECT TO authenticated
    USING (is_admin());

-- 2. Admins can update reports
CREATE POLICY "Admins can update reports" ON reports
    FOR UPDATE TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- 3. Admins can update profiles (for suspension)
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- 4. Admins can update listings (for deactivation)
CREATE POLICY "Admins can update all listings" ON listings
    FOR UPDATE TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());
