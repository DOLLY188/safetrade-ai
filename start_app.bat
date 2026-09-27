@echo off
title SafeTrade AI Launcher
echo =======================================================
echo          Launching SafeTrade AI Suite
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:5173
echo =======================================================
start "SafeTrade AI Backend" cmd /k "run_backend.bat"
timeout /t 2 /nobreak >nul
start "SafeTrade AI Frontend" cmd /k "run_frontend.bat"
echo Services launched in background windows.
pause
