import os
import pandas as pd
import joblib
from sklearn.linear_model import LinearRegression

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
CSV_PATH = os.path.join(BASE_DIR, "data", "revenue_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "models", "revenue_model.pkl")

# Load CSV
df = pd.read_csv(CSV_PATH)

# Normalize column names
df.columns = [c.strip().capitalize() for c in df.columns]

# Validate required columns
if "Datetime" not in df.columns or "Revenue" not in df.columns:
    raise ValueError("CSV must contain 'Datetime' and 'Revenue' columns")

# Convert Datetime → Year
df["Datetime"] = pd.to_datetime(df["Datetime"])
df["Year"] = df["Datetime"].dt.year

# Convert to numeric
df["Revenue"] = df["Revenue"].astype(float)

# Train model using YEAR → Revenue
X = df[["Year"]].values
y = df["Revenue"].values

model = LinearRegression()
model.fit(X, y)

# Save model
joblib.dump({"model": model}, MODEL_PATH)

print("Revenue model trained & saved at:", MODEL_PATH)

