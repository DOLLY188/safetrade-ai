import os
import json
import time
import requests
import asyncio
from datetime import datetime
from typing import List, Dict, Any, Optional
from ..models.schemas import (
    AutonomousSignal,
    AutonomousSettings,
    TradeCheckRequest
)
from .trade_inspector import inspect_trade

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
SIGNALS_FILE = os.path.join(DATA_DIR, "signals_history.json")
SETTINGS_FILE = os.path.join(DATA_DIR, "settings.json")

WATCHLIST = [
    ("NVDA", "NVIDIA Corp."),
    ("AAPL", "Apple Inc."),
    ("MSFT", "Microsoft Corp."),
    ("AMZN", "Amazon.com Inc."),
    ("GOOGL", "Alphabet Inc."),
    ("META", "Meta Platforms"),
    ("TSLA", "Tesla Inc."),
    ("AMD", "Advanced Micro Devices"),
    ("JPM", "JPMorgan Chase & Co."),
    ("SPY", "SPDR S&P 500 ETF"),
    ("QQQ", "Invesco QQQ Trust"),
    ("COST", "Costco Wholesale")
]

def ensure_data_dir():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(SIGNALS_FILE):
        with open(SIGNALS_FILE, "w") as f:
            json.dump([], f)
    if not os.path.exists(SETTINGS_FILE):
        default_settings = {
            "enabled": True,
            "scan_interval_minutes": 15,
            "account_capital": 10000.0,
            "max_risk_pct": 1.5,
            "webhook_url": ""
        }
        with open(SETTINGS_FILE, "w") as f:
            json.dump(default_settings, f, indent=2)

def load_settings() -> AutonomousSettings:
    ensure_data_dir()
    try:
        with open(SETTINGS_FILE, "r") as f:
            data = json.load(f)
            return AutonomousSettings(**data)
    except Exception:
        return AutonomousSettings()

def save_settings(settings: AutonomousSettings):
    ensure_data_dir()
    with open(SETTINGS_FILE, "w") as f:
        json.dump(settings.model_dump(), f, indent=2)

def load_signals() -> List[AutonomousSignal]:
    ensure_data_dir()
    try:
        with open(SIGNALS_FILE, "r") as f:
            data = json.load(f)
            return [AutonomousSignal(**item) for item in data]
    except Exception:
        return []

def save_signals(signals: List[AutonomousSignal]):
    ensure_data_dir()
    with open(SIGNALS_FILE, "w") as f:
        json.dump([s.model_dump() for s in signals[-50:]], f, indent=2) # Keep last 50 signals

def send_webhook_alert(webhook_url: str, signal: AutonomousSignal):
    if not webhook_url or not webhook_url.startswith("http"):
        return

    payload = {
        "content": f"🚨 **SafeTrade AI: Autonomous Signal Detected!**\n"
                   f"**{signal.ticker}** passes all 6 safety checks with **{signal.win_probability}%** win-rate edge!\n"
                   f"• **Current Price**: ${signal.price}\n"
                   f"• **Buy Quantity**: {signal.recommended_shares} Shares\n"
                   f"• **Stop Loss**: ${signal.stop_loss} (Max Risk: -${signal.max_dollar_loss})\n"
                   f"• **Target Price**: ${signal.target_price} (Target Profit: +${signal.potential_dollar_gain})\n"
                   f"• **Risk/Reward**: 1:{signal.risk_reward_ratio}\n"
                   f"*{signal.verdict}*"
    }
    try:
        requests.post(webhook_url, json=payload, timeout=8)
    except Exception as e:
        print(f"Webhook notification error: {e}")

def run_single_scan_cycle() -> List[AutonomousSignal]:
    """
    Scans the watchlist, evaluates real-time market data,
    and returns newly detected safe setups.
    """
    settings = load_settings()
    existing_signals = load_signals()
    existing_keys = {f"{s.ticker}_{s.timestamp[:10]}" for s in existing_signals}

    new_signals: List[AutonomousSignal] = []

    for ticker, name in WATCHLIST:
        try:
            req = TradeCheckRequest(
                ticker=ticker,
                account_capital=settings.account_capital,
                max_risk_pct=settings.max_risk_pct
            )
            res = inspect_trade(req)

            # Signal Trigger Criteria: Must have safety score >= 68 and 0 DANGER checks
            has_danger = any(c.status == "DANGER" for c in res.checks)
            if not has_danger and res.safety_score >= 68.0:
                sig_id = f"{ticker}_{int(time.time())}"
                sig_key = f"{ticker}_{res.timestamp[:10]}"

                signal = AutonomousSignal(
                    id=sig_id,
                    timestamp=res.timestamp,
                    ticker=ticker,
                    name=name,
                    price=res.current_price,
                    safety_score=res.safety_score,
                    win_probability=res.win_probability,
                    recommended_shares=res.sizing.recommended_shares,
                    stop_loss=res.sizing.stop_loss,
                    target_price=res.sizing.target_price,
                    risk_reward_ratio=res.sizing.risk_reward_ratio,
                    max_dollar_loss=res.sizing.max_dollar_loss,
                    potential_dollar_gain=res.sizing.potential_dollar_gain,
                    verdict=res.one_two_verdict,
                    status="ACTIVE"
                )

                if sig_key not in existing_keys:
                    new_signals.append(signal)
                    existing_signals.insert(0, signal)
                    if settings.webhook_url:
                        send_webhook_alert(settings.webhook_url, signal)
        except Exception as e:
            print(f"Autonomous scan error on {ticker}: {e}")
            continue

    if new_signals:
        save_signals(existing_signals)

    return new_signals

async def background_autonomous_worker():
    """
    Continuous background loop that periodically scans the market.
    """
    while True:
        try:
            settings = load_settings()
            if settings.enabled:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Autonomous engine executing market scan...")
                run_single_scan_cycle()
            interval_secs = max(60, settings.scan_interval_minutes * 60)
            await asyncio.sleep(interval_secs)
        except Exception as e:
            print(f"Autonomous background worker loop error: {e}")
            await asyncio.sleep(60)
