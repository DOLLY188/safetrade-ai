from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class StockQuote(BaseModel):
    ticker: str
    name: str
    price: float
    change: float
    change_percent: float
    volume: int
    avg_volume: Optional[int] = None
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    high_52w: Optional[float] = None
    low_52w: Optional[float] = None
    currency: str = "USD"
    sector: Optional[str] = "Unknown"
    industry: Optional[str] = "Unknown"

class TechnicalIndicators(BaseModel):
    rsi_14: float
    macd: float
    macd_signal: float
    macd_hist: float
    sma_20: float
    sma_50: float
    sma_200: float
    ema_20: float
    ema_50: float
    ema_200: float
    bollinger_upper: float
    bollinger_lower: float
    bollinger_middle: float
    atr_14: float
    support_level: float
    resistance_level: float
    trend_condition: str

class FactorScore(BaseModel):
    factor_name: str
    score: float # 0 - 100
    weight: float
    grade: str # A, B, C, D, F
    description: str

class TradeSetup(BaseModel):
    entry_price: float
    stop_loss: float
    target_price: float
    risk_reward_ratio: float
    potential_gain_pct: float
    max_risk_pct: float
    action: str # "BUY / SAFE ACCUMULATION", "HOLD / WATCH", "AVOID / HIGH RISK"

class SafetyPrediction(BaseModel):
    ticker: str
    safety_score: float # 0 - 100
    win_probability: float # e.g. 55.0% - 65.5%
    confidence_interval: str # e.g. "58.2% - 63.8%"
    risk_level: str # "Very Safe", "Moderate Risk", "Speculative / High Risk"
    direction: str # "Bullish", "Neutral", "Bearish"
    setup_quality: str # "High Quality Edge", "Acceptable", "Poor"
    factors: List[FactorScore]
    trade_setup: TradeSetup
    summary_verdict: str

class CandleBar(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int

class NewsItem(BaseModel):
    title: str
    publisher: str
    link: str
    published: Optional[str] = None
    sentiment: Optional[str] = "Neutral"

class StockDetailsResponse(BaseModel):
    quote: StockQuote
    technicals: TechnicalIndicators
    prediction: SafetyPrediction
    candles: List[CandleBar]
    news: List[NewsItem]

class ScreenerItem(BaseModel):
    ticker: str
    name: str
    price: float
    change_percent: float
    safety_score: float
    win_probability: float
    risk_level: str
    action: str
    sector: str

class AiChatRequest(BaseModel):
    ticker: str
    question: str
    context: Optional[Dict[str, Any]] = None

class AiChatResponse(BaseModel):
    ticker: str
    question: str
    answer: str

# Real-Time Pre-Flight Trade Inspector Schemas
class PreFlightCheckItem(BaseModel):
    name: str
    status: str # "PASS", "WARNING", "DANGER"
    message: str
    value: str

class TradeSizing(BaseModel):
    recommended_shares: int
    capital_allocated: float
    capital_allocated_pct: float
    entry_price: float
    stop_loss: float
    target_price: float
    max_dollar_loss: float
    potential_dollar_gain: float
    risk_reward_ratio: float

class TradeCheckRequest(BaseModel):
    ticker: str
    account_capital: float = 10000.0
    max_risk_pct: float = 1.5
    custom_entry: Optional[float] = None

class TradeCheckResponse(BaseModel):
    ticker: str
    timestamp: str
    current_price: float
    verdict: str # "GO: PRIME SETUP (High Edge)", "CAUTION: MARGINAL / WAIT", "NO-GO: REJECTED (High Risk)"
    safety_score: float
    win_probability: float
    checklist_passed: int
    checklist_total: int
    checks: List[PreFlightCheckItem]
    sizing: TradeSizing
    one_two_verdict: str

# Autonomous 24/7 Engine Schemas
class AutonomousSignal(BaseModel):
    id: str
    timestamp: str
    ticker: str
    name: str
    price: float
    safety_score: float
    win_probability: float
    recommended_shares: int
    stop_loss: float
    target_price: float
    risk_reward_ratio: float
    max_dollar_loss: float
    potential_dollar_gain: float
    verdict: str
    status: str = "ACTIVE" # "ACTIVE", "TARGET_HIT", "STOPPED_OUT"

class AutonomousSettings(BaseModel):
    enabled: bool = True
    scan_interval_minutes: int = 15
    account_capital: float = 10000.0
    max_risk_pct: float = 1.5
    webhook_url: Optional[str] = ""

class TriggerScanResponse(BaseModel):
    message: str
    scanned_count: int
    signals_found: int
    signals: List[AutonomousSignal]
