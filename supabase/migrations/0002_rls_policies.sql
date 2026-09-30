-- ============================================================================
-- ROW LEVEL SECURITY (RLS) ENABLEMENT
-- ============================================================================
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Helper to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 1. SCHOOLS POLICIES
-- ============================================================================
-- Schools are public for all authenticated users to read.
CREATE POLICY "Schools are viewable by all users" ON schools
    FOR SELECT TO authenticated
    USING (status = 'ACTIVE');


-- ============================================================================
-- 2. PROFILES POLICIES
-- ============================================================================
-- Profiles are public to view, but users can only update their own.
CREATE POLICY "Profiles are viewable by all users" ON profiles
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- Note: Profile creation (INSERT) will typically be handled by a Supabase 
-- Auth trigger `on auth.users insert` (security definer) to guarantee syncing.


-- ============================================================================
-- 3. LISTINGS POLICIES
-- ============================================================================
-- Active listings are visible to everyone. Owners can see their own inactive listings.
CREATE POLICY "Active listings are viewable by all users" ON listings
    FOR SELECT TO authenticated
    USING (status = 'available' OR status = 'active' OR owner_id = auth.uid());

CREATE POLICY "Users can insert their own listings" ON listings
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own listings" ON listings
    FOR UPDATE TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own listings" ON listings
    FOR DELETE TO authenticated
    USING (auth.uid() = owner_id);


-- ============================================================================
-- 4. ORDERS POLICIES
-- ============================================================================
-- Customers and Providers can view their own orders.
CREATE POLICY "Users can view their participating orders" ON orders
    FOR SELECT TO authenticated
    USING (customer_id = auth.uid() OR provider_id = auth.uid());

-- Customers can create orders (requests).
CREATE POLICY "Customers can create orders" ON orders
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = customer_id);

-- Participants can update order status (e.g., Accept, Decline).
-- IMPORTANT SECURITY: payment_status is protected. Users CANNOT change payment_status directly.
-- Payment status must only be updated by the service_role key (e.g., via backend webhook after Paystack).
CREATE POLICY "Participants can update order states" ON orders
    FOR UPDATE TO authenticated
    USING (customer_id = auth.uid() OR provider_id = auth.uid());

-- Trigger to prevent authenticated users from mutating payment_status
CREATE OR REPLACE FUNCTION protect_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If the payment status is being changed and the user is an authenticated web user (not the service role)
    IF NEW.payment_status IS DISTINCT FROM OLD.payment_status AND auth.role() = 'authenticated' THEN
        RAISE EXCEPTION 'payment_status cannot be modified directly via frontend';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER protect_payment_status_trigger
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION protect_payment_status();


-- ============================================================================
-- 5. RATINGS POLICIES
-- ============================================================================
-- Ratings are public so average scores can be calculated.
CREATE POLICY "Ratings are viewable by everyone" ON ratings
    FOR SELECT TO authenticated
    USING (true);

-- Only a participant of the order can leave a rating, and they must be the 'from_user_id'.
CREATE POLICY "Users can rate their participating completed orders" ON ratings
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = from_user_id AND
        EXISTS (
            SELECT 1 FROM orders 
            WHERE id = order_id 
              AND status IN ('COMPLETED', 'RETURNED')
              AND (customer_id = auth.uid() OR provider_id = auth.uid())
        )
    );


-- ============================================================================
-- 6. REPORTS POLICIES
-- ============================================================================
-- Users can only see reports they submitted. (Admins bypass RLS globally or via role).
CREATE POLICY "Users can view their own reports" ON reports
    FOR SELECT TO authenticated
    USING (reporter_id = auth.uid());

CREATE POLICY "Users can submit reports" ON reports
    FOR INSERT TO authenticated
    WITH CHECK (reporter_id = auth.uid());


-- ============================================================================
-- 7. MESSAGES POLICIES
-- ============================================================================
-- Participants of an order can read the messages for that order.
CREATE POLICY "Participants can view order messages" ON messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = messages.order_id 
            AND (customer_id = auth.uid() OR provider_id = auth.uid())
        )
    );

-- Participants of an order can send messages.
CREATE POLICY "Participants can insert order messages" ON messages
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = messages.order_id 
            AND (customer_id = auth.uid() OR provider_id = auth.uid())
        )
    );


-- ============================================================================
-- 8. ACTIVITIES POLICIES
-- ============================================================================
-- Users can only read their own activity notifications.
CREATE POLICY "Users can view their own activities" ON activities
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Users can mark their own activities as read.
CREATE POLICY "Users can update their own activities" ON activities
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());
