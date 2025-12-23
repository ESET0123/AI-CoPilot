SCHEMA_CONTEXT = """
Table: meter_loads
Columns:
- date_time TIMESTAMP
- forecasted_load FLOAT

Notes:
- date_time is UTC
- forecasted_load is energy load in MW
"""

# EXAMPLES = """
# User: total load yesterday
# SQL:
# SELECT SUM(forecasted_load)
# FROM meter_loads
# WHERE date_time::date = '2025-01-01';
# """

def build_rag_context():
    return SCHEMA_CONTEXT