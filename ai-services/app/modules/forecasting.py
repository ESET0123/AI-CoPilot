from datetime import datetime
import os
import joblib
from tensorflow import keras
from app.db import get_conn

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "revenue_model.keras")
SCALER_PATH = os.path.join(BASE_DIR, "models", "revenue_scalers.pkl")

def _get_forecasted_load(date_str):
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT SUM(forecasted_load)
            FROM meter_loads
            WHERE date_time::date = %s
            """,
            (date_str,),
        )
        row = cur.fetchone()
        return row[0]
    finally:
        conn.close()

def predict_revenue_for_date(date_str: str) -> str:
    if not os.path.exists(MODEL_PATH):
        return "Revenue model not trained."

    total_load = _get_forecasted_load(date_str)
    if total_load is None:
        return f"No forecasted load available for {date_str}."

    model = keras.models.load_model(MODEL_PATH)
    scalers = joblib.load(SCALER_PATH)

    scaler_X = scalers["input_scaler"]
    scaler_y = scalers["output_scaler"]

    dt = datetime.strptime(date_str, "%Y-%m-%d")
    X = scaler_X.transform([[total_load, dt.month, dt.weekday()]])
    y = model.predict(X, verbose=0)

    revenue = scaler_y.inverse_transform(y)[0][0]
    return f"Predicted revenue for {date_str} is ₹{round(revenue, 2)}"
