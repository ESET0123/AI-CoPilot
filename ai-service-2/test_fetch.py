import sqlite3
conn = sqlite3.connect("data/meter.db")
conn.row_factory = sqlite3.Row

rows = conn.execute("SELECT * FROM meter_readings").fetchall()

for r in rows:
    print(dict(r))
