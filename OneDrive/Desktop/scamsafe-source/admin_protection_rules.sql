-- ADMIN PROTECTION RULES FOR PAID CUSTOMERS
-- This adds database constraints to prevent accidental deletion of paid customers

-- Step 1: Create a function to check if customer has active payments
CREATE OR REPLACE FUNCTION has_active_payments(customer_phone VARCHAR) 
RETURNS BOOLEAN AS $$
DECLARE
    payment_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO payment_count
    FROM invoices i
    JOIN customers c ON i.customer_id = c.id
    WHERE c.phone = customer_phone 
    AND i.total_amount > 0 
    AND i.created_at >= NOW() - INTERVAL '1 year';
    
    RETURN payment_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Add constraint to prevent deletion of customers with active payments
ALTER TABLE customers ADD CONSTRAINT prevent_paid_customer_deletion 
CHECK (
    is_deleted = false OR 
    NOT has_active_payments(phone)
);

-- Step 3: Create trigger to log any deletion attempts
CREATE OR REPLACE FUNCTION log_deletion_attempt()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_deleted = false AND NEW.is_deleted = true THEN
        INSERT INTO admin_audit_log (
            action, table_name, record_id, old_values, new_values, admin_user, timestamp
        ) VALUES (
            'DELETE_ATTEMPT', 
            'customers', 
            OLD.id,
            json_build_object('phone', OLD.phone, 'plan', OLD.plan, 'subscription_status', OLD.subscription_status),
            json_build_object('is_deleted', NEW.is_deleted),
            current_user,
            NOW()
        );
        
        -- Check if customer has payments and block deletion
        IF has_active_payments(OLD.phone) THEN
            RAISE EXCEPTION 'Cannot delete customer with active payments: %', OLD.phone;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    admin_user VARCHAR(100),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create the trigger
DROP TRIGGER IF EXISTS customer_deletion_protection ON customers;
CREATE TRIGGER customer_deletion_protection
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION log_deletion_attempt();

-- Step 6: Add comment for future admins
COMMENT ON CONSTRAINT prevent_paid_customer_deletion ON customers IS 
'Prevents deletion of customers who have made payments in the last year. This protects paid customer data from accidental removal.';

-- Step 7: Create view for paid customers
CREATE OR REPLACE VIEW paid_customers AS
SELECT 
    c.id,
    c.phone,
    c.plan,
    c.subscription_status,
    c.created_at,
    i.invoice_number,
    i.total_amount,
    i.created_at as payment_date
FROM customers c
JOIN invoices i ON c.id = i.customer_id
WHERE c.is_deleted = false 
AND i.total_amount > 0 
AND i.created_at >= NOW() - INTERVAL '1 year'
ORDER BY i.created_at DESC;

-- Step 8: Grant permissions to admin role
GRANT SELECT ON paid_customers TO admin;
GRANT SELECT ON admin_audit_log TO admin;

-- Step 9: Create admin protection summary
CREATE OR REPLACE VIEW admin_protection_summary AS
SELECT 
    'Paid Customer Protection' as protection_type,
    COUNT(*) as total_protected_customers,
    'Cannot be deleted - has active payments' as description
FROM paid_customers;

-- Test the protection by attempting to delete our restored customer
-- This should fail and log the attempt
-- UPDATE customers SET is_deleted = true WHERE phone = '9810174444';
