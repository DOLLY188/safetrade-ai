import os
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.api.routes import router as api_router
from app.services.autonomous_engine import background_autonomous_worker

load_dotenv()

app = FastAPI(
    title="SafeTrade AI: Stock Market Safety & Predictive Engine",
    description="Quantitative technical/market structure analysis predicting safe trade setups with calibrated 55-65% win rates.",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    # Start the background 24/7 worker for scraping and autonomous alerts
    asyncio.create_task(background_autonomous_worker())
    print("SafeTrade AI: Autonomous Worker initialized and running.")

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
