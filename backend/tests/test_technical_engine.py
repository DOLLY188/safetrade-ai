import pytest
import pandas as pd
import numpy as np
from app.services.technical_engine import calculate_rsi, calculate_macd, calculate_atr, calculate_technicals

@pytest.fixture
def sample_ohlcv_data():
    dates = pd.date_range(start="2023-01-01", periods=100, freq='B')
    np.random.seed(42)
    close = 150.0 + np.cumsum(np.random.normal(0.2, 1.5, 100))
    high = close + np.random.uniform(0.5, 2.0, 100)
    low = close - np.random.uniform(0.5, 2.0, 100)
    opens = (high + low) / 2
    volume = np.random.randint(1000000, 5000000, 100)

    return pd.DataFrame({
        'Open': opens,
        'High': high,
        'Low': low,
        'Close': close,
        'Volume': volume
    }, index=dates)

def test_calculate_rsi(sample_ohlcv_data):
    rsi = calculate_rsi(sample_ohlcv_data['Close'], period=14)
    assert len(rsi) == len(sample_ohlcv_data)
    last_rsi = rsi.iloc[-1]
    assert 0 <= last_rsi <= 100

def test_calculate_macd(sample_ohlcv_data):
    macd, signal, hist = calculate_macd(sample_ohlcv_data['Close'])
    assert len(macd) == len(sample_ohlcv_data)
    assert not np.isnan(macd.iloc[-1])
    assert not np.isnan(signal.iloc[-1])
    assert not np.isnan(hist.iloc[-1])

def test_calculate_atr(sample_ohlcv_data):
    atr = calculate_atr(sample_ohlcv_data, period=14)
    assert len(atr) == len(sample_ohlcv_data)
    last_atr = atr.iloc[-1]
    assert last_atr > 0

def test_calculate_technicals(sample_ohlcv_data):
    techs = calculate_technicals(sample_ohlcv_data)
    assert 0 <= techs.rsi_14 <= 100
    assert techs.sma_20 > 0
    assert techs.ema_20 > 0
    assert techs.bollinger_upper >= techs.bollinger_lower
    assert techs.support_level <= techs.resistance_level
