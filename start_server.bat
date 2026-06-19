@echo off
echo =======================================================
echo  EcoCarbon - Local Development Server
echo =======================================================
echo.
echo Starting local web server on http://localhost:8000...
echo Press Ctrl+C in this window to stop the server.
echo.
start "" "http://localhost:8000"
python -m http.server 8000
