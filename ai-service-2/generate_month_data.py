# import csv
# from datetime import datetime, timedelta
# import random

# start = datetime(2025, 12, 1, 0, 0, 0)
# end = datetime(2025, 12, 31, 23, 59, 59)

# meters = ["1", "2"]   # You can add more meters here

# rows = [["meter_id", "ts", "load_kw"]]

# current = start
# while current <= end:
#     for m in meters:
#         load = round(random.uniform(8.0, 20.0), 2)  # Random realistic load
#         rows.append([m, current.strftime("%Y-%m-%d %H:%M:%S"), load])
#     current += timedelta(minutes=15)

# with open("sample_data.csv", "w", newline="") as f:
#     writer = csv.writer(f)
#     writer.writerows(rows)

# print("sample_data.csv generated successfully!")
# print(f"Total rows generated (excluding header): {len(rows)-1}")




import csv
from datetime import datetime, timedelta
import random

# -----------------------
# CONFIG
# -----------------------
start = datetime(2025, 12, 1, 0, 0)
end = datetime(2025, 12, 31, 23, 45)
interval = timedelta(minutes=15)

zones = ["North", "South", "East", "West"]
feeders_per_zone = 2
meters_per_feeder = 3
customer_types = ["Residential", "Commercial", "Industrial"]

# -----------------------
# CSV Writers
# -----------------------
zones_csv = [["zone_id", "zone_name"]]
feeders_csv = [["feeder_id", "feeder_name", "zone_id"]]
meters_csv = [["meter_id", "feeder_id", "customer_type", "location"]]
readings_csv = [["meter_id", "ts", "load_kw"]]
weather_csv = [["zone_id", "ts", "temperature_c", "humidity_pct", "solar_irradiance"]]
tariffs_csv = [["zone_id", "start_time", "end_time", "rate_per_kwh", "label"]]

# -----------------------
# Populate Zones / Feeders / Meters
# -----------------------
zone_id = 1
feeder_id = 1
meter_index = 1
zone_map = {}

for z in zones:
    zones_csv.append([zone_id, z])
    zone_map[z] = zone_id

    for f in range(feeders_per_zone):
        feeders_csv.append([feeder_id, f"Feeder {chr(65+f)} {z}", zone_id])

        for m in range(meters_per_feeder):
            meters_csv.append([
                f"MTR{meter_index:03d}",
                feeder_id,
                random.choice(customer_types),
                f"Loc-{meter_index} {z}"
            ])
            meter_index += 1

        feeder_id += 1
    zone_id += 1

# -----------------------
# Generate Meter Readings
# -----------------------
current = start
meter_ids = [row[0] for row in meters_csv[1:]]

while current <= end:
    for m in meter_ids:
        load = round(random.uniform(8.0, 40.0), 2)
        readings_csv.append([m, current.strftime("%Y-%m-%d %H:%M:%S"), load])
    current += interval

# -----------------------
# Generate Weather Data
# -----------------------
current = start
while current <= end:
    for z in range(1, len(zones) + 1):
        weather_csv.append([
            z,
            current.strftime("%Y-%m-%d %H:%M:%S"),
            round(random.uniform(18, 40), 1),
            round(random.uniform(30, 80), 1),
            round(random.uniform(100, 900), 1)
        ])
    current += timedelta(hours=1)

# -----------------------
# Generate Tariffs
# -----------------------
for z in range(1, len(zones) + 1):
    tariffs_csv += [
        [z, "00:00", "06:00", 4.5, "Off-peak"],
        [z, "06:00", "18:00", 7.2, "Normal"],
        [z, "18:00", "23:59", 9.8, "Peak"]
    ]

# -----------------------
# Export CSVs
# -----------------------
files = {
    "zones.csv": zones_csv,
    "feeders.csv": feeders_csv,
    "meters.csv": meters_csv,
    "meter_readings.csv": readings_csv,
    "weather.csv": weather_csv,
    "tariffs.csv": tariffs_csv
}

for filename, data in files.items():
    with open(filename, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerows(data)

print("CSV files generated successfully!")
