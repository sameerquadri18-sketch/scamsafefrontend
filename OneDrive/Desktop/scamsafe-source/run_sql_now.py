import requests
import json

# Direct SQL execution via Railway backend
def run_restoration():
    # SQL to restore customer
    sql = """
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
    
    # Try to execute via admin API
    try:
        response = requests.post(
            "https://d63b3329-cd32-4c49-9eb9-c81864a18556.railway.app/api/admin/execute-sql",
            json={"query": sql},
            timeout=30
        )
        
        if response.status_code == 200:
            print("SUCCESS: Customer 9810174444 restored!")
            print(response.text)
            return True
        else:
            print(f"API Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Request failed: {e}")
    
    # Fallback: Try direct database connection
    try:
        import psycopg2
        conn = psycopg2.connect(
            host="containers-us-west-189.railway.app",
            port="7652",
            database="railway",
            user="postgres",
            password="your_password_here"
        )
        cursor = conn.cursor()
        
        # Execute SQL
        cursor.execute(sql)
        conn.commit()
        
        # Verify
        cursor.execute("SELECT phone, plan, subscription_status FROM customers WHERE phone = '9810174444'")
        result = cursor.fetchone()
        
        if result:
            print(f"SUCCESS: Customer restored - Phone: {result[0]}, Plan: {result[1]}, Status: {result[2]}")
            return True
        
    except Exception as e:
        print(f"Database connection failed: {e}")
    
    return False

if __name__ == "__main__":
    run_restoration()
