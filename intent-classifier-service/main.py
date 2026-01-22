import os
import sys

# Ensure path setup
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

if __name__ == "__main__":
    import uvicorn
    print("[Server] Starting Intent Classifier Service on port 8002...")
    uvicorn.run(
        "app.main:app", 
        host="127.0.0.1", 
        port=8002, 
        log_level="info",  # Keep as "info" to see all logs
        reload=True
    )