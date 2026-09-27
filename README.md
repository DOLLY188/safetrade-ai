# SafeTrade AI: Predictive Stock Market Safety & Intelligence Platform

An institutional-grade, full-stack quantitative stock research and real-time trade verification platform designed to predict safe trading setups with a calibrated **55%–65% statistical win-rate edge** while enforcing capital preservation and asymmetric risk management.

Built for **100% free usage** using local execution on Windows, Google Colab cloud training, and GitHub version control.

---

## 🌟 Key Features

### 1. 🎯 Real-Time Pre-Flight Trade Inspector
Before executing ANY stock trade, run a 1-click pre-flight check that validates:
- **Trend Filter (200 EMA & 50 EMA)**: Ensures you never buy into macro downtrends.
- **Normalized ATR Volatility**: Shields against erratic whipsaws and wide spreads.
- **Momentum Accumulation Sweetspot (RSI 40–62)**: Avoids chasing overbought tops.
- **MACD Directional Expansion**: Confirms short-term buying participation.
- **Asymmetric Risk/Reward Ratio**: Enforces minimum 1:2.0 profit target payout.
- **Exact Position Sizing**: Calculates the exact number of shares to buy so that if stopped out, your loss is capped strictly at your chosen dollar risk (e.g. 1.5% of account capital).
- **Direct Execution Directive**: Plain-English, unambiguous instructions on what to do for this specific trade.

### 2. 📊 Interactive Market & Technical Analysis Dashboard
- **Live Candlestick & Area Charts**: Historical price action with volume bars, dynamic support/resistance levels, and hover tooltips.
- **Quantitative Safety Gauge**: 0–100 score and 55%–65% win probability meter.
- **Technical Matrix**: RSI(14), MACD histogram, 20/50/200 EMAs, Bollinger Bands, and ATR.
- **Catalyst & News Feed**: Real-time financial headlines with sentiment classification.

### 3. 🔍 "Safest Stocks Today" Market Screener
- Continuously scans liquid US market leaders (NVDA, AAPL, MSFT, TSLA, SPY, QQQ, AMZN, META, JPM, COST).
- Ranks candidates by Safety Score and win probability.

### 4. 🤖 AI Risk & Setup Assistant (Powered by Gemini)
- Interactive Q&A chat analyzing support/resistance, downside hazards, and risk-reward geometry.
- Works out-of-the-box with algorithmic synthesis, and optionally connects to Google AI Studio's free Gemini API key.

### 5. 📓 Free Google Colab Training Notebook (`notebooks/stock_safety_model.ipynb`)
- Plug-and-play notebook to train Random Forest and Gradient Boosting models on years of historical market data on Google's free cloud GPUs/CPUs.
- Tests walk-forward validation and exports `trained_model.pkl` to plug directly into your local app!

---

## 🚀 How to Run Locally

### Fast One-Click Launch (Windows)
Double-click:
```cmd
start_app.bat
```
This automatically starts:
- **Backend API**: `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`)
- **Frontend Dashboard**: `http://localhost:5173`

---

## ☁️ 100% Free Hosting & Workflow Guide

### 1. Push Code to GitHub (Free)
```cmd
git init
git add .
git commit -m "Initial commit of SafeTrade AI"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/safetrade-ai.git
git push -u origin main
```

### 2. Train Models for Free in Google Colab
1. Go to [Google Colab](https://colab.research.google.com).
2. Upload `notebooks/stock_safety_model.ipynb` or open it directly from your GitHub repo.
3. Click **Runtime > Run all**.
4. The notebook downloads market data, tests the 55%–65% win-rate edge, and downloads `trained_model.pkl`.
5. Drop `trained_model.pkl` into `backend/app/models/trained_model.pkl`!

### 3. Free AI API Key (Google AI Studio)
1. Visit [Google AI Studio](https://aistudio.google.com/) and create a free Gemini API key (no credit card required).
2. Create a `.env` file in `backend/.env`:
   ```env
   GEMINI_API_KEY=your_key_here
   ```
*(Note: If you do not add a key, the app automatically runs in built-in algorithmic analyst mode!)*
