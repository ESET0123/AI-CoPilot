from tensorflow import keras
# ================= IMPORTS =================

import os
import pandas as pd
import joblib

from sklearn.preprocessing import MinMaxScaler
from tensorflow import keras

# ================= PATHS =================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CSV_PATH = os.path.join(BASE_DIR, "data", "revenue_train.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "revenue_model.keras")
SCALER_PATH = os.path.join(MODEL_DIR, "revenue_scalers.pkl")

# ================= TRAINING =================

def train():
    print("=== Revenue Model Training ===")

    # ---------- Sanity check ----------
    if not os.path.exists(CSV_PATH):
        raise RuntimeError(
            f"Training CSV not found at {CSV_PATH}. "
            f"Run generate_all_data.py first."
        )

    # ---------- Load data ----------
    df = pd.read_csv(CSV_PATH)
    df["date"] = pd.to_datetime(df["date"])

    # ---------- Feature engineering ----------
    df["month"] = df["date"].dt.month
    df["day_of_week"] = df["date"].dt.dayofweek

    X = df[["total_load", "month", "day_of_week"]].values
    y = df[["revenue"]].values

    # ---------- Scaling ----------
    scaler_X = MinMaxScaler()
    scaler_y = MinMaxScaler()

    X_scaled = scaler_X.fit_transform(X)
    y_scaled = scaler_y.fit_transform(y)

    # ---------- Ensure model directory ----------
    os.makedirs(MODEL_DIR, exist_ok=True)

    # ---------- Save scalers ----------
    joblib.dump(
        {
            "input_scaler": scaler_X,
            "output_scaler": scaler_y,
        },
        SCALER_PATH
    )

    # ---------- Define model ----------
    model = keras.Sequential([
        keras.layers.Input(shape=(3,)),
        keras.layers.Dense(64, activation="relu"),
        keras.layers.Dense(32, activation="relu"),
        keras.layers.Dense(1)   # regression output
    ])

    model.compile(
        optimizer="adam",
        loss="mse",
        metrics=["mae"]
    )

    # ---------- Train ----------
    print("Training model...")
    model.fit(
        X_scaled,
        y_scaled,
        epochs=50,
        batch_size=32,
        verbose=1
    )

    # ---------- Save ----------
    model.save(MODEL_PATH)

    print("✅ Revenue model trained successfully")
    print(f"   Model saved at: {MODEL_PATH}")
    print(f"   Scalers saved at: {SCALER_PATH}")

# ================= ENTRY =================

if __name__ == "__main__":
    train()
