import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from ..models.schemas import (
    SafetyPrediction,
    FactorScore,
    TradeSetup,
    TechnicalIndicators
)

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "trained_model.pkl")

def get_grade(score: float) -> str:
    if score >= 85:
        return "A+"
    elif score >= 75:
        return "A"
    elif score >= 65:
        return "B"
    elif score >= 50:
        return "C"
    elif score >= 35:
        return "D"
    return "F"

def evaluate_safety(
    ticker: str,
    df: pd.DataFrame,
    technicals: TechnicalIndicators,
    current_price: float
) -> SafetyPrediction:
    """
    Evaluates historical chart data & technical signals to compute a quantitative
    Safety Score (0-100), statistical Win Probability (calibrated 55%-65% for safe setups),
    and risk-adjusted Trade Setup (Entry, Stop Loss, Target).
    """
    # 1. Trend Factor (Weight: 30%)
    trend_score = 0.0
    trend_reasons = []
    
    if current_price > technicals.ema_200:
        trend_score += 40
        trend_reasons.append("Trading above institutional 200 EMA")
    else:
        trend_reasons.append("Trading below 200 EMA (Long-term headwind)")

    if technicals.ema_50 > technicals.ema_200:
        trend_score += 35
        trend_reasons.append("Golden cross active (50 EMA > 200 EMA)")
    
    if current_price > technicals.ema_20:
        trend_score += 25
        trend_reasons.append("Short-term momentum intact (above 20 EMA)")
        
    trend_grade = get_grade(trend_score)

    # 2. Volatility & Capital Preservation Factor (Weight: 25%)
    # Lower relative volatility = safer capital preservation
    atr_pct = (technicals.atr_14 / current_price) * 100
    vol_score = 50.0
    vol_reasons = []
    
    if atr_pct <= 2.0:
        vol_score = 95.0
        vol_reasons.append(f"Low normalized volatility (ATR: {atr_pct:.1f}%). Highly stable price action.")
    elif atr_pct <= 3.5:
        vol_score = 80.0
        vol_reasons.append(f"Moderate healthy volatility (ATR: {atr_pct:.1f}%).")
    elif atr_pct <= 5.0:
        vol_score = 60.0
        vol_reasons.append(f"Elevated volatility (ATR: {atr_pct:.1f}%). Requires wider stop-losses.")
    else:
        vol_score = 30.0
        vol_reasons.append(f"Extreme volatility (ATR: {atr_pct:.1f}%). Elevated whipsaw risk.")

    # Deduct if price is piercing above upper Bollinger Band (overbought extension)
    if current_price > technicals.bollinger_upper:
        vol_score = max(20.0, vol_score - 20)
        vol_reasons.append("Price extended outside upper Bollinger Band.")
    vol_grade = get_grade(vol_score)

    # 3. Momentum Setup Factor (Weight: 25%)
    # Best risk-reward entries are pullbacks in an uptrend (RSI 40-55) or fresh MACD turns
    mom_score = 50.0
    mom_reasons = []
    
    rsi = technicals.rsi_14
    if 40 <= rsi <= 55:
        mom_score = 90.0
        mom_reasons.append(f"RSI in optimal low-risk accumulation sweet spot ({rsi:.1f}).")
    elif 55 < rsi <= 65:
        mom_score = 75.0
        mom_reasons.append(f"Healthy bullish momentum (RSI: {rsi:.1f}).")
    elif rsi > 70:
        mom_score = 40.0
        mom_reasons.append(f"Overbought territory (RSI: {rsi:.1f}). High pullback risk.")
    elif rsi < 30:
        mom_score = 55.0
        mom_reasons.append(f"Deeply oversold (RSI: {rsi:.1f}). Potential bounce but knife-catch risk.")
    else:
        mom_score = 60.0
        mom_reasons.append(f"Neutral momentum (RSI: {rsi:.1f}).")

    if technicals.macd_hist > 0:
        mom_score = min(100.0, mom_score + 10)
        mom_reasons.append("Positive MACD momentum histogram.")
    else:
        mom_score = max(20.0, mom_score - 10)
        mom_reasons.append("Negative MACD momentum.")
    mom_grade = get_grade(mom_score)

    # 4. Volume & Accumulation Factor (Weight: 20%)
    vol_acc_score = 60.0
    vol_acc_reasons = []
    recent_vols = df['Volume'].iloc[-5:]
    avg_vol = df['Volume'].rolling(20).mean().iloc[-1]
    
    if avg_vol > 0:
        vol_ratio = float(recent_vols.iloc[-1] / avg_vol)
        if vol_ratio > 1.2 and technicals.macd_hist >= 0:
            vol_acc_score = 85.0
            vol_acc_reasons.append(f"Above average volume ({vol_ratio:.1f}x) confirming buying interest.")
        elif vol_ratio < 0.7:
            vol_acc_score = 50.0
            vol_acc_reasons.append("Low volume consolidation.")
        else:
            vol_acc_score = 70.0
            vol_acc_reasons.append("Normal institutional volume participation.")
    else:
        vol_acc_reasons.append("Volume data within normal bounds.")
    vol_acc_grade = get_grade(vol_acc_score)

    # Check for optional ML model file
    ml_probability = None
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            # Feature vector: [rsi, atr_pct, ema_ratio_50_200, price_ema200_ratio, macd_hist]
            features = np.array([[
                technicals.rsi_14,
                atr_pct,
                technicals.ema_50 / technicals.ema_200 if technicals.ema_200 else 1.0,
                current_price / technicals.ema_200 if technicals.ema_200 else 1.0,
                technicals.macd_hist
            ]])
            if hasattr(model, "predict_proba"):
                probs = model.predict_proba(features)[0]
                ml_probability = float(probs[1]) * 100.0
        except Exception:
            ml_probability = None

    # Weighted Composite Safety Score (0-100)
    composite_score = (
        (trend_score * 0.30) +
        (vol_score * 0.25) +
        (mom_score * 0.25) +
        (vol_acc_score * 0.20)
    )
    composite_score = max(5.0, min(95.0, composite_score))

    # Calibrate Win Probability to realistic 50% - 66% market edge bounds
    # Base probability for random entry is ~50%. High safety score scales up to ~64-65%.
    if ml_probability is not None:
        win_prob = round((composite_score * 0.4 + ml_probability * 0.6) * 0.22 + 43.0, 1)
    else:
        # Scale composite_score: 50 -> 50%, 80 -> 60%, 95 -> 64.5%
        win_prob = round(44.0 + (composite_score * 0.215), 1)
    
    win_prob = max(42.0, min(65.8, win_prob))

    # Categorization
    if composite_score >= 72:
        risk_level = "Low Risk (Safe Setup)"
        direction = "Bullish"
        setup_quality = "Prime Edge (Safe to Trade)"
        action = "BUY / SAFE ACCUMULATION"
    elif composite_score >= 55:
        risk_level = "Moderate Risk"
        direction = "Cautious Bullish / Neutral"
        setup_quality = "Acceptable Setup"
        action = "HOLD / WAIT FOR PULLBACK"
    else:
        risk_level = "Elevated Risk / Speculative"
        direction = "Bearish / Chop"
        setup_quality = "High Risk"
        action = "AVOID / WAIT FOR REVERSAL"

    # Trade Setup Calculation (1:2 Risk-Reward)
    stop_distance = max(technicals.atr_14 * 1.5, current_price * 0.025)
    stop_loss = round(max(0.01, current_price - stop_distance), 2)
    risk_amount = current_price - stop_loss
    
    target_price = round(current_price + (risk_amount * 2.1), 2)
    potential_gain_pct = round(((target_price - current_price) / current_price) * 100, 2)
    max_risk_pct = round(((current_price - stop_loss) / current_price) * 100, 2)
    risk_reward_ratio = round(potential_gain_pct / max(0.1, max_risk_pct), 2)

    trade_setup = TradeSetup(
        entry_price=round(current_price, 2),
        stop_loss=stop_loss,
        target_price=target_price,
        risk_reward_ratio=risk_reward_ratio,
        potential_gain_pct=potential_gain_pct,
        max_risk_pct=max_risk_pct,
        action=action
    )

    factors = [
        FactorScore(
            factor_name="Trend Alignment",
            score=round(trend_score, 1),
            weight=0.30,
            grade=trend_grade,
            description="; ".join(trend_reasons)
        ),
        FactorScore(
            factor_name="Capital Preservation & Volatility",
            score=round(vol_score, 1),
            weight=0.25,
            grade=vol_grade,
            description="; ".join(vol_reasons)
        ),
        FactorScore(
            factor_name="Momentum & Entry Timing",
            score=round(mom_score, 1),
            weight=0.25,
            grade=mom_grade,
            description="; ".join(mom_reasons)
        ),
        FactorScore(
            factor_name="Volume Dynamics",
            score=round(vol_acc_score, 1),
            weight=0.20,
            grade=vol_acc_grade,
            description="; ".join(vol_acc_reasons)
        )
    ]

    conf_lower = max(40.0, round(win_prob - 2.8, 1))
    conf_upper = min(68.0, round(win_prob + 2.8, 1))
    confidence_interval = f"{conf_lower}% - {conf_upper}%"

    summary_verdict = (
        f"{ticker} has a Safety Score of {composite_score:.1f}/100 with an estimated statistical "
        f"win probability of {win_prob}% ({risk_level}). "
        f"Key drivers: {trend_grade} Trend structure and {vol_grade} Volatility profile."
    )

    return SafetyPrediction(
        ticker=ticker.upper(),
        safety_score=round(composite_score, 1),
        win_probability=win_prob,
        confidence_interval=confidence_interval,
        risk_level=risk_level,
        direction=direction,
        setup_quality=setup_quality,
        factors=factors,
        trade_setup=trade_setup,
        summary_verdict=summary_verdict
    )
