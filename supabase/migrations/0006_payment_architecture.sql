-- 0006_payment_architecture.sql
-- Implements the base tables and RLS for secure payment processing

CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    provider TEXT NOT NULL DEFAULT 'PAYSTACK' CHECK (provider = 'PAYSTACK'),
    reference TEXT NOT NULL UNIQUE,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NGN' CHECK (currency = 'NGN'),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'ABANDONED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Fast lookups for webhooks and order history
CREATE INDEX idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_reference ON payment_transactions(reference);

-- Enable Row Level Security
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Read Access: Only the Customer and Provider of the associated order can view the transaction
CREATE POLICY "Order participants can view payment transactions"
    ON payment_transactions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = payment_transactions.order_id 
            AND (orders.customer_id = auth.uid() OR orders.provider_id = auth.uid())
        )
    );

-- NOTE: 
-- There are NO INSERT, UPDATE, or DELETE policies for ordinary authenticated users.
-- Payment transactions are exclusively created and managed by the secure server-side
-- Edge Functions operating with the `service_role` key, preventing any client-side tampering.
