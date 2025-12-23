# ================= PYTHON PATH & ENV =================

import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from dotenv import load_dotenv
load_dotenv()

# ================= IMPORTS =================

import pandas as pd
import numpy as np
import psycopg2
from datetime import datetime, timedelta
from app.config import POSTGRES_URL

# ================= CONFIG =================

NOW = datetime.now()
START_DATE = NOW - timedelta(days=365 * 2)   # 2 years history
CURRENT_DATE = NOW
DAYS_FUTURE = 45

CSV_PATH = os.path.join(BASE_DIR, "data", "revenue_train.csv")

NUM_USERS = 5

# ================= DB =================

def get_conn():
    return psycopg2.connect(POSTGRES_URL)

# ================= SCRIPT =================

def generate_and_seed():
    print("=== 1. Generating Training CSV ===")

    dates = pd.date_range(start=START_DATE, end=CURRENT_DATE, freq="D")
    daily_records = []

    for d in dates:
        season_factor = 1 + 0.3 * np.sin((d.dayofyear / 365) * 2 * np.pi - 0.5)
        total_load = 500 + (season_factor * 200) + np.random.normal(0, 50)
        rate = 0.15 + (0.05 if d.month in [6, 7, 8] else 0)
        revenue = total_load * rate

        daily_records.append({
            "date": d.strftime("%Y-%m-%d"),
            "total_load": float(round(total_load, 2)),
            "revenue": float(round(revenue, 2)),
        })

    os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
    pd.DataFrame(daily_records).to_csv(CSV_PATH, index=False)
    print(f"CSV saved: {CSV_PATH}")

    print("=== 2. Seeding PostgreSQL (ai schema) ===")

    conn = get_conn()
    cur = conn.cursor()

    # ---------------- SCHEMA ----------------

    cur.execute("CREATE SCHEMA IF NOT EXISTS ai")

    # ---------------- TABLES ----------------

    cur.execute("DROP TABLE IF EXISTS meter_loads")
    cur.execute("DROP TABLE IF EXISTS grid_users")

    cur.execute("""
        CREATE TABLE grid_users (
            username TEXT PRIMARY KEY,
            meter_id INTEGER UNIQUE NOT NULL
        )
    """)

    cur.execute("""
        CREATE TABLE meter_loads (
            meter_id INTEGER,
            date_time TIMESTAMP,
            forecasted_load REAL
        )
    """)

    # ---------------- USERS ----------------

    users = [(f"user_{i}", 1000 + i) for i in range(1, NUM_USERS + 1)]
    cur.executemany(
        "INSERT INTO grid_users VALUES (%s, %s)",
        users
    )

    # ---------------- LOAD DATA ----------------

    end_future = CURRENT_DATE + timedelta(days=DAYS_FUTURE)
    all_dates = pd.date_range(start=START_DATE, end=end_future, freq="h")

    history_targets = {
        row["date"]: row["total_load"] for row in daily_records
    }

    future_targets = {}
    for d in pd.date_range(CURRENT_DATE + timedelta(days=1), end_future, freq="D"):
        season_factor = 1 + 0.3 * np.sin((d.dayofyear / 365) * 2 * np.pi - 0.5)
        future_targets[d.strftime("%Y-%m-%d")] = float(500 + (season_factor * 200))

    daily_targets = {**history_targets, **future_targets}

    batch = []
    batch_size = 10_000

    for ts in all_dates:
        date_key = ts.strftime("%Y-%m-%d")
        if date_key not in daily_targets:
            continue

        daily_total = daily_targets[date_key]
        hour_factor = 1 + 0.5 * np.sin((ts.hour - 6) * np.pi / 12)
        hourly_total = (daily_total / 24) * hour_factor

        for i in range(NUM_USERS):
            meter_id = 1000 + (i + 1)
            load = (hourly_total / NUM_USERS) * np.random.uniform(0.8, 1.2)

            # 🔑 IMPORTANT: cast NumPy → Python float
            batch.append(
                (meter_id, ts.to_pydatetime(), float(round(load, 2)))
            )

        if len(batch) >= batch_size:
            cur.executemany(
                "INSERT INTO meter_loads VALUES (%s, %s, %s)",
                batch
            )
            batch.clear()

    if batch:
        cur.executemany(
            "INSERT INTO meter_loads VALUES (%s, %s, %s)",
            batch
        )

    conn.commit()
    conn.close()

    print("✅ PostgreSQL seeded successfully (ai schema)")

# ================= ENTRY =================

if __name__ == "__main__":
    generate_and_seed()
