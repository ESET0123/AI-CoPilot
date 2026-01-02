import os
import sys

# Ensure portable ffmpeg (if needed) and path setup
current_dir = os.path.dirname(os.path.abspath(__file__))
os.environ["PATH"] += os.pathsep + current_dir

if __name__ == "__main__":
    import uvicorn
    # Import the app factory
    # Note: We use "app.main:app" string for reload support if we wanted it, 
    # but here we can just run the app object or the import string.
    
    # Run on port 8001
    uvicorn.run("app.main:app", host="127.0.0.1", port=8001, log_level="info", reload=True)