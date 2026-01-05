import pandas as pd
from typing import Optional
from .database_base import Database

class PostgresDatabase(Database):
    def __init__(self, host, port, db_name, user, password):
        self.host = host
        self.port = port
        self.db_name = db_name
        self.user = user
        self.password = password
        self._pool = None
        self._init_pool()

    def _init_pool(self):
        try:
            from psycopg2 import pool
            self._pool = pool.SimpleConnectionPool(
                1, 10,
                host=self.host,
                port=self.port,
                database=self.db_name,
                user=self.user,
                password=self.password
            )
            print(f"✅ PostgreSQL connection pool created: {self.db_name}@{self.host}")
        except Exception as e:
            raise Exception(f"PostgreSQL pool initialization failed: {e}")

    def get_connection(self):
        return self._pool.getconn()

    def release_connection(self, conn):
        self._pool.putconn(conn)

    def run_select_query(self, sql: str, params: Optional[tuple] = None) -> pd.DataFrame:
        conn = None
        try:
            conn = self.get_connection()
            df = pd.read_sql_query(sql, conn, params=params)
            return df
        except Exception as e:
            raise Exception(f"PostgreSQL query failed: {e}")
        finally:
            if conn:
                self.release_connection(conn)

    def execute_query(self, sql: str, params: Optional[tuple] = None) -> int:
        conn = None
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute(sql, params)
            conn.commit()
            affected = cursor.rowcount
            cursor.close()
            return affected
        except Exception as e:
            if conn:
                conn.rollback()
            raise Exception(f"PostgreSQL execute failed: {e}")
        finally:
            if conn:
                self.release_connection(conn)

    def close(self):
        if self._pool:
            self._pool.closeall()
            print("✅ PostgreSQL connection pool closed")
