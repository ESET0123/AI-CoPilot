import pandas as pd
import sqlite3
import re

EXCEL_FILE = "dummy_theft_cases_1000_hierarchical.xlsx"
DB_FILE = "utility.db"
TABLE_NAME = "historical_cases"

def clean_col(col):
    col = col.strip().lower()
    col = re.sub(r"[^a-z0-9_]", "_", col)
    col = re.sub(r"_+", "_", col)
    return col

print("Loading Excel...")
df = pd.read_excel(EXCEL_FILE)

df.columns = [clean_col(c) for c in df.columns]
print("Columns:", df.columns.tolist())

conn = sqlite3.connect(DB_FILE)
df.to_sql(TABLE_NAME, conn, if_exists="replace", index=False)
conn.close()

print(f"Imported {len(df)} rows into table '{TABLE_NAME}'")
