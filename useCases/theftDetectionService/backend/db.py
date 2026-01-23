import sqlite3

def run_sql(query):
    conn = sqlite3.connect("utility.db")
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute(query)
    rows = cur.fetchall()

    conn.close()
    return [dict(r) for r in rows]
