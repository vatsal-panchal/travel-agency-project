@echo off
setlocal
title Wanderlust - Dev Launcher

echo Starting Wanderlust backend and frontend...
start "Wanderlust Backend" /D "%~dp0backend" cmd /k npm run dev
start "Wanderlust Frontend" /D "%~dp0frontend" cmd /k npm run dev

echo Waiting for the servers to start...
timeout /t 5 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo Keep both terminal windows open while testing.
echo Run stop-project.bat when you are done.
endlocal
