-- 0010_free_marketplace_lifecycle.sql
-- Boski Free Marketplace Refactor:
-- 1. Restores the free peer-to-peer marketplace lifecycle (ACCEPTED -> ACTIVE without internal payment processing).
-- 2. Keeps payment_status protected from direct frontend mutations.
-- 3. Prevents normal authenticated users from manually transitioning orders to PAID.
-- 4. Preserves service_role and admin bypass.
-- 5. Does not weaken ownership, RLS, self-order checks, or moderation rules.

CREATE OR REPLACE FUNCTION protect_order_payment_status()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER AS $$
BEGIN
    -- 1. Allow service_role or admin overrides
    IF current_user IN ('postgres', 'service_role') OR coalesce(auth.role(), '') = 'service_role' OR public.is_admin() THEN
        RETURN NEW;
    END IF;

    -- 2. Prevent normal authenticated users from modifying payment_status directly
    IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
        RAISE EXCEPTION 'payment_status cannot be modified directly via frontend';
    END IF;

    -- 3. Prevent normal authenticated users from setting status = 'PAID' (free marketplace lifecycle)
    IF NEW.status = 'PAID' AND OLD.status IS DISTINCT FROM 'PAID' THEN
        RAISE EXCEPTION 'status cannot be manually set to PAID via frontend';
    END IF;

    -- Note: The gate blocking ACCEPTED -> ACTIVE when payment_status != 'PAID' is intentionally REMOVED.
    -- Orders now progress directly from ACCEPTED to ACTIVE when customer/provider initiate exchange.

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_payment_status_mutation ON public.orders;
CREATE TRIGGER prevent_payment_status_mutation
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION protect_order_payment_status();
