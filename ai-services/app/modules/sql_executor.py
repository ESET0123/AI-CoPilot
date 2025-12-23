import psycopg2
from app.config import POSTGRES_URL


def execute_sql(sql: str, params: list):
    print("[DB] executing SQL")
    print("[DB] SQL:")
    print(sql)
    print("[DB] params:", params)

    conn = psycopg2.connect(POSTGRES_URL)
    try:
        cur = conn.cursor()
        cur.execute(sql, params)
        row = cur.fetchone()
        print("[DB] raw result:", row)
        return row[0] if row else None
    finally:
        conn.close()
