import pytest
import pandas as pd
import numpy as np
from app.services.technical_engine import calculate_technicals
from app.services.safety_model import evaluate_safety

@pytest.fixture
def sample_bullish_chart():
    # Construct an ascending series with low volatility
    dates = pd.date_range(start="2023-01-01", periods=120, freq='B')
    close = np.linspace(100, 180, 120) + np.random.normal(0, 0.5, 120)
    high = close + 1.0
    low = close - 1.0
    opens = close - 0.2
    vol = np.full(120, 2000000)
    
    return pd.DataFrame({
        'Open': opens,
        'High': high,
        'Low': low,
        'Close': close,
        'Volume': vol
    }, index=dates)

def test_evaluate_safety_bounds(sample_bullish_chart):
    technicals = calculate_technicals(sample_bullish_chart)
    curr_price = float(sample_bullish_chart['Close'].iloc[-1])
    pred = evaluate_safety("TEST", sample_bullish_chart, technicals, curr_price)
    
    # Check Safety Score boundaries
    assert 0 <= pred.safety_score <= 100
    
    # Check Win Probability boundaries (must fall in the calibrated realistic statistical range)
    assert 40.0 <= pred.win_probability <= 68.0
    
    # Check Trade Setup validity
    assert pred.trade_setup.stop_loss < pred.trade_setup.entry_price
    assert pred.trade_setup.target_price > pred.trade_setup.entry_price
    assert pred.trade_setup.risk_reward_ratio >= 1.5
    assert pred.trade_setup.potential_gain_pct > 0
    assert pred.trade_setup.max_risk_pct > 0
