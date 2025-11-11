@echo off
echo Checking for processes on port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Killing process %%a on port 3001...
    taskkill /F /PID %%a >nul 2>&1
)
echo Port 3001 should now be free.
timeout /t 2 >nul


