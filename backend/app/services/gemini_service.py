import os
import json
import requests
from typing import Dict, Any, Optional

def analyze_with_gemini(
    ticker: str,
    question: str,
    context: Optional[Dict[str, Any]] = None
) -> str:
    """
    Queries Gemini API using GEMINI_API_KEY (from Google AI Studio free tier).
    Falls back gracefully to a structured quantitative AI reasoning response
    if no key is provided.
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    # If API key is present, invoke Google AI Studio Gemini 1.5 Flash endpoint
    if api_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            
            prompt_context = ""
            if context:
                prompt_context = f"\n\nStock Context for {ticker}:\n{json.dumps(context, indent=2)}"

            system_instruction = (
                "You are an expert quantitative trading analyst and risk manager. "
                "Provide direct, data-backed insights on stock safety, technical chart patterns, "
                "and risk management. Emphasize capital preservation, stop-loss discipline, and realistic "
                "55-65% probabilities. Keep responses concise and formatted in clean markdown bullet points."
            )

            payload = {
                "contents": [{
                    "parts": [{
                        "text": f"{system_instruction}\n\nUser Question: {question}{prompt_context}"
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 800
                }
            }

            resp = requests.post(url, json=payload, timeout=12)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return text
            else:
                print(f"Gemini API returned status {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"Gemini API request failed: {e}")

    # Fallback algorithmic analysis (no key needed)
    return generate_rule_based_analyst_answer(ticker, question, context)

def generate_rule_based_analyst_answer(
    ticker: str,
    question: str,
    context: Optional[Dict[str, Any]] = None
) -> str:
    """
    Algorithmic financial analyst synthesizer based on calculated technicals and safety metrics.
    """
    context = context or {}
    price = context.get("price", "N/A")
    safety_score = context.get("safety_score", 50)
    win_prob = context.get("win_probability", 50)
    risk_level = context.get("risk_level", "Moderate")
    rsi = context.get("rsi", 50)
    trend = context.get("trend", "Neutral")
    trade_setup = context.get("trade_setup", {})
    entry = trade_setup.get("entry_price", price)
    stop = trade_setup.get("stop_loss", "Support level")
    target = trade_setup.get("target_price", "Target level")
    rr = trade_setup.get("risk_reward_ratio", 2.0)

    q_lower = question.lower()

    if "safe" in q_lower or "safety" in q_lower or "invest" in q_lower or "buy" in q_lower:
        verdict = "**Safe / Favorable Setup**" if safety_score >= 70 else ("**Caution / Wait for Pullback**" if safety_score >= 50 else "**Elevated Risk / Avoid**")
        return (
            f"### AI Safety Assessment for {ticker.upper()}\n\n"
            f"- **Overall Verdict**: {verdict}\n"
            f"- **Safety Score**: **{safety_score}/100** | **Statistical Win Rate**: **{win_prob}%**\n"
            f"- **Trend Structure**: {trend}\n"
            f"- **RSI (14)**: {rsi} (Relative momentum)\n\n"
            f"#### Recommended Risk Management Parameters:\n"
            f"- **Execution Entry**: \${entry}\n"
            f"- **Invalidation Stop-Loss**: \${stop} (Protects capital against adverse trend breaks)\n"
            f"- **Profit Target**: \${target} (Targeting a **1:{rr}** Risk-to-Reward ratio)\n\n"
            f"> *Note: In quantitative trading, achieving 55%–65% accuracy relies on strictly cutting losses at the stop-loss while letting winners reach the 2R+ target.*"
        )
    elif "risk" in q_lower or "stop" in q_lower or "loss" in q_lower:
        return (
            f"### Risk Profile & Downside Protection for {ticker.upper()}\n\n"
            f"- **Assessed Risk Level**: {risk_level}\n"
            f"- **Calculated Stop-Loss**: \${stop}\n"
            f"- **Max Recommended Risk per Trade**: {trade_setup.get('max_risk_pct', 3.0)}%\n"
            f"- **Key Support Reference**: If the price breaks below \${stop}, the bullish edge thesis is invalidated, and positions should be closed to preserve dry powder."
        )
    else:
        return (
            f"### AI Analyst Breakdown for {ticker.upper()}\n\n"
            f"- **Current Price**: \${price}\n"
            f"- **Safety Score**: {safety_score}/100 ({risk_level})\n"
            f"- **Edge Probability**: {win_prob}% statistical historical edge\n"
            f"- **Technical Setup**: {trend} with RSI at {rsi}\n\n"
            f"**Strategic Takeaway**: {ticker.upper()} shows "
            f"{'solid accumulation characteristics suited for low-stress swing trading' if safety_score >= 65 else 'choppy or mixed signals where risk-conscious traders should remain on the sidelines or wait for clear breakout confirmation'}."
        )
