import sqlite3
import os
from datetime import timedelta

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
import joblib

DB_PATH = "data/meter.db"
METER_ID = "MTR001"   # <-- you can change this later


def load_meter_data(meter_id: str) -> pd.DataFrame:
    conn = sqlite3.connect(DB_PATH)
    query = """
        SELECT ts, load_kw
        FROM meter_readings
        WHERE meter_id = ?
        ORDER BY ts ASC
    """
    df = pd.read_sql_query(query, conn, params=(meter_id,))
    conn.close()

    if df.empty:
        raise ValueError(f"No data found for meter_id={meter_id}")

    # Parse timestamps and set index
    df["ts"] = pd.to_datetime(df["ts"])
    df = df.set_index("ts")

    # Ensure regular 15-min frequency (fill gaps if any)
    df = df.asfreq("15T")
    # You can forward-fill missing load values if gaps exist
    df["load_kw"] = df["load_kw"].interpolate()

    return df


def add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["hour"] = df.index.hour
    df["dow"] = df.index.dayofweek  # 0 = Monday

    # Cyclic encoding of hour
    df["sin_hour"] = np.sin(2 * np.pi * df["hour"] / 24)
    df["cos_hour"] = np.cos(2 * np.pi * df["hour"] / 24)

    # Lag features (previous values)
    df["lag_1"] = df["load_kw"].shift(1)    # previous 15 min
    df["lag_4"] = df["load_kw"].shift(4)    # 1 hour ago
    df["lag_96"] = df["load_kw"].shift(96)  # 1 day ago (96 * 15min)

    df = df.dropna()
    return df


def train_model_for_meter(meter_id: str):
    print(f"Loading data for meter {meter_id}...")
    df = load_meter_data(meter_id)
    df_feat = add_time_features(df)

    feature_cols = ["sin_hour", "cos_hour", "dow", "lag_1", "lag_4", "lag_96"]

    X = df_feat[feature_cols].values
    y = df_feat["load_kw"].values

    # Train/test split: 80% train, 20% test
    split_idx = int(len(df_feat) * 0.8)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]

    print(f"Training samples: {len(X_train)}, Test samples: {len(X_test)}")

    model = RandomForestRegressor(
        n_estimators=200,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    print(f"MAE on test set: {mae:.3f} kW")

    # Save model
    os.makedirs("models", exist_ok=True)
    model_path = f"models/forecast_{meter_id}.pkl"
    joblib.dump(
        {
            "model": model,
            "feature_cols": feature_cols
        },
        model_path
    )
    print(f"Model saved to {model_path}")

    return model, df_feat, feature_cols


def iterative_forecast(df_hist: pd.DataFrame, model, feature_cols, steps: int = 96):
    """
    df_hist: dataframe with load_kw indexed by ts, already has enough history
    steps: number of 15-min steps to forecast (96 = 24 hours)
    """
    history = df_hist.copy()
    forecasts = []
    timestamps = []

    for i in range(steps):
        next_ts = history.index[-1] + pd.Timedelta(minutes=15)

        hour = next_ts.hour
        dow = next_ts.dayofweek
        sin_hour = np.sin(2 * np.pi * hour / 24)
        cos_hour = np.cos(2 * np.pi * hour / 24)

        # lag features from history
        lag_1 = history["load_kw"].iloc[-1]
        lag_4 = history["load_kw"].iloc[-4] if len(history) >= 4 else lag_1
        lag_96 = history["load_kw"].iloc[-96] if len(history) >= 96 else lag_1

        row = {
            "sin_hour": sin_hour,
            "cos_hour": cos_hour,
            "dow": dow,
            "lag_1": lag_1,
            "lag_4": lag_4,
            "lag_96": lag_96
        }

        X_next = np.array([[row[col] for col in feature_cols]])
        y_next = model.predict(X_next)[0]

        forecasts.append(y_next)
        timestamps.append(next_ts)

        # append prediction to history for next iteration
        history.loc[next_ts, "load_kw"] = y_next

    forecast_df = pd.DataFrame(
        {"ts": timestamps, "forecast_kw": forecasts}
    )
    return forecast_df



if __name__ == "__main__":
    conn = sqlite3.connect(DB_PATH)
    meter_ids = pd.read_sql_query("SELECT DISTINCT meter_id FROM meter_readings", conn)["meter_id"].tolist()
    conn.close()

    print("Meters found:", meter_ids)

    for mid in meter_ids:
        print("\n==============================")
        print(f" Training model for {mid} ")
        print("==============================")
        try:
            train_model_for_meter(mid)
        except Exception as e:
            print(f"❌ Could not train model for {mid}: {e}")

    print("\n🎉 All meter models trained successfully!")
