import os
import sys

# Ensure path setup
current_dir = os.path.dirname(os.path.abspath(__file__))
os.environ["PATH"] += os.pathsep + current_dir

if __name__ == "__main__":
    import uvicorn
    # Run on port 8002 to avoid conflict with ai-service (8001)
    uvicorn.run("app.main:app", host="127.0.0.1", port=8002, log_level="info", reload=True)
