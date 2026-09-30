-- 0009_order_activation_payment_gate.sql
-- Enforces that orders cannot transition from ACCEPTED to ACTIVE unless paid.
-- Normal authenticated users cannot bypass payment by setting status = 'ACTIVE' when payment_status != 'PAID'.

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

    -- FIX 1: Prevent transitioning ACCEPTED unpaid orders directly to ACTIVE.
    -- Orders must be paid before they can be marked ACTIVE by participants.
    IF OLD.status = 'ACCEPTED' AND OLD.payment_status IS DISTINCT FROM 'PAID' AND NEW.status = 'ACTIVE' THEN
        RAISE EXCEPTION 'Cannot activate order: order must be paid before activation';
    END IF;

    RETURN NEW;
END;
$$;
