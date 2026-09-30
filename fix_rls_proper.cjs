const fs = require('fs');
let content = fs.readFileSync('supabase/migrations/0002_rls_policies.sql', 'utf8');

const regex = /CREATE OR REPLACE FUNCTION protect_payment_status\(\)[\s\S]*?FOR EACH ROW EXECUTE FUNCTION protect_payment_status\(\);/;

const replacement = `CREATE OR REPLACE FUNCTION protect_payment_status()
RETURNS TRIGGER AS $$$$
BEGIN
    -- If the payment status is being changed and the user is an authenticated web user (not the service role)
    IF NEW.payment_status IS DISTINCT FROM OLD.payment_status AND auth.role() = 'authenticated' THEN
        RAISE EXCEPTION 'payment_status cannot be modified directly via frontend';
    END IF;
    RETURN NEW;
END;
$$$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER protect_payment_status_trigger
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION protect_payment_status();`;

content = content.replace(regex, replacement);
fs.writeFileSync('supabase/migrations/0002_rls_policies.sql', content);
