"""
Database Manager Module - PostgreSQL Support

Handles database connections and queries for both PostgreSQL and SQLite.
Uses environment variables for configuration.
"""

import os
import sqlite3
import pandas as pd
from typing import Optional
from dotenv import load_dotenv

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, ".env")

# Load environment variables from the root .env file
if os.path.exists(ENV_PATH):
    load_dotenv(ENV_PATH)
else:
    load_dotenv() # Fallback

# Configuration (Updated to match user's preferred names)
DB_TYPE = os.getenv("DB_TYPE", "postgresql").lower()
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "chatbot_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "rishav123")

# SQLite Paths
SQLITE_DB_PATH = os.path.join(BASE_DIR, os.getenv("SQLITE_DB_PATH", "data/data.db"))

# PostgreSQL connection pool (lazy initialization)
_pg_pool = None


def get_postgres_connection():
    """
    Get a PostgreSQL connection from the pool.
    Creates the pool on first call.
    """
    global _pg_pool
    
    try:
        import psycopg2
        from psycopg2 import pool
        
        if _pg_pool is None:
            _pg_pool = pool.SimpleConnectionPool(
                1,  # min connections
                10,  # max connections
                host=DB_HOST,
                port=DB_PORT,
                database=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD
            )
            print(f"✅ PostgreSQL connection pool created: {DB_NAME}@{DB_HOST}")
        
        return _pg_pool.getconn()
    
    except ImportError:
        raise Exception("psycopg2 not installed. Run: pip install psycopg2-binary")
    except Exception as e:
        raise Exception(f"PostgreSQL connection failed: {e}")


def release_postgres_connection(conn):
    """Return a connection to the pool."""
    if _pg_pool:
        _pg_pool.putconn(conn)


def get_sqlite_connection():
    """Get a SQLite connection."""
    return sqlite3.connect(SQLITE_DB_PATH)


def create_db_if_missing():
    """
    Creates the table structure if DB doesn't exist.
    Only for SQLite - PostgreSQL schema should be created manually.
    """
    if DB_TYPE == "sqlite":
        conn = sqlite3.connect(SQLITE_DB_PATH)
        try:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS meter_users (
                    username TEXT PRIMARY KEY, 
                    meter_id INTEGER
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS meter_loads (
                    meter_id INTEGER, 
                    date_time TEXT, 
                    forecasted_load REAL
                )
            """)
            conn.commit()
            print("✅ SQLite tables created/verified")
        finally:
            conn.close()
    else:
        print(f"ℹ️  PostgreSQL mode ({DB_NAME}@{DB_HOST}) - ensure schema is created")


def run_select_query(sql: str, params: Optional[tuple] = None) -> pd.DataFrame:
    """
    Executes a read-only SQL query and returns a DataFrame.
    """
    if DB_TYPE == "postgresql":
        conn = None
        try:
            conn = get_postgres_connection()
            # PostgreSQL allows parameterized queries in pd.read_sql_query
            df = pd.read_sql_query(sql, conn, params=params)
            return df
        except Exception as e:
            raise Exception(f"PostgreSQL query failed: {e}")
        finally:
            if conn:
                release_postgres_connection(conn)
    
    else:  # SQLite
        conn = None
        try:
            conn = get_sqlite_connection()
            df = pd.read_sql_query(sql, conn, params=params)
            return df
        except Exception as e:
            raise Exception(f"SQLite query failed: {e}")
        finally:
            if conn:
                conn.close()


def execute_query(sql: str, params: Optional[tuple] = None) -> int:
    """
    Executes an INSERT/UPDATE/DELETE query.
    """
    if DB_TYPE == "postgresql":
        conn = None
        try:
            conn = get_postgres_connection()
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
                release_postgres_connection(conn)
    
    else:  # SQLite
        conn = None
        try:
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute(sql, params)
            conn.commit()
            affected = cursor.rowcount
            cursor.close()
            return affected
        except Exception as e:
            if conn:
                conn.rollback()
            raise Exception(f"SQLite execute failed: {e}")
        finally:
            if conn:
                conn.close()


def close_connections():
    """Close all database connections (cleanup on shutdown)."""
    global _pg_pool
    if _pg_pool:
        _pg_pool.closeall()
        print("✅ PostgreSQL connection pool closed")


# Initialize database structure if SQLite
try:
    if DB_TYPE == "sqlite":
        create_db_if_missing()
    print(f"✅ Database initialized: {DB_TYPE.upper()}")
except Exception as e:
    print(f"⚠️  Database initialization warning: {e}")