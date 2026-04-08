import os
import json

# Try to get Railway database URL from environment
db_url = os.environ.get('DATABASE_URL') or os.environ.get('RAILWAY_DATABASE_URL')

if db_url:
    print(f"Found database URL: {db_url}")
else:
    print("Database URL not found in environment")
    print("Available environment variables:")
    for key, value in os.environ.items():
        if 'db' in key.lower() or 'railway' in key.lower() or 'database' in key.lower():
            print(f"{key}: {value[:50]}...")
