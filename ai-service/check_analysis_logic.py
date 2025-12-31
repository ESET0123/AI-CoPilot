
import pandas as pd
import json

# Mimic the DataFrame
data = {
    'meter_id': [1001, 1002],
    'date_time': [pd.Timestamp('2025-12-31 11:25:15'), pd.Timestamp('2026-01-01 11:25:15')],
    'forecasted_load': [6.67, 8.55]
}
df = pd.DataFrame(data)

# Mimic LLM Result (defaulting to table)
result = {
    "summary": "Here is the data",
    "visualization_type": "table",
    "x_column": "date_time",
    "y_column": "forecasted_load"
}

print("--- BEFORE HEURISTIC ---")
print(result)

# --- HEURISTIC LOGIC COPY-PASTE FROM llm_router.py ---
if result.get("visualization_type") == "table":
    cols = [c.lower() for c in df.columns]
    # Check for time columns
    time_cols = [c for c in cols if any(x in c for x in ['date', 'time', 'ts', 'day', 'hour', 'month'])]
    # Check for numeric columns
    numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
    
    print(f"Time Cols detected: {time_cols}")
    print(f"Numeric Cols detected: {numeric_cols}")
    
    if time_cols and numeric_cols:
        result["visualization_type"] = "line"
        result["x_column"] = time_cols[0] # Best guess
        result["y_column"] = numeric_cols[0] # Best guess

print("--- AFTER HEURISTIC ---")
print(result)
