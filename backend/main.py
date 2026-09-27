import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.api.routes import router as api_router

load_dotenv()

app = FastAPI(
    title="SafeTrade AI: Stock Market Safety & Predictive Engine",
    description="Quantitative technical/market structure analysis predicting safe trade setups with calibrated 55-65% win rates.",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite default port 5173 and any local origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "SafeTrade AI API is running.",
        "documentation": "/docs",
        "endpoints": ["/api/stock/{ticker}", "/api/predict/{ticker}", "/api/screener", "/api/ai-chat"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
