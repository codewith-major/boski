-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 1. SCHOOLS
-- ============================================================================
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE TRIGGER update_schools_updated_at
    BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. PROFILES
-- ============================================================================
-- References auth.users(id) from Supabase Auth
CREATE TABLE profiles (
    id UUID PRIMARY KEY, -- Will correspond to auth.users.id
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'ADMIN')),
    verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('VERIFIED', 'PENDING', 'UNVERIFIED')),
    account_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'SUSPENDED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. LISTINGS (Maps to Resource)
-- ============================================================================
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    intent TEXT NOT NULL CHECK (intent IN ('HAVE', 'NEED')),
    type TEXT NOT NULL CHECK (type IN ('ITEM', 'SKILL', 'HELP')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    price NUMERIC(10, 2),
    currency TEXT NOT NULL DEFAULT 'NGN' CHECK (currency = 'NGN'),
    pricing_unit TEXT CHECK (pricing_unit IN ('day', 'session', 'project', 'hour', 'event', 'fixed')),
    budget NUMERIC(10, 2),
    availability TEXT,
    location TEXT,
    condition TEXT,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'unavailable', 'active')),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    
    -- HAVE listings must have a price. NEED listings can be open-ended (budget is optional).
    CONSTRAINT check_have_price CHECK (
        (intent = 'HAVE' AND price IS NOT NULL) OR 
        (intent = 'NEED')
    )
);

CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. ORDERS
-- ============================================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    price NUMERIC(10, 2) NOT NULL, -- Agreed price locked in at order creation
    currency TEXT NOT NULL DEFAULT 'NGN' CHECK (currency = 'NGN'),
    pricing_unit TEXT CHECK (pricing_unit IN ('day', 'session', 'project', 'hour', 'event', 'fixed')),
    status TEXT NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'ACCEPTED', 'PAID', 'ACTIVE', 'RETURNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DECLINED')),
    payment_status TEXT NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PAID', 'REFUNDED')),
    start_date TEXT,
    end_date TEXT,
    timing TEXT,
    message TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    
    -- Prevent users from creating an order with themselves
    CONSTRAINT check_not_self_order CHECK (customer_id != provider_id)
);

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. RATINGS
-- ============================================================================
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    
    -- Users cannot rate themselves
    CONSTRAINT check_rating_direction CHECK (from_user_id != to_user_id),
    -- Only one rating per user per order (i.e. Customer rates Provider once, Provider rates Customer once)
    CONSTRAINT unique_rating_per_order_user UNIQUE (order_id, from_user_id, to_user_id)
);

-- ============================================================================
-- 6. REPORTS
-- ============================================================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('USER', 'RESOURCE', 'ORDER')), -- RESOURCE maps to Listing
    target_id UUID NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('INAPPROPRIATE', 'MISLEADING', 'NO_SHOW', 'SAFETY_CONCERN', 'OTHER')),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED')),
    admin_note TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. MESSAGES
-- ============================================================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 8. ACTIVITIES
-- ============================================================================
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    rating_id UUID REFERENCES ratings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_listings_owner_id ON listings(owner_id);
CREATE INDEX idx_listings_intent ON listings(intent);
CREATE INDEX idx_listings_type ON listings(type);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_category ON listings(category);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_provider_id ON orders(provider_id);
CREATE INDEX idx_orders_listing_id ON orders(listing_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

CREATE INDEX idx_ratings_order_id ON ratings(order_id);
CREATE INDEX idx_ratings_to_user_id ON ratings(to_user_id);

CREATE INDEX idx_messages_order_id ON messages(order_id);

CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_read_at ON activities(read_at);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
