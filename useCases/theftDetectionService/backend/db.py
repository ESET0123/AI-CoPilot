import sqlite3
import os
from config import settings

def run_sql(query):
    db_path = os.path.join(os.path.dirname(__file__), settings.DB_PATH)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    try:
        cur.execute(query)
        rows = cur.fetchall()
        conn.close()
        return [dict(r) for r in rows]
    except Exception as e:
        conn.close()
        raise e
