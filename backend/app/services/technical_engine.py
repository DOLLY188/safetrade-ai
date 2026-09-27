import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
from ..models.schemas import TechnicalIndicators

def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    
    # Exponential smoothing method
    rs = gain / (loss.replace(0, np.nan))
    rsi = 100 - (100 / (1 + rs))
    return rsi.fillna(50.0)

def calculate_macd(series: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> Tuple[pd.Series, pd.Series, pd.Series]:
    ema_fast = series.ewm(span=fast, adjust=False).mean()
    ema_slow = series.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    macd_hist = macd_line - signal_line
    return macd_line, signal_line, macd_hist

def calculate_atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
    high = df['High']
    low = df['Low']
    close = df['Close'].shift(1)
    
    tr1 = high - low
    tr2 = (high - close).abs()
    tr3 = (low - close).abs()
    
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.rolling(window=period).mean()
    return atr.fillna(tr.mean() if not tr.empty else 1.0)

def calculate_technicals(df: pd.DataFrame) -> TechnicalIndicators:
    """
    Computes all standard technical indicators on historical daily bars.
    Requires columns: Open, High, Low, Close, Volume.
    """
    if len(df) < 20:
        raise ValueError("Insufficient historical data for technical analysis (minimum 20 bars needed).")

    close = df['Close']
    high = df['High']
    low = df['Low']

    # Moving averages
    sma_20 = close.rolling(20).mean().iloc[-1]
    sma_50 = close.rolling(50).mean().iloc[-1] if len(df) >= 50 else sma_20
    sma_200 = close.rolling(200).mean().iloc[-1] if len(df) >= 200 else sma_50

    ema_20 = close.ewm(span=20, adjust=False).mean().iloc[-1]
    ema_50 = close.ewm(span=50, adjust=False).mean().iloc[-1] if len(df) >= 50 else ema_20
    ema_200 = close.ewm(span=200, adjust=False).mean().iloc[-1] if len(df) >= 200 else ema_50

    # RSI
    rsi_series = calculate_rsi(close, 14)
    rsi_val = float(rsi_series.iloc[-1])

    # MACD
    macd_line, sig_line, hist_line = calculate_macd(close)
    macd_val = float(macd_line.iloc[-1])
    sig_val = float(sig_line.iloc[-1])
    hist_val = float(hist_line.iloc[-1])

    # Bollinger Bands
    rolling_20 = close.rolling(20)
    std_20 = rolling_20.std().iloc[-1]
    bb_mid = float(sma_20)
    bb_upper = float(bb_mid + (2 * std_20))
    bb_lower = float(bb_mid - (2 * std_20))

    # ATR
    atr_series = calculate_atr(df, 14)
    atr_val = float(atr_series.iloc[-1])

    # Dynamic Support & Resistance based on recent 60-day lows/highs
    lookback = min(len(df), 60)
    support_val = float(low.iloc[-lookback:].min())
    resistance_val = float(high.iloc[-lookback:].max())

    current_price = float(close.iloc[-1])

    # Trend condition logic
    if current_price > ema_50 and ema_50 > ema_200:
        trend = "Strong Uptrend (Above 50 & 200 EMA)"
    elif current_price > ema_50 and current_price < ema_200:
        trend = "Recovering / Neutral Counter-Trend"
    elif current_price < ema_50 and current_price > ema_200:
        trend = "Bullish Pullback / Testing 200 EMA Support"
    else:
        trend = "Downtrend / Below Key Moving Averages"

    return TechnicalIndicators(
        rsi_14=round(rsi_val, 2),
        macd=round(macd_val, 2),
        macd_signal=round(sig_val, 2),
        macd_hist=round(hist_val, 2),
        sma_20=round(float(sma_20), 2),
        sma_50=round(float(sma_50), 2),
        sma_200=round(float(sma_200), 2),
        ema_20=round(float(ema_20), 2),
        ema_50=round(float(ema_50), 2),
        ema_200=round(float(ema_200), 2),
        bollinger_upper=round(bb_upper, 2),
        bollinger_lower=round(bb_lower, 2),
        bollinger_middle=round(bb_mid, 2),
        atr_14=round(atr_val, 2),
        support_level=round(support_val, 2),
        resistance_level=round(resistance_val, 2),
        trend_condition=trend
    )
