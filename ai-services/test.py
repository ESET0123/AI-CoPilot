import joblib

scalers = joblib.load("models/revenue_scalers.pkl")
print(type(scalers))

if isinstance(scalers, dict):
    print("Keys:", scalers.keys())
else:
    print(scalers)
