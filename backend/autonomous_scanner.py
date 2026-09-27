"""
SafeTrade AI - Standalone Autonomous Market Scanner
Run on schedule via GitHub Actions, cron, or local task scheduler.
"""
import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.autonomous_engine import run_single_scan_cycle, load_signals

def main():
    print("==================================================")
    print("   SafeTrade AI: Autonomous 24/7 Market Scanner   ")
    print("==================================================")
    
    new_signals = run_single_scan_cycle()
    print(f"Scan finished. New high-probability safe setups detected: {len(new_signals)}")
    for s in new_signals:
        print(f" -> [{s.ticker}] Score: {s.safety_score}/100 | Win Rate: {s.win_probability}% | Buy {s.recommended_shares} shares @ ${s.price}")
    
    total = len(load_signals())
    print(f"Total active signals recorded in database: {total}")

if __name__ == "__main__":
    main()
