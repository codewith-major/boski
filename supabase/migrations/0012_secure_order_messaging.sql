-- Migration 0012: Secure Order-Scoped Messaging
-- Phase 15.5 - Privacy-first, order-scoped, immutable messaging with lifecycle enforcement

-- 1. Ensure performance indexes exist for order scoping, sender filtering, and chronological sorting
CREATE INDEX IF NOT EXISTS idx_messages_order_id ON public.messages(order_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- 2. Add message content constraint: non-empty, non-whitespace-only, maximum 10,000 characters
ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_body_check;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_body_check
  CHECK (char_length(trim(body)) > 0 AND char_length(body) <= 10000);

-- 3. Safely drop legacy or overly permissive RLS policies on messages
DROP POLICY IF EXISTS "Users can view messages for their orders" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages for their orders" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages in their orders" ON public.messages;
DROP POLICY IF EXISTS "Users can delete messages in their orders" ON public.messages;
DROP POLICY IF EXISTS "order_participants_select_messages" ON public.messages;
DROP POLICY IF EXISTS "order_participants_insert_messages" ON public.messages;
DROP POLICY IF EXISTS "recipient_update_read_at_only" ON public.messages;

-- Ensure RLS is active on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. SELECT Policy:
-- Authenticated users may SELECT a message ONLY if they are the customer or provider of that message's order
CREATE POLICY "order_participants_select_messages"
ON public.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = messages.order_id
      AND (o.customer_id = auth.uid() OR o.provider_id = auth.uid())
  )
);

-- 5. INSERT Policy:
-- A user may INSERT a message ONLY when:
-- a) auth.uid() = sender_id (no spoofing)
-- b) auth.uid() is customer or provider of that order
-- c) order.status is in an active communication state ('REQUESTED', 'ACCEPTED', 'ACTIVE')
-- Messages CANNOT be created for 'DECLINED', 'CANCELLED', or 'COMPLETED' orders
CREATE POLICY "order_participants_insert_messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = messages.order_id
      AND (o.customer_id = auth.uid() OR o.provider_id = auth.uid())
      AND o.status IN ('REQUESTED', 'ACCEPTED', 'ACTIVE')
  )
);

-- 6. UPDATE Policy:
-- Messages are immutable in content.
-- Only the RECIPIENT (auth.uid() != sender_id) may update the message to record read_at.
-- The user must be a participant in that order.
CREATE POLICY "recipient_update_read_at_only"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  auth.uid() != sender_id
  AND EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = messages.order_id
      AND (o.customer_id = auth.uid() OR o.provider_id = auth.uid())
  )
)
WITH CHECK (
  auth.uid() != sender_id
  AND EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = messages.order_id
      AND (o.customer_id = auth.uid() OR o.provider_id = auth.uid())
  )
);

-- 7. Trigger to guarantee database-level immutability of message content & metadata
-- Even if an UPDATE statement is executed, body, sender_id, order_id, and created_at cannot be tampered with.
CREATE OR REPLACE FUNCTION public.enforce_message_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Strict column-level immutability enforcement
  IF NEW.id <> OLD.id THEN
    RAISE EXCEPTION 'Message ID cannot be changed.';
  END IF;

  IF NEW.order_id <> OLD.order_id THEN
    RAISE EXCEPTION 'Message order association cannot be changed.';
  END IF;

  IF NEW.sender_id <> OLD.sender_id THEN
    RAISE EXCEPTION 'Message sender cannot be changed.';
  END IF;

  IF NEW.body <> OLD.body THEN
    RAISE EXCEPTION 'Message body is immutable and cannot be modified.';
  END IF;

  IF NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Message created_at timestamp cannot be changed.';
  END IF;

  -- Guard read_at updates: Only the recipient may set read_at, and sender cannot mark own message read
  IF auth.uid() IS NOT NULL AND auth.uid() = OLD.sender_id AND NEW.read_at IS DISTINCT FROM OLD.read_at THEN
    RAISE EXCEPTION 'Senders cannot update read status on their own messages.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_enforce_message_immutability ON public.messages;
CREATE TRIGGER tr_enforce_message_immutability
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.enforce_message_immutability();

-- 8. DELETE:
-- No DELETE policy is granted to authenticated users.
-- Messages are immutable audit records and cannot be deleted by either participant.
