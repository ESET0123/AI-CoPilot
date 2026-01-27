import sqlite3

conn = sqlite3.connect("utility.db")
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS utility_cases (
  case_id TEXT PRIMARY KEY,
  inspection_date TEXT NOT NULL,
  visit_status TEXT NOT NULL,
  found_status TEXT NOT NULL,
  category TEXT,
  is_smart_meter TEXT,
  multimeter_available TEXT,
  multimeter_status TEXT,
  billed_status TEXT,
  billed_units REAL,
  billed_amount REAL,
  panchanama_number TEXT,
  officer_name TEXT NOT NULL,
  observation_type TEXT,
  description TEXT,
  remark TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()
conn.close()
print("Database ready.")
