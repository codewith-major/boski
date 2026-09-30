-- 0007_payment_security.sql
-- Hardens the order status transition to ensure users cannot skip payment by 
-- directly setting the order status to PAID.

CREATE OR REPLACE FUNCTION protect_order_payment_status()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER AS $$
BEGIN
    -- Allow the service_role (e.g. Edge Functions) or admins to make any changes
    IF current_user IN ('postgres', 'service_role') OR coalesce(auth.role(), '') = 'service_role' OR public.is_admin() THEN
        RETURN NEW;
    END IF;

    -- Prevent normal authenticated users from modifying payment_status
    IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
        RAISE EXCEPTION 'payment_status cannot be modified directly via frontend';
    END IF;

    -- Prevent normal authenticated users from manually setting the order status to PAID
    -- Only the payment webhook (service_role) should be able to transition the order to PAID.
    IF NEW.status = 'PAID' AND OLD.status IS DISTINCT FROM 'PAID' THEN
        RAISE EXCEPTION 'status cannot be manually set to PAID via frontend';
    END IF;

    RETURN NEW;
END;
$$;

-- Replace the existing trigger with our hardened one
DROP TRIGGER IF EXISTS prevent_payment_status_mutation ON public.orders;
CREATE TRIGGER prevent_payment_status_mutation
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION protect_order_payment_status();
