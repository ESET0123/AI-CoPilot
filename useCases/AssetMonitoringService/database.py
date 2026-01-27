import sqlite3
import os
import logging
from config import settings

logger = logging.getLogger("AssetMonitoringService.Database")

def run_sql(query: str):
    logger.info(f"Executing SQL: {query}")
    db_path = os.path.join(os.path.dirname(__file__), settings.DB_PATH)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    try:
        cur.execute(query)
        rows = cur.fetchall()
        logger.info(f"SQL execution successful, returned {len(rows)} rows")
        conn.close()
        return [dict(r) for r in rows]
    except Exception as e:
        logger.exception("SQL execution failed")
        conn.close()
        raise e
