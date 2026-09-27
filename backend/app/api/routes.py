from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..models.schemas import (
    StockDetailsResponse,
    ScreenerItem,
    AiChatRequest,
    AiChatResponse,
    SafetyPrediction,
    TradeCheckRequest,
    TradeCheckResponse
)
from ..services.data_service import (
    fetch_stock_history,
    fetch_stock_quote,
    df_to_candle_bars,
    fetch_stock_news
)
from ..services.technical_engine import calculate_technicals
from ..services.safety_model import evaluate_safety
from ..services.gemini_service import analyze_with_gemini
from ..services.trade_inspector import inspect_trade

router = APIRouter()

POPULAR_TICKERS = [
    ("AAPL", "Apple Inc.", "Technology"),
    ("MSFT", "Microsoft Corp.", "Technology"),
    ("NVDA", "NVIDIA Corp.", "Semiconductors"),
    ("GOOGL", "Alphabet Inc.", "Communication"),
    ("AMZN", "Amazon.com Inc.", "Consumer Cyclical"),
    ("META", "Meta Platforms", "Communication"),
    ("TSLA", "Tesla Inc.", "Automotive / Tech"),
    ("JPM", "JPMorgan Chase & Co.", "Financial Services"),
    ("AMD", "Advanced Micro Devices", "Semiconductors"),
    ("SPY", "SPDR S&P 500 ETF", "Index ETF"),
    ("QQQ", "Invesco QQQ Trust", "Tech Index ETF"),
    ("COST", "Costco Wholesale", "Consumer Defensive")
]

@router.get("/stock/{ticker}", response_model=StockDetailsResponse)
async def get_stock_details(ticker: str, period: str = "1y"):
    ticker_clean = ticker.strip().upper()
    try:
        df = fetch_stock_history(ticker_clean, period=period)
        quote = fetch_stock_quote(ticker_clean, df)
        technicals = calculate_technicals(df)
        prediction = evaluate_safety(ticker_clean, df, technicals, quote.price)
        candles = df_to_candle_bars(df)
        news = fetch_stock_news(ticker_clean)

        return StockDetailsResponse(
            quote=quote,
            technicals=technicals,
            prediction=prediction,
            candles=candles,
            news=news
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/predict/{ticker}", response_model=SafetyPrediction)
async def get_prediction_only(ticker: str):
    ticker_clean = ticker.strip().upper()
    try:
        df = fetch_stock_history(ticker_clean, period="1y")
        quote = fetch_stock_quote(ticker_clean, df)
        technicals = calculate_technicals(df)
        prediction = evaluate_safety(ticker_clean, df, technicals, quote.price)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/trade-check", response_model=TradeCheckResponse)
async def execute_trade_precheck(request: TradeCheckRequest):
    """
    Performs real-time, deep pre-flight inspection for a specific trade.
    Evaluates 6 critical safety filters, computes exact position sizing,
    calculates maximum dollar risk, and delivers a definitive GO / NO-GO verdict.
    """
    try:
        response = inspect_trade(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/screener", response_model=List[ScreenerItem])
async def get_safe_screener():
    """
    Screens the market watchlist to identify and rank stocks with the highest safety scores
    and 55%-65%+ win probabilities.
    """
    results = []
    for sym, name, sector in POPULAR_TICKERS:
        try:
            df = fetch_stock_history(sym, period="6mo")
            quote = fetch_stock_quote(sym, df)
            technicals = calculate_technicals(df)
            prediction = evaluate_safety(sym, df, technicals, quote.price)
            
            results.append(ScreenerItem(
                ticker=sym,
                name=name,
                price=quote.price,
                change_percent=quote.change_percent,
                safety_score=prediction.safety_score,
                win_probability=prediction.win_probability,
                risk_level=prediction.risk_level,
                action=prediction.trade_setup.action,
                sector=sector
            ))
        except Exception as e:
            print(f"Skipping {sym} in screener due to error: {e}")
            continue

    # Sort descending by safety score
    results.sort(key=lambda x: x.safety_score, reverse=True)
    return results

@router.post("/ai-chat", response_model=AiChatResponse)
async def chat_with_ai_analyst(payload: AiChatRequest):
    answer = analyze_with_gemini(
        ticker=payload.ticker,
        question=payload.question,
        context=payload.context
    )
    return AiChatResponse(
        ticker=payload.ticker.upper(),
        question=payload.question,
        answer=answer
    )

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "SafeTrade AI Engine"}
