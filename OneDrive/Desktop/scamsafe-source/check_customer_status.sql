-- Check current status of customer 9810174444
-- Run this to see if customer exists and what their status is

-- 1. Check if customer exists at all
SELECT 
    'CUSTOMER_EXISTS' as check_type,
    COUNT(*) as count,
    phone,
    is_deleted,
    subscription_status,
    plan,
    created_at
FROM customers 
WHERE phone = '9810174444'
GROUP BY phone, is_deleted, subscription_status, plan, created_at;

-- 2. Check billing information
SELECT 
    'BILLING_INFO' as check_type,
    COUNT(*) as count,
    cb.full_name,
    cb.email,
    cb.phone,
    cb.plan_amount,
    cb.created_at
FROM customer_billing cb
JOIN customers c ON cb.customer_id = c.id
WHERE c.phone = '9810174444'
GROUP BY cb.full_name, cb.email, cb.phone, cb.plan_amount, cb.created_at;

-- 3. Check subscription status
SELECT 
    'SUBSCRIPTION' as check_type,
    COUNT(*) as count,
    s.plan_name,
    s.status,
    s.plan_amount,
    s.start_date,
    s.next_billing_date,
    s.cashfree_order_id,
    s.cashfree_customer_id
FROM subscriptions s
JOIN customers c ON s.customer_id = c.id
WHERE c.phone = '9810174444'
GROUP BY s.plan_name, s.status, s.plan_amount, s.start_date, s.next_billing_date, s.cashfree_order_id, s.cashfree_customer_id;

-- 4. Check invoice
SELECT 
    'INVOICE' as check_type,
    COUNT(*) as count,
    i.invoice_number,
    i.plan_name,
    i.total_amount,
    i.sent_to_email,
    i.payment_ref,
    i.created_at
FROM invoices i
JOIN customers c ON i.customer_id = c.id
WHERE c.phone = '9810174444'
GROUP BY i.invoice_number, i.plan_name, i.total_amount, i.sent_to_email, i.payment_ref, i.created_at;

-- 5. Check scan history
SELECT 
    'SCAN_HISTORY' as check_type,
    COUNT(*) as count,
    sh.scan_date,
    sh.scan_type,
    sh.brokers_checked,
    sh.new_findings,
    sh.removals_sent
FROM scan_history sh
JOIN customers c ON sh.customer_id = c.id
WHERE c.phone = '9810174444'
GROUP BY sh.scan_date, sh.scan_type, sh.brokers_checked, sh.new_findings, sh.removals_sent;

-- 6. Check if customer appears in admin queries (what admin dashboard sees)
SELECT 
    'ADMIN_DASHBOARD_VIEW' as check_type,
    COUNT(*) as count,
    c.phone,
    c.plan,
    c.subscription_status,
    c.is_deleted,
    cb.full_name,
    cb.email,
    s.plan_name as active_subscription,
    s.status as subscription_status,
    i.invoice_number,
    i.total_amount
FROM customers c
LEFT JOIN customer_billing cb ON c.id = cb.customer_id
LEFT JOIN subscriptions s ON c.id = s.customer_id AND s.status = 'ACTIVE'
LEFT JOIN invoices i ON c.id = i.customer_id
WHERE c.phone = '9810174444'
GROUP BY c.phone, c.plan, c.subscription_status, c.is_deleted, cb.full_name, cb.email, s.plan_name, s.status, i.invoice_number, i.total_amount;
