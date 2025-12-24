# import sqlite3
# import csv

# conn = sqlite3.connect("data/meter.db")

# with open("sample_data.csv") as f:
#     reader = csv.DictReader(f)
#     for row in reader:
#         conn.execute(
#             "INSERT INTO meter_readings (meter_id, ts, load_kw) VALUES (?, ?, ?)",
#             (row["meter_id"], row["ts"], row["load_kw"])
#         )

# conn.commit()
# conn.close()

# print("Data inserted successfully!")

import sqlite3
import csv

DB = "data/meter.db"
conn = sqlite3.connect(DB)

def insert_csv(filename, table, columns):
    with open(filename) as f:
        reader = csv.DictReader(f)
        rows = [tuple(row[col] for col in columns) for row in reader]
        conn.executemany(
            f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({', '.join(['?'] * len(columns))})",
            rows
        )
        print(f"Inserted → {filename} → {len(rows)} rows")

# 1️⃣ Zones
insert_csv("zones.csv", "zones", ["zone_id", "zone_name"])

# 2️⃣ Feeders
insert_csv("feeders.csv", "feeders", ["feeder_id", "feeder_name", "zone_id"])

# 3️⃣ Meters
insert_csv("meters.csv", "meters", ["meter_id", "feeder_id", "customer_type", "location"])

# 4️⃣ Meter Readings
insert_csv("meter_readings.csv", "meter_readings", ["meter_id", "ts", "load_kw"])

# 5️⃣ Weather
insert_csv("weather.csv", "weather", ["zone_id", "ts", "temperature_c", "humidity_pct", "solar_irradiance"])

# 6️⃣ Tariffs
insert_csv("tariffs.csv", "tariffs", ["zone_id", "start_time", "end_time", "rate_per_kwh", "label"])

conn.commit()
conn.close()
print("\n🎉 All CSV files inserted successfully!")

