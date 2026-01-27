@echo off
REM Startup script for Load Forecasting Service

echo ========================================
echo Load Forecasting Service Startup
echo ========================================
echo.

cd /d "%~dp0useCases\LoadForecastingService"

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Installing/Updating dependencies...
pip install -r requirements.txt

echo.
echo Starting Load Forecasting Service on port 8013...
echo.
echo Service will be available at: http://127.0.0.1:8013
echo API Documentation: http://127.0.0.1:8013/docs
echo.
echo Press Ctrl+C to stop the service
echo.

python api_main.py

pause
