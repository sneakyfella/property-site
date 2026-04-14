@echo off
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 "') do (
    taskkill /PID %%a /F >nul 2>&1
)
start "" python -m http.server 8000
timeout /t 2 /nobreak >nul
start "" "http://localhost:8000"
