import math
from datetime import datetime
import pandas as pd
from typing import Dict, Any, List
from ..models.schemas import (
    TradeCheckRequest,
    TradeCheckResponse,
    PreFlightCheckItem,
    TradeSizing
)
from .data_service import fetch_stock_history, fetch_stock_quote
from .technical_engine import calculate_technicals
from .safety_model import evaluate_safety

def inspect_trade(request: TradeCheckRequest) -> TradeCheckResponse:
    ticker = request.ticker.strip().upper()
    df = fetch_stock_history(ticker, period="6mo")
    quote = fetch_stock_quote(ticker, df)
    technicals = calculate_technicals(df)
    prediction = evaluate_safety(ticker, df, technicals, quote.price)
    
    current_price = request.custom_entry or quote.price
    stop_loss = prediction.trade_setup.stop_loss
    target_price = prediction.trade_setup.target_price
    
    # Ensure stop loss is below current price
    if stop_loss >= current_price:
        stop_loss = round(current_price - (technicals.atr_14 * 1.5), 2)
    
    risk_per_share = max(0.01, current_price - stop_loss)
    reward_per_share = max(0.01, target_price - current_price)
    rr_ratio = round(reward_per_share / risk_per_share, 2)

    # 1. Position Sizing Math (Fixed Fractional Risk)
    max_dollar_loss_allowed = request.account_capital * (request.max_risk_pct / 100.0)
    recommended_shares = int(math.floor(max_dollar_loss_allowed / risk_per_share))
    
    # Cap position size so it doesn't exceed 35% of total account capital on a single stock
    max_capital_for_single_stock = request.account_capital * 0.35
    max_shares_by_capital = int(math.floor(max_capital_for_single_stock / current_price))
    
    final_shares = max(1, min(recommended_shares, max_shares_by_capital)) if recommended_shares > 0 else 0
    total_capital = round(final_shares * current_price, 2)
    capital_pct = round((total_capital / request.account_capital) * 100.0, 1)
    
    actual_dollar_loss = round(final_shares * risk_per_share, 2)
    actual_dollar_gain = round(final_shares * reward_per_share, 2)

    # 2. Six Pre-Flight Checks
    checks: List[PreFlightCheckItem] = []

    # Check 1: Trend Filter (200 EMA)
    if current_price > technicals.ema_200:
        checks.append(PreFlightCheckItem(
            name="Trend Alignment (200 EMA)",
            status="PASS",
            message="Trading above the 200 EMA. Macro institutional trend is supportive.",
            value=f"${current_price} > ${technicals.ema_200}"
        ))
    elif current_price > technicals.ema_50:
        checks.append(PreFlightCheckItem(
            name="Trend Alignment (200 EMA)",
            status="WARNING",
            message="Above 50 EMA but below 200 EMA. Counter-trend rally with overhead resistance.",
            value=f"${current_price} < 200 EMA (${technicals.ema_200})"
        ))
    else:
        checks.append(PreFlightCheckItem(
            name="Trend Alignment (200 EMA)",
            status="DANGER",
            message="Trading below both 50 and 200 EMA. High probability of continued selling.",
            value=f"${current_price} below key EMAs"
        ))

    # Check 2: Volatility / ATR Contraction
    atr_pct = (technicals.atr_14 / current_price) * 100
    if atr_pct <= 3.5:
        checks.append(PreFlightCheckItem(
            name="Volatility Risk (Normalized ATR)",
            status="PASS",
            message=f"Healthy daily range ({atr_pct:.1f}%). Low slippage and clean stop placement.",
            value=f"{atr_pct:.1f}% Daily ATR"
        ))
    elif atr_pct <= 5.0:
        checks.append(PreFlightCheckItem(
            name="Volatility Risk (Normalized ATR)",
            status="WARNING",
            message=f"Elevated volatility ({atr_pct:.1f}%). Position size adjusted downward.",
            value=f"{atr_pct:.1f}% Daily ATR"
        ))
    else:
        checks.append(PreFlightCheckItem(
            name="Volatility Risk (Normalized ATR)",
            status="DANGER",
            message=f"Severe erratic volatility ({atr_pct:.1f}%). High risk of flash wick stop-out.",
            value=f"{atr_pct:.1f}% Daily ATR"
        ))

    # Check 3: Momentum Entry Sweetspot (RSI)
    rsi = technicals.rsi_14
    if 40 <= rsi <= 62:
        checks.append(PreFlightCheckItem(
            name="Momentum Entry Timing (RSI 14)",
            status="PASS",
            message=f"RSI ({rsi}) is in the optimal accumulation sweetspot. Not overbought.",
            value=f"RSI: {rsi}"
        ))
    elif rsi > 68:
        checks.append(PreFlightCheckItem(
            name="Momentum Entry Timing (RSI 14)",
            status="DANGER",
            message=f"RSI ({rsi}) is overextended. Chasing here has poor historical risk/reward.",
            value=f"RSI: {rsi} (Overbought)"
        ))
    elif rsi < 35:
        checks.append(PreFlightCheckItem(
            name="Momentum Entry Timing (RSI 14)",
            status="WARNING",
            message=f"RSI ({rsi}) is oversold. Await a 1-day confirmation candle before buying.",
            value=f"RSI: {rsi} (Oversold)"
        ))
    else:
        checks.append(PreFlightCheckItem(
            name="Momentum Entry Timing (RSI 14)",
            status="PASS",
            message=f"RSI ({rsi}) is within acceptable trading parameters.",
            value=f"RSI: {rsi}"
        ))

    # Check 4: MACD Directional Bias
    if technicals.macd_hist > 0:
        checks.append(PreFlightCheckItem(
            name="MACD Histogram Momentum",
            status="PASS",
            message="Positive MACD expansion confirms buying momentum in the short term.",
            value=f"+{technicals.macd_hist}"
        ))
    else:
        checks.append(PreFlightCheckItem(
            name="MACD Histogram Momentum",
            status="WARNING",
            message="Negative MACD histogram indicates decelerating momentum or pullback in progress.",
            value=f"{technicals.macd_hist}"
        ))

    # Check 5: Asymmetric Risk/Reward Ratio
    if rr_ratio >= 2.0:
        checks.append(PreFlightCheckItem(
            name="Asymmetric Risk:Reward Payout",
            status="PASS",
            message=f"1:{rr_ratio} setup exceeds institutional minimum threshold (1:2.0).",
            value=f"1:{rr_ratio}"
        ))
    elif rr_ratio >= 1.5:
        checks.append(PreFlightCheckItem(
            name="Asymmetric Risk:Reward Payout",
            status="WARNING",
            message=f"1:{rr_ratio} setup is acceptable but provides limited margin of safety.",
            value=f"1:{rr_ratio}"
        ))
    else:
        checks.append(PreFlightCheckItem(
            name="Asymmetric Risk:Reward Payout",
            status="DANGER",
            message=f"1:{rr_ratio} setup offers insufficient upside relative to stop-loss distance.",
            value=f"1:{rr_ratio}"
        ))

    # Check 6: Capital Preservation Sizing
    if capital_pct <= 35.0 and actual_dollar_loss <= (max_dollar_loss_allowed * 1.05):
        checks.append(PreFlightCheckItem(
            name="Position Sizing & Portfolio Risk",
            status="PASS",
            message=f"Trade limits risk to ${actual_dollar_loss} ({request.max_risk_pct}% of capital).",
            value=f"${actual_dollar_loss} Max Risk ({capital_pct}% of Acct)"
        ))
    else:
        checks.append(PreFlightCheckItem(
            name="Position Sizing & Portfolio Risk",
            status="WARNING",
            message=f"Position size exceeds recommended concentration threshold.",
            value=f"{capital_pct}% of Account"
        ))

    passed_count = sum(1 for c in checks if c.status == "PASS")
    danger_count = sum(1 for c in checks if c.status == "DANGER")

    # 3. Overall Verdict
    if danger_count == 0 and passed_count >= 5 and prediction.safety_score >= 70:
        verdict = "GO: PRIME SETUP (High Statistical Edge)"
        one_two = (
            f"PRIME SETUP DETECTED: Buy {final_shares} shares of {ticker} at ${current_price}. "
            f"Immediately place your GTC Stop-Loss at ${stop_loss} and Profit Target at ${target_price}. "
            f"If stopped out, your loss is capped at ${actual_dollar_loss}. If target hits, profit is +${actual_dollar_gain}."
        )
    elif danger_count <= 1 and passed_count >= 3:
        verdict = "CAUTION: MARGINAL SETUP (Wait for Pullback or Reduce Size)"
        one_two = (
            f"MARGINAL SETUP: {ticker} has mixed indicators. If entering, reduce position size to "
            f"{max(1, final_shares // 2)} shares or wait for a pullback closer to ${technicals.support_level} support."
        )
    else:
        verdict = "NO-GO: REJECTED (High Hazard / Unfavorable Probability)"
        one_two = (
            f"DO NOT ENTER {ticker}: Trade fails critical safety filters. Capital preservation dictates waiting "
            f"for a high-probability A+ setup rather than taking a suboptimal risk."
        )

    sizing = TradeSizing(
        recommended_shares=final_shares,
        capital_allocated=total_capital,
        capital_allocated_pct=capital_pct,
        entry_price=round(current_price, 2),
        stop_loss=round(stop_loss, 2),
        target_price=round(target_price, 2),
        max_dollar_loss=actual_dollar_loss,
        potential_dollar_gain=actual_dollar_gain,
        risk_reward_ratio=rr_ratio
    )

    return TradeCheckResponse(
        ticker=ticker,
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        current_price=round(current_price, 2),
        verdict=verdict,
        safety_score=prediction.safety_score,
        win_probability=prediction.win_probability,
        checklist_passed=passed_count,
        checklist_total=len(checks),
        checks=checks,
        sizing=sizing,
        one_two_verdict=one_two
    )
