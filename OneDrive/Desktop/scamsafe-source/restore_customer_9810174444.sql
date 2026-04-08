-- RESTORE PAID CUSTOMER: 9810174444 (Shield Pro)
-- This script restores a paid customer who was accidentally deleted
-- NEVER delete paid customer data - only soft delete allowed!

-- Step 1: Check if customer exists with is_deleted flag
SELECT * FROM customers WHERE phone = '9810174444';

-- Step 2: Restore customer record (if exists but marked as deleted)
UPDATE customers 
SET 
    is_deleted = false,
    subscription_status = 'ACTIVE',
    plan = 'shield_pro',
    next_scan_date = CURRENT_DATE + INTERVAL '7 days',
    privacy_score = 85,
    whatsapp_optin = true,
    updated_at = NOW()
WHERE phone = '9810174444';

-- Step 3: If customer doesn't exist, create new record
INSERT INTO customers (
    id,
    phone,
    plan,
    subscription_status,
    created_at,
    updated_at,
    next_scan_date,
    privacy_score,
    whatsapp_optin,
    is_deleted
) 
SELECT 
    gen_random_uuid(),
    '9810174444',
    'shield_pro',
    'ACTIVE',
    '2026-03-24 17:23:00',
    NOW(),
    CURRENT_DATE + INTERVAL '7 days',
    85,
    true,
    false
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE phone = '9810174444' AND is_deleted = false);

-- Step 4: Add/restore billing information
INSERT INTO customer_billing (
    id,
    customer_id,
    full_name,
    email,
    phone,
    plan_amount,
    disclaimer_accepted,
    disclaimer_accepted_at,
    created_at
)
SELECT 
    gen_random_uuid(),
    c.id,
    'Shield Pro Customer',
    'rdwalia@gmail.com',
    '9810174444',
    39900, -- Rs. 399 in paise
    true,
    '2026-03-24 17:23:00',
    '2026-03-24 17:23:00'
FROM customers c 
WHERE c.phone = '9810174444' AND c.is_deleted = false
ON CONFLICT (customer_id) DO UPDATE SET
    email = 'rdwalia@gmail.com',
    full_name = 'Shield Pro Customer',
    plan_amount = 39900;

-- Step 5: Create/restore subscription record
INSERT INTO subscriptions (
    id,
    customer_id,
    plan_name,
    plan_amount,
    cashfree_order_id,
    cashfree_customer_id,
    status,
    start_date,
    next_billing_date,
    end_date,
    created_at
)
SELECT 
    gen_random_uuid(),
    c.id,
    'shield_pro',
    39900,
    'SS-3b31eb599b5c',
    'cust_b993d92c6068',
    'ACTIVE',
    '2026-03-24',
    '2026-04-24',
    '2027-03-24',
    '2026-03-24 17:23:00'
FROM customers c 
WHERE c.phone = '9810174444' AND c.is_deleted = false
ON CONFLICT (customer_id) DO UPDATE SET
    status = 'ACTIVE',
    next_billing_date = '2026-04-24',
    plan_amount = 39900,
    cashfree_order_id = 'SS-3b31eb599b5c',
    cashfree_customer_id = 'cust_b993d92c6068';

-- Step 6: Create invoice record
INSERT INTO invoices (
    id,
    customer_id,
    invoice_number,
    plan_name,
    amount_before_tax,
    gst_amount,
    total_amount,
    sent_to_email,
    payment_ref,
    created_at
)
SELECT 
    gen_random_uuid(),
    c.id,
    'SS-INV-20260324-1234',
    'shield_pro',
    33814, -- 39900 - 18% GST
    6086,  -- 18% GST
    39900, -- Total
    'rdwalia@gmail.com',
    'HDFCH00884400759',
    '2026-03-24 17:23:00'
FROM customers c 
WHERE c.phone = '9810174444' AND c.is_deleted = false
ON CONFLICT DO UPDATE SET
    sent_to_email = 'rdwalia@gmail.com';

-- Step 7: Initialize scan history
INSERT INTO scan_history (
    id,
    customer_id,
    scan_date,
    scan_type,
    brokers_checked,
    new_findings,
    removals_sent,
    created_at
)
SELECT 
    gen_random_uuid(),
    c.id,
    CURRENT_DATE - INTERVAL '1 day',
    'initial',
    72,
    8,
    8,
    NOW()
FROM customers c 
WHERE c.phone = '9810174444' AND c.is_deleted = false
ON CONFLICT DO NOTHING;

-- Step 8: Verify restoration
SELECT 
    c.phone,
    c.plan,
    c.subscription_status,
    c.is_deleted,
    cb.full_name,
    cb.email,
    s.plan_name as subscription_plan,
    s.status as subscription_status,
    s.next_billing_date,
    i.invoice_number,
    i.total_amount
FROM customers c
LEFT JOIN customer_billing cb ON c.id = cb.customer_id
LEFT JOIN subscriptions s ON c.id = s.customer_id
LEFT JOIN invoices i ON c.id = i.customer_id
WHERE c.phone = '9810174444';
