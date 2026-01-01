import pandas as pd
import numpy as np
import sqlite3
import joblib
import os
import requests
import re
from datetime import datetime
from tensorflow import keras

# Path Configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "revenue_model.keras")
SCALER_PATH = os.path.join(BASE_DIR, "models", "scaler.pkl")

import logging
logger = logging.getLogger("AI_SERVICE")


# Dependencies from modules
from modules import db_manager

# LLM Config
OLLAMA_API = "http://localhost:11434/api/generate"
MODEL = "gemma3:12b"

def get_forecasted_load_from_db(target_date_str):
    """Queries the DB for the SUM of all forecasted loads for a specific future date."""
    # Use db_manager for cross-db support
    # For PostgreSQL, we cast date_time to date for comparison
    if db_manager.DB_TYPE == "postgresql":
        query = "SELECT SUM(forecasted_load) as total_load FROM meter_loads WHERE date_time::date = %s"
    else:
        query = f"SELECT SUM(forecasted_load) as total_load FROM meter_loads WHERE date_time LIKE '{target_date_str}%'"
    
    try:
        df = db_manager.run_select_query(query, (target_date_str,) if db_manager.DB_TYPE == "postgresql" else None)
        if df.empty or df.iloc[0]['total_load'] is None:
            return None
        return float(df.iloc[0]['total_load'])
    except Exception as e:
        print(f"Error fetching load from DB: {e}")
        return None

def predict_revenue_for_date(user_query):
    # --- FIX: DYNAMIC DATE INJECTION ---
    # We grab the current system date precisely
    now = datetime.now()
    current_date = now.strftime("%Y-%m-%d")
    current_year = now.year

    # 1. Extract Date via LLM with STRICT constraints
    prompt = f"""
    Context: Today is {current_date} (Year: {current_year}).
    Task: Extract the target date from this query: '{user_query}'.
    
    Rules:
    1. "Tomorrow" = {current_date} + 1 day.
    2. "Next Thursday" = The upcoming Thursday relative to {current_date}.
    3. DO NOT CHANGE THE YEAR unless the query explicitly says "next year".
    4. Return ONLY the date in YYYY-MM-DD format.
    
    Query: {user_query}
    """
    
    try:
        r = requests.post(OLLAMA_API, json={"model": MODEL, "prompt": prompt, "stream": False})
        response_text = r.json().get('response', '')
        
        # Regex to find date pattern YYYY-MM-DD
        date_match = re.search(r"\d{4}-\d{2}-\d{2}", response_text)
        if not date_match: 
            return pd.DataFrame(), f"LLM responded: '{response_text}'. Could not understand the target date."
        date_str = date_match.group(0)
    except Exception as e: 
        return pd.DataFrame(), f"LLM Error during date extraction: {e}"

    # 2. Check Model Existence
    if not os.path.exists(MODEL_PATH): 
        return pd.DataFrame(), "Model not trained. Run 'train_model.py' first."
    
    # 3. Get Load Feature (The Input)
    total_load = get_forecasted_load_from_db(date_str)
    
    if total_load is None: 
        # Detailed error message for debugging
        return pd.DataFrame(), f"System Error: No forecasted load data found in DB for {date_str}. (Check: Does generate_all_data.py cover this date?)"

    # 4. Run Prediction
    try:
        model = keras.models.load_model(MODEL_PATH)
        scaler_X, scaler_y = joblib.load(SCALER_PATH)
        
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        features_raw = [[total_load, dt.month, dt.weekday()]]
        features_scaled = scaler_X.transform(features_raw)
        
        revenue_scaled = model.predict(features_scaled, verbose=0)
        revenue = scaler_y.inverse_transform(revenue_scaled)[0][0]
        
        df = pd.DataFrame({'date': [date_str], 'predicted_revenue': [round(revenue, 2)]})
        msg = f"Revenue Forecast for {date_str}: ${round(revenue, 2)}"
        logger.info(f"Forecast Prediction: {msg}")
        return df, msg
    except Exception as e:
        return pd.DataFrame(), f"Prediction Engine Error: {str(e)}"