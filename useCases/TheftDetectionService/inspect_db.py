import sqlite3
import json

DB_FILE = "utility.db"

def inspect_database():
    """Inspect database structure and sample data"""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    
    print("=" * 80)
    print("DATABASE INSPECTION REPORT")
    print("=" * 80)
    
    # Get all tables
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cur.fetchall()]
    
    print(f"\n📊 Found {len(tables)} tables: {', '.join(tables)}\n")
    
    for table in tables:
        print("─" * 80)
        print(f"TABLE: {table}")
        print("─" * 80)
        
        # Get column info
        cur.execute(f"PRAGMA table_info({table})")
        columns = cur.fetchall()
        
        print(f"\n📋 Columns ({len(columns)}):")
        for col in columns:
            print(f"  • {col['name']:30s} {col['type']:15s} {'NOT NULL' if col['notnull'] else ''}")
        
        # Get row count
        cur.execute(f"SELECT COUNT(*) as count FROM {table}")
        count = cur.fetchone()['count']
        print(f"\n📈 Total rows: {count}")
        
        # Get sample data
        if count > 0:
            cur.execute(f"SELECT * FROM {table} LIMIT 3")
            samples = [dict(row) for row in cur.fetchall()]
            
            print(f"\n🔍 Sample data (first 3 rows):")
            print(json.dumps(samples, indent=2, default=str))
        
        print("\n")
    
    conn.close()
    
    print("=" * 80)
    print("Inspection complete!")
    print("=" * 80)

if __name__ == "__main__":
    try:
        inspect_database()
    except Exception as e:
        print(f"❌ Error: {e}")