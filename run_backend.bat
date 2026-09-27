@echo off
title SafeTrade AI - FastAPI Backend
echo Starting SafeTrade AI Backend on http://localhost:8000 ...
cd backend
"C:\Users\USER\.local\bin\uv.exe" run --python 3.11 uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
