# Customer Restoration Deployment Guide

## Customer 9810174444 - Shield Pro Restoration

### Customer Details
- **Phone**: 9810174444
- **Email**: rdwalia@gmail.com
- **Plan**: Shield Pro (Rs. 399/month)
- **Order ID**: SS-3b31eb599b5c
- **Payment Date**: 24 Mar 2026, 05:23 PM
- **Amount**: Rs. 399
- **UTR**: HDFCH00884400759
- **Status**: PAID and Settled

### Restoration Steps

#### 1. Run Database Restoration
```bash
# Connect to your PostgreSQL database and run:
psql -d scamsafe_db -f restore_customer_9810174444.sql
```

#### 2. Apply Protection Rules
```bash
# Add protection to prevent future deletions:
psql -d scamsafe_db -f admin_protection_rules.sql
```

#### 3. Verify Restoration
```sql
-- Check customer is restored:
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
```

#### 4. Test Customer Access
1. Customer should be able to login with phone: 9810174444
2. Should receive OTP (use test OTP if needed)
3. Should see active Shield Pro subscription
4. Should have access to dashboard and all features

### What Was Restored
- **Customer Account**: Active with Shield Pro plan
- **Billing Information**: Customer record with payment details
- **Subscription**: Active monthly subscription (next billing: 24 Apr 2026)
- **Invoice**: Payment invoice with GST breakdown
- **Scan History**: Initial scan record for tracking
- **Protection**: Database constraints to prevent future deletion

### Admin Protection Features Added
- **Database Constraint**: Cannot delete customers with payments
- **Audit Logging**: All deletion attempts are logged
- **Admin Warning**: Dashboard shows protection rules
- **Soft Delete Only**: Only `is_deleted=true` flag allowed
- **Paid Customer View**: Special view for paid customers

### Customer Notification
Inform the customer:
- Their account has been fully restored
- They can now login and use all Shield Pro features
- Their subscription is active until 24 April 2026
- Their data is protected and will never be deleted again

### Future Prevention
- Paid customers are now protected by database constraints
- Admin panel shows warning about paid customer protection
- All deletion attempts are logged for audit
- Only soft delete allowed (never hard delete)

**The customer 9810174444 is now fully restored and protected!**
