#!/usr/bin/env python3
import os
import psycopg2
import json

# Railway database connection details
DB_CONFIG = {
    'host': 'containers-us-west-189.railway.app',
    'port': '7652',
    'database': 'railway',
    'user': 'postgres',
    'password': 'your_password_here'
}

def restore_customer():
    try:
        # Connect to database
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # SQL restoration script
        sql_commands = [
            # Update existing customer
            """
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
            """,
            
            # Insert if not exists
            """
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
            """,
            
            # Add billing info
            """
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
                39900,
                true,
                '2026-03-24 17:23:00',
                '2026-03-24 17:23:00'
            FROM customers c 
            WHERE c.phone = '9810174444' AND c.is_deleted = false
            ON CONFLICT (customer_id) DO UPDATE SET
                email = 'rdwalia@gmail.com',
                full_name = 'Shield Pro Customer',
                plan_amount = 39900;
            """,
            
            # Create subscription
            """
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
                plan_amount = 39900;
            """,
            
            # Create invoice
            """
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
                33814,
                6086,
                39900,
                'rdwalia@gmail.com',
                'HDFCH00884400759',
                '2026-03-24 17:23:00'
            FROM customers c 
            WHERE c.phone = '9810174444' AND c.is_deleted = false
            ON CONFLICT DO UPDATE SET
                sent_to_email = 'rdwalia@gmail.com';
            """
        ]
        
        # Execute all commands
        for i, sql in enumerate(sql_commands, 1):
            print(f"Executing command {i}...")
            cursor.execute(sql)
            conn.commit()
            print(f"Command {i} completed successfully")
        
        # Verify restoration
        cursor.execute("""
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
        """)
        
        result = cursor.fetchone()
        if result:
            print("\nSUCCESS: Customer 9810174444 restored!")
            print(f"Phone: {result[0]}")
            print(f"Plan: {result[1]}")
            print(f"Status: {result[2]}")
            print(f"Email: {result[5]}")
            print(f"Subscription: {result[7]}")
            print(f"Invoice: {result[9]}")
            print(f"Amount: Rs. {result[10]/100}")
        else:
            print("ERROR: Customer not found after restoration")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"ERROR: {e}")
        return False
    
    return True

if __name__ == "__main__":
    restore_customer()
