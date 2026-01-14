import requests
import json
import re
import threading
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

import logging
logger = logging.getLogger("AI_SERVICE")

# --- CONFIGURATION ---

# 1. LOCAL CONFIG (Ollama)
OLLAMA_API = "http://localhost:11434/api/generate"
# Make sure you have pulled this model in terminal: ollama pull gemma3:12b
LOCAL_MODEL = "gemma3:12b"  


# --- ROUTER FUNCTIONS ---

def call_llm(prompt, model_type="local", cancel_event=None):
    """
    Routes the request to Local (Ollama) ONLY.
    
    Args:
        prompt: The prompt to send to the LLM
        model_type: Ignored (kept for compatibility)
        cancel_event: Optional threading.Event for cancellation support
    """
    return call_local_api(prompt, cancel_event)

def call_local_api(prompt, cancel_event=None):
    """
    Calls Ollama running locally.
    
    Args:
        prompt: The prompt to send
        cancel_event: Optional threading.Event for cancellation
    """
    try:
        # Check if cancelled before making request
        if cancel_event and cancel_event.is_set():
            return "Request cancelled by user"
        
        payload = {
            "model": LOCAL_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.1}
        }
        r = requests.post(OLLAMA_API, json=payload, timeout=300)
        
        # Check if cancelled after request
        if cancel_event and cancel_event.is_set():
            return "Request cancelled by user"
        
        return r.json().get('response', 'Error: No response from Ollama')
    except Exception as e:
        # Fallback/Dummy response if local AI is down
        print(f"Local AI Error: {e}")
        return "Local AI is currently unavailable. Please ensure Ollama is running."

# --- APP LOGIC FUNCTIONS ---

def classify_intent(query, model_type="local"):
    """
    Decides if the user wants historical data (SQL) or future predictions (Revenue).
    Includes a keyword safety check to prevent 'Load' queries from going to Revenue.
    """
    current_date = datetime.now().strftime("%Y-%m-%d")
    prompt = f"""
    You are an intent classifier.
    Context: Today is {current_date}.
    1. If query is about REVENUE ($) AND a future date -> JSON: {{"intent": "REVENUE_FORECAST"}}
    2. Else -> JSON: {{"intent": "SQL_QUERY"}}
    Output JSON ONLY. Query: {query}
    """
    
    # 1. Ask the LLM
    resp = call_llm(prompt, model_type)
    detected_intent = "SQL_QUERY" # Default

    try:
        json_match = re.search(r"\{.*\}", resp.strip(), re.DOTALL)
        if json_match:
            data = json.loads(json_match.group(0))
            if data.get("intent") == "REVENUE_FORECAST":
                detected_intent = "REVENUE_FORECAST"
    except:
        pass

    # --- 2. PYTHON SAFETY OVERRIDE (The Fix) ---
    # The LLM gets confused by "forecast" + date. We fix it here manually.
    
    query_lower = query.lower()
    
    # If LLM said REVENUE, but user actually asked for LOAD/POWER/USAGE...
    if detected_intent == "REVENUE_FORECAST":
        if any(word in query_lower for word in ["load", "power", "usage", "demand", "consumption"]):
            # FORCE override back to SQL because the Revenue engine cannot handle Load
            return "SQL_QUERY"

    return detected_intent

def generate_sql(query, model_type="local"):
    """Generates SQL based on the user query."""
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    current_day = datetime.now().strftime("%A")
    
    prompt = f"""
    Role: Expert SQL Generator.
    Schema: 
    - meter_users (username VARCHAR, meter_id INTEGER)
    - meter_loads (meter_id INTEGER, date_time TIMESTAMPTZ, forecasted_load DOUBLE PRECISION)
    Context: Today is {current_time} ({current_day}).
    Task: Convert to PostgreSQL SQL. Return ONLY the raw SQL code.
    
    CRITICAL RULES:
    1. If the query asks for "load", "power", or "usage" WITHOUT specifying a meter_id or username, you MUST aggregate.
       - Use: `SELECT date_time, SUM(forecasted_load) as total_load FROM meter_loads GROUP BY date_time ORDER BY date_time`
    2. Do NOT select `meter_id` unless explicitly asked using "meter 1001" or "my meter".
    3. Always order by date_time.
    
    Query: {query}
    """
    
    resp = call_llm(prompt, model_type)
    
    # --- SAFETY CHECK 1: ERROR STRINGS ---
    # If the LLM returned a known error message, stop here
    if resp.startswith("Error") or resp.startswith("Local AI"):
        logger.error(f"LLM Error detected: {resp}")
        return f"-- SYSTEM ERROR: {resp}", resp

    # --- AGGRESSIVE CLEANING ---
    # 1. Extract from markdown code blocks if present
    code_block_match = re.search(r"```(?:sql|sqlite)?\n?(.*?)```", resp, re.DOTALL | re.IGNORECASE)
    if code_block_match:
        sql = code_block_match.group(1)
    else:
        sql = resp

    # 2. Find the Start of the Query
    # Look for the first "SELECT", "WITH", or "SHOW" (case-insensitive)
    match = re.search(r"\b(SELECT|WITH|SHOW)\b", sql, re.IGNORECASE)
    
    if match:
        # Keep everything starting from the keyword
        sql = sql[match.start():]
    else:
        # --- SAFETY CHECK 2: NO SQL KEYWORDS ---
        # If we can't find SELECT or WITH, it's likely conversational text or an uncaught error
        logger.warning(f"No SQL keywords found in LLM response: {resp[:100]}...")
        return f"-- SYSTEM ERROR: LLM returned invalid SQL format.", resp
    
    # 3. Final cleanup of whitespace and trailing semicolons inside text
    sql = sql.strip()
    
    logger.info(f"Generated SQL: {sql}")
        
    return sql, resp

def analyze_data(df, query, model_type="local"):
    """Generates insights from the dataframe."""
    if df.empty: 
        return {"summary": "No data found matching your query.", "visualization_type": "table"}
    
    # --- ENHANCED DATA SAMPLE INJECTION ---
    # 1. Provide column names and data types (critical for LLM to select x/y axes)
    column_info = {col: str(df[col].dtype) for col in df.columns}
    
    # 2. Provide the top 5 rows
    data_sample = df.head(5).to_dict('list') # Use 'list' for a cleaner prompt structure
    
    prompt = f"""
    Role: Data Analyst.
    Task: Analyze this data snippet and the user's query.
    Return a JSON object with:
    1. "summary": A 1-sentence insight about the data.
    2. "visualization_type": "line", "bar", or "table".
       - USE "line" if data has a DATE/TIME column and a NUMERIC column.
       - USE "bar" if data has a CATEGORY column and a NUMERIC column.
    3. "x_column": The best column for X-axis (must be an existing column name).
    4. "y_column": The best column for Y-axis (must be an existing column name).
    
    Query: {query}
    
    --- DATA STRUCTURE ---
    Columns and Types: {column_info}
    
    --- DATA SAMPLE (First 5 Rows) ---
    {data_sample}
    
    JSON Output Only:
    """
    
    resp = call_llm(prompt, model_type)
    
    try:
        match = re.search(r"\{.*\}", resp, re.DOTALL).group(0)
        result = json.loads(match)
        
        # --- HEURISTIC OVERRIDE ---
        # If LLM does NOT suggest a chart, but we have time-series data, force "line"
        vt = result.get("visualization_type", "").lower()
        if vt not in ["line", "bar"]:
            cols = [c.lower() for c in df.columns]
            # Check for time columns
            time_cols = [c for c in cols if any(x in c for x in ['date', 'time', 'ts', 'day', 'hour', 'month'])]
            # Check for numeric columns
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
            
            if time_cols and numeric_cols:
                result["visualization_type"] = "line"
                result["x_column"] = time_cols[0] # Best guess
                result["y_column"] = numeric_cols[0] # Best guess
                
                logger.info(f"Heuristic applied: Forced visualization to 'line' using {result['x_column']} vs {result['y_column']}")
                
        logger.info(f"Analysis Result: {result}")
        return result
        
    except:
        # Fallback if parsing fails but we have data
        # Check if we can auto-detect simple time-series
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        cols = [c.lower() for c in df.columns]
        time_cols = [c for c in cols if any(x in c for x in ['date', 'time', 'ts'])]
        
        if time_cols and numeric_cols:
             return {
                 "summary": "Here is the data trend.",
                 "visualization_type": "line",
                 "x_column": time_cols[0],
                 "y_column": numeric_cols[0]
             }
             
        # Include the raw data in case of parsing failure for debugging
        return {"summary": "Analysis failed or raw text returned.", "visualization_type": "table", "raw": resp}