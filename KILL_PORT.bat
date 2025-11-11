@echo off
echo Finding process on port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Killing process PID: %%a
    taskkill /F /PID %%a
)
echo.
echo Port 3001 should now be free!
pause


