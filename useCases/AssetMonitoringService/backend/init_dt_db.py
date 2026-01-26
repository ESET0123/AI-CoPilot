import sqlite3
import pandas as pd
import os

DB_FILE = "utility.db"
CSV_FILE = "dt_overload_summary.csv"

def init_db():
    # Remove existing DB to start fresh
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
        print(f"Removed existing {DB_FILE}")

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Create table
    create_table_sql = """
    CREATE TABLE dt_status (
        msn_id TEXT PRIMARY KEY,
        total_days INTEGER,
        days_condition_1 INTEGER,
        classification TEXT
    );
    """
    cursor.execute(create_table_sql)
    print("Created table dt_status")

    # Load data
    try:
        df = pd.read_csv(CSV_FILE)
        # Ensure column names match what we expect in the DB or rename them
        # CSV columns: msn_id,total_days,days_condition_1,classification
        # They match exactly.
        
        df.to_sql("dt_status", conn, if_exists="append", index=False)
        print(f"Loaded {len(df)} rows into dt_status")
        
        # Verify
        cursor.execute("SELECT count(*) FROM dt_status")
        count = cursor.fetchone()[0]
        print(f"Verification: {count} rows found in DB.")

    except Exception as e:
        print(f"Error loading data: {e}")
    finally:
        conn.commit()
        conn.close()

if __name__ == "__main__":
    init_db()
