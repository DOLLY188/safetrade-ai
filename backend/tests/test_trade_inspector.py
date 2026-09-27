import pytest
from app.models.schemas import TradeCheckRequest
from app.services.trade_inspector import inspect_trade

def test_trade_inspector_execution():
    req = TradeCheckRequest(
        ticker="AAPL",
        account_capital=10000.0,
        max_risk_pct=1.5
    )
    result = inspect_trade(req)
    
    assert result.ticker == "AAPL"
    assert result.current_price > 0
    assert result.checklist_total == 6
    assert 0 <= result.checklist_passed <= 6
    assert result.sizing.recommended_shares >= 0
    assert result.sizing.stop_loss < result.sizing.entry_price
    assert result.sizing.target_price > result.sizing.entry_price
    assert result.sizing.max_dollar_loss <= (10000.0 * 0.015 * 1.1)
    assert result.verdict in [
        "GO: PRIME SETUP (High Statistical Edge)",
        "CAUTION: MARGINAL SETUP (Wait for Pullback or Reduce Size)",
        "NO-GO: REJECTED (High Hazard / Unfavorable Probability)"
    ]
