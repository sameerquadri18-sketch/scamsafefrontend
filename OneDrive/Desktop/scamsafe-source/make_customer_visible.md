# Making Customer 9810174444 Visible in Admin Dashboard

## Current Status
The customer is **NOT YET VISIBLE** in the admin dashboard because the SQL restoration scripts haven't been run yet.

## Steps to Make Customer Visible

### 1. Check Current Status
```bash
# Run this to see what exists now:
psql -d scamsafe_db -f check_customer_status.sql
```

### 2. Run Restoration Scripts
```bash
# Step 1: Restore the customer
psql -d scamsafe_db -f restore_customer_9810174444.sql

# Step 2: Add protection rules  
psql -d scamsafe_db -f admin_protection_rules.sql
```

### 3. Verify Customer is Restored
```bash
# Check again - should show customer now exists:
psql -d scamsafe_db -f check_customer_status.sql
```

### 4. Refresh Admin Dashboard
- Go to: https://scamsafe.in/admin
- Login to admin panel
- Go to "Users" tab
- Customer 9810174444 should now appear with:
  - Phone: 9810174444
  - Email: rdwalia@gmail.com
  - Plan: shield_pro
  - Status: ACTIVE
  - Payment: Rs. 399

## What the Customer Should See
After restoration, customer can:
1. Go to https://scamsafe.in
2. Enter phone: 9810174444
3. Receive OTP and login
4. See active Shield Pro subscription
5. Access full dashboard

## If Customer Still Not Visible
If after running scripts the customer still doesn't appear:

1. **Check for errors**: Look at SQL script output for any errors
2. **Verify database connection**: Ensure you're connected to the correct database
3. **Check cache**: Admin dashboard might need a refresh (clear browser cache)
4. **Manual check**: Run the verification script to confirm data exists

## Admin Dashboard Protection
After running protection rules:
- Customer cannot be accidentally deleted
- All deletion attempts are logged
- Admin dashboard shows protection warnings

## Expected Timeline
- **Immediately**: Customer appears in admin dashboard after SQL scripts
- **Immediately**: Customer can login and use the platform
- **24 hours**: Protection warnings in admin dashboard can be dismissed

**The customer will appear in admin dashboard immediately after running the SQL restoration scripts!**
