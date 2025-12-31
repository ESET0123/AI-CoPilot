
import os
import pandas as pd
from modules import db_manager
from datetime import datetime

# Setup logging
import logging
logging.basicConfig(level=logging.INFO)

with open("db_report.txt", "w") as f:
    f.write("--- DB DIAGNOSTIC ---\n")
    try:
        # 1. Check Schema
        f.write("\n1. Schema of meter_loads:\n")
        schema_df = db_manager.run_select_query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'meter_loads'")
        f.write(schema_df.to_string() + "\n")

        # 2. Check Data Range
        f.write("\n2. Data Range:\n")
        range_df = db_manager.run_select_query("SELECT MIN(date_time) as min_date, MAX(date_time) as max_date, COUNT(*) as count FROM meter_loads")
        f.write(range_df.to_string() + "\n")

        # 3. Check for Future Data (Next 10 Days)
        f.write("\n3. Future Data Check:\n")
        future_df = db_manager.run_select_query("SELECT * FROM meter_loads WHERE date_time > NOW() LIMIT 5")
        f.write(future_df.to_string() + "\n")
        
        if not future_df.empty:
            f.write("\n4. Sample Data Types (Pandas):\n")
            f.write(str(future_df.dtypes) + "\n")

    except Exception as e:
        f.write(f"Error: {e}\n")
