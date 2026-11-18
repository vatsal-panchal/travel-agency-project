@echo off
setlocal
title Wanderlust - Stop Servers

echo Stopping Wanderlust servers on ports 5000 and 5173...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ports = 5000,5173; foreach ($port in $ports) { Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }"
echo Done. Backend and frontend are stopped.
timeout /t 3 /nobreak >nul
endlocal
