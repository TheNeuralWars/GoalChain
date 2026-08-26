#!/usr/bin/env python3
"""
GoalWorld Trading Simulator v2.0
Production-ready paper trading engine with $500 virtual capital.
Uses Binance public REST API for real market data.
Features: 4 strategies, realistic execution, SQLite persistence, git logging.
"""

import json
import math
import os
import sqlite3
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

# ─── Configuration ───────────────────────────────────────────────────────────

BASE_DIR = Path("/data/apps/GoalChain/ops/trading-sim")
DB_PATH = BASE_DIR / "trades.db"
LOG_PATH = BASE_DIR / "trades.jsonl"
REPORT_DIR = BASE_DIR / "reports"

START_EQUITY = 500.0

STRATEGIES = {
    "trend_following": {
        "allocation_pct": 35,  # $175
        "symbols": ["BTCUSDT", "ETHUSDT", "SOLUSDT"],
        "timeframe": "1h",
        "func": "strategy_trend_following",
        "enabled": True,
    },
    "mean_reversion": {
        "allocation_pct": 25,  # $125
        "symbols": ["BTCUSDT", "ETHUSDT"],
        "timeframe": "15m",
        "func": "strategy_mean_reversion",
        "enabled": True,
    },
    "breakout": {
        "allocation_pct": 25,  # $125
        "symbols": ["SOLUSDT", "ETHUSDT", "BTCUSDT"],
        "timeframe": "1h",
        "func": "strategy_breakout",
        "enabled": True,
    },
    "momentum": {
        "allocation_pct": 15,  # $75
        "symbols": ["SOLUSDT", "ETHUSDT"],
        "timeframe": "15m",
        "func": "strategy_momentum",
        "enabled": True,
    },
}

# Risk parameters
STOP_LOSS_PCT = 0.02      # 2%
TAKE_PROFIT_PCT = 0.03    # 3%
MAX_POSITION_PCT = 0.20   # 20% of strategy capital per position
MAX_OPEN_PER_STRATEGY = 3
MAX_DAILY_LOSS_PCT = 0.05  # 5% per strategy per day
MAX_DRAWDOWN_PCT = 0.10   # 10% global

# Execution realism
FEE_MAKER = 0.0002  # 0.02%
FEE_TAKER = 0.001   # 0.10%
SLIPPAGE_BPS = 5    # 0.05%

# ─── Database ────────────────────────────────────────────────────────────────

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS trades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ts TEXT NOT NULL,
            strategy TEXT NOT NULL,
            symbol TEXT NOT NULL,
            side TEXT NOT NULL,
            entry_px REAL NOT NULL,
            exit_px REAL,
            size REAL NOT NULL,
            notional REAL NOT NULL,
            fee_usd REAL NOT NULL,
            slippage_usd REAL NOT NULL,
            pnl_gross REAL,
            pnl_net REAL,
            status TEXT DEFAULT 'open',
            close_reason TEXT,
            opened_ts TEXT NOT NULL,
            closed_ts TEXT
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS equity_snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ts TEXT NOT NULL,
            strategy TEXT,
            equity REAL NOT NULL,
            cash REAL NOT NULL,
            positions_value REAL NOT NULL,
            total_equity REAL NOT NULL
        )
    """)
    conn.commit()
    return conn


# ─── Market Data ─────────────────────────────────────────────────────────────

_price_cache = {}

def fetch_price(symbol):
    """Fetch current price from Binance public API with caching."""
    now = time.time()
    if symbol in _price_cache:
        ts, price = _price_cache[symbol]
        if now - ts < 30:
            return price
    
    url = f"https://api.binance.com/api/v3/ticker/price?symbol={symbol}"
    req = urllib.request.Request(url, headers={"User-Agent": "goalworld-trading-sim/2.0"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            price = float(data["price"])
            _price_cache[symbol] = (now, price)
            return price
    except Exception as e:
        print(f"[WARN] Price fetch failed for {symbol}: {e}")
        return None


def fetch_klines(symbol, interval="1h", limit=100):
    """Fetch OHLCV klines from Binance."""
    url = f"https://api.binance.com/api/v3/klines?symbol={symbol}&interval={interval}&limit={limit}"
    req = urllib.request.Request(url, headers={"User-Agent": "goalworld-trading-sim/2.0"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = json.loads(resp.read().decode())
        rows = []
        for k in raw:
            rows.append({
                "open_time": k[0],
                "open": float(k[1]),
                "high": float(k[2]),
                "low": float(k[3]),
                "close": float(k[4]),
                "volume": float(k[5]),
                "close_time": k[6],
            })
        return rows
    except Exception as e:
        print(f"[WARN] Klines fetch failed for {symbol}: {e}")
        return []


def fetch_orderbook_top(symbol):
    """Fetch best bid/ask from Binance."""
    url = f"https://api.binance.com/api/v3/ticker/bookTicker?symbol={symbol}"
    req = urllib.request.Request(url, headers={"User-Agent": "goalworld-trading-sim/2.0"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
        return float(data["bidPrice"]), float(data["askPrice"])
    except Exception:
        return None, None


# ─── Strategy Logic ──────────────────────────────────────────────────────────

def calc_sma(closes, period):
    if len(closes) < period:
        return None
    return sum(closes[-period:]) / period


def strategy_trend_following(symbol):
    """
    Trend following using SMA crossover + momentum.
    Returns: ("long"|"short"|"flat", confidence)
    """
    klines = fetch_klines(symbol, "1h", 100)
    if len(klines) < 60:
        return "flat", 0.0
    
    closes = [k["close"] for k in klines]
    sma20 = calc_sma(closes, 20)
    sma50 = calc_sma(closes, 50)
    mom10 = closes[-1] / closes[-11] - 1 if len(closes) >= 11 else 0
    
    score = 0.5
    if closes[-1] > sma20:
        score += 0.15
    else:
        score -= 0.15
    
    if sma20 > sma50:
        score += 0.10
    else:
        score -= 0.10
    
    score += max(-0.15, min(0.15, mom10 * 2))
    
    conf = max(0.0, min(1.0, score))
    
    if conf >= 0.65:
        return "long", round(conf, 3)
    elif conf <= 0.35:
        return "short", round(1 - conf, 3)
    return "flat", 0.0


def strategy_mean_reversion(symbol):
    """
    Mean reversion using Bollinger Bands.
    Returns: ("long"|"short"|"flat", confidence)
    """
    klines = fetch_klines(symbol, "15m", 100)
    if len(klines) < 30:
        return "flat", 0.0
    
    closes = [k["close"] for k in klines]
    sma20 = calc_sma(closes, 20)
    std20 = math.sqrt(sum((c - sma20) ** 2 for c in closes[-20:]) / 20)
    
    upper = sma20 + 2 * std20
    lower = sma20 - 2 * std20
    
    price = closes[-1]
    
    if price < lower:
        conf = min(1.0, (lower - price) / std20 + 0.5)
        return "long", round(conf, 3)
    elif price > upper:
        conf = min(1.0, (price - upper) / std20 + 0.5)
        return "short", round(conf, 3)
    
    return "flat", 0.0


def strategy_breakout(symbol):
    """
    Breakout using Donchian Channels.
    Returns: ("long"|"short"|"flat", confidence)
    """
    klines = fetch_klines(symbol, "1h", 50)
    if len(klines) < 25:
        return "flat", 0.0
    
    highs = [k["high"] for k in klines]
    lows = [k["low"] for k in klines]
    
    period = 20
    highest_high = max(highs[-period:-1])
    lowest_low = min(lows[-period:-1])
    
    price = klines[-1]["close"]
    
    if price > highest_high:
        conf = min(1.0, (price - highest_high) / (highest_high - lowest_low + 1e-9) + 0.5)
        return "long", round(conf, 3)
    elif price < lowest_low:
        conf = min(1.0, (lowest_low - price) / (highest_high - lowest_low + 1e-9) + 0.5)
        return "short", round(conf, 3)
    
    return "flat", 0.0


def strategy_momentum(symbol):
    """
    Momentum using RSI-like calculation on 15m.
    Returns: ("long"|"short"|"flat", confidence)
    """
    klines = fetch_klines(symbol, "15m", 100)
    if len(klines) < 30:
        return "flat", 0.0
    
    closes = [k["close"] for k in klines]
    
    # Calculate RSI (14-period)
    gains = []
    losses = []
    for i in range(1, min(15, len(closes))):
        change = closes[-i] - closes[-i-1]
        if change > 0:
            gains.append(change)
            losses.append(0)
        else:
            gains.append(0)
            losses.append(abs(change))
    
    avg_gain = sum(gains) / len(gains) if gains else 0
    avg_loss = sum(losses) / len(losses) if losses else 0.001
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    
    if rsi < 30:
        # Oversold → long
        conf = min(1.0, (30 - rsi) / 30 + 0.4)
        return "long", round(conf, 3)
    elif rsi > 70:
        # Overbought → short
        conf = min(1.0, (rsi - 70) / 30 + 0.4)
        return "short", round(conf, 3)
    
    return "flat", 0.0


STRATEGY_FUNCS = {
    "trend_following": strategy_trend_following,
    "mean_reversion": strategy_mean_reversion,
    "breakout": strategy_breakout,
    "momentum": strategy_momentum,
}


# ─── Portfolio Management ────────────────────────────────────────────────────

def get_strategy_capital(strategy_name):
    """Get allocated capital for a strategy."""
    return START_EQUITY * STRATEGIES[strategy_name]["allocation_pct"] / 100


def get_open_positions(strategy_name):
    """Get open positions for a strategy."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "SELECT id, ts, strategy, symbol, side, entry_px, size, notional, opened_ts FROM trades WHERE strategy = ? AND status = 'open'",
        (strategy_name,)
    )
    positions = []
    for row in c.fetchall():
        positions.append({
            "id": row[0],
            "ts": row[1],
            "strategy": row[2],
            "symbol": row[3],
            "side": row[4],
            "entry_px": row[5],
            "size": row[6],
            "notional": row[7],
            "opened_ts": row[8],
        })
    conn.close()
    return positions


def get_strategy_equity(strategy_name):
    """Calculate current equity for a strategy."""
    allocated = get_strategy_capital(strategy_name)
    positions = get_open_positions(strategy_name)
    
    positions_value = 0.0
    for pos in positions:
        current_px = fetch_price(pos["symbol"])
        if current_px:
            if pos["side"] == "long":
                positions_value += pos["size"] * current_px
            else:
                positions_value += pos["size"] * (2 * pos["entry_px"] - current_px)
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "SELECT COALESCE(SUM(pnl_net), 0) FROM trades WHERE strategy = ? AND status = 'closed'",
        (strategy_name,)
    )
    realized = c.fetchone()[0] or 0.0
    conn.close()
    
    cash = allocated + realized - sum(p.get("notional", 0) or 0 for p in positions)
    total = cash + positions_value
    
    return {
        "allocated": allocated,
        "cash": round(cash, 4),
        "positions_value": round(positions_value, 4),
        "realized_pnl": round(realized, 4),
        "total_equity": round(total, 4),
    }


def get_total_equity():
    """Calculate total equity across all strategies."""
    total = 0.0
    for name in STRATEGIES:
        eq = get_strategy_equity(name)
        total += eq["total_equity"]
    return round(total, 4)


def check_risk_limits(strategy_name):
    """Check if strategy can open new positions."""
    equity = get_strategy_equity(strategy_name)
    
    positions = get_open_positions(strategy_name)
    if len(positions) >= MAX_OPEN_PER_STRATEGY:
        return False, "max_positions_reached"
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "SELECT COALESCE(SUM(pnl_net), 0) FROM trades WHERE strategy = ? AND status = 'closed' AND closed_ts LIKE ?",
        (strategy_name, f"{today}%")
    )
    daily_pnl = c.fetchone()[0] or 0.0
    conn.close()
    
    if daily_pnl < -equity["allocated"] * MAX_DAILY_LOSS_PCT:
        return False, "daily_loss_limit"
    
    total_eq = get_total_equity()
    if total_eq < START_EQUITY * (1 - MAX_DRAWDOWN_PCT):
        return False, "global_drawdown"
    
    return True, "ok"


# ─── Execution ────────────────────────────────────────────────────────────────

def execute_trade(strategy_name, symbol, side, confidence):
    """Execute a paper trade with realistic fees and slippage."""
    bid, ask = fetch_orderbook_top(symbol)
    if bid is None or ask is None:
        return None
    
    slippage_pct = SLIPPAGE_BPS / 10000
    if side == "long":
        entry_px = ask * (1 + slippage_pct)
    else:
        entry_px = bid * (1 - slippage_pct)
    
    equity = get_strategy_equity(strategy_name)
    max_notional = equity["total_equity"] * MAX_POSITION_PCT
    notional = min(max_notional, equity["cash"] * 0.95)
    
    if notional < 10:
        return None
    
    size = notional / entry_px
    fee = notional * FEE_TAKER
    slippage_usd = notional * slippage_pct
    
    now = datetime.now(timezone.utc).isoformat()
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        INSERT INTO trades (ts, strategy, symbol, side, entry_px, size, notional, fee_usd, slippage_usd, status, opened_ts)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)
    """, (now, strategy_name, symbol, side, entry_px, size, notional, fee, slippage_usd, now))
    conn.commit()
    trade_id = c.lastrowid
    conn.close()
    
    log_entry = {
        "event": "OPEN",
        "ts": now,
        "trade_id": trade_id,
        "strategy": strategy_name,
        "symbol": symbol,
        "side": side,
        "entry_px": entry_px,
        "size": round(size, 8),
        "notional": round(notional, 4),
        "fee_usd": round(fee, 6),
        "slippage_usd": round(slippage_usd, 6),
        "confidence": confidence,
    }
    with open(LOG_PATH, "a") as f:
        f.write(json.dumps(log_entry) + "\n")
    
    return log_entry


def close_trade(trade_id, reason):
    """Close an open trade."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, strategy, symbol, side, entry_px, size, notional FROM trades WHERE id = ?", (trade_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        return None
    
    symbol = row[2]
    side = row[3]
    entry_px = row[4]
    size = row[5]
    notional = row[6]
    
    bid, ask = fetch_orderbook_top(symbol)
    if bid is None:
        conn.close()
        return None
    
    slippage_pct = SLIPPAGE_BPS / 10000
    if side == "long":
        exit_px = bid * (1 - slippage_pct)
        pnl_gross = (exit_px - entry_px) * size
    else:
        exit_px = ask * (1 + slippage_pct)
        pnl_gross = (entry_px - exit_px) * size
    
    exit_notional = size * exit_px
    fee = exit_notional * FEE_TAKER
    slippage_usd = exit_notional * slippage_pct
    pnl_net = pnl_gross - fee - slippage_usd - (notional * FEE_MAKER)
    
    now = datetime.now(timezone.utc).isoformat()
    
    c.execute("""
        UPDATE trades SET
            exit_px = ?, pnl_gross = ?, pnl_net = ?, status = 'closed',
            close_reason = ?, closed_ts = ?
        WHERE id = ?
    """, (exit_px, pnl_gross, pnl_net, reason, now, trade_id))
    conn.commit()
    conn.close()
    
    log_entry = {
        "event": "CLOSE",
        "ts": now,
        "trade_id": trade_id,
        "strategy": row[1],
        "symbol": symbol,
        "side": side,
        "entry_px": entry_px,
        "exit_px": exit_px,
        "size": round(size, 8),
        "pnl_gross": round(pnl_gross, 4),
        "pnl_net": round(pnl_net, 4),
        "fee_usd": round(fee, 6),
        "slippage_usd": round(slippage_usd, 6),
        "reason": reason,
    }
    with open(LOG_PATH, "a") as f:
        f.write(json.dumps(log_entry) + "\n")
    
    return log_entry


def check_exit_conditions():
    """Check all open positions for stop loss / take profit / horizon exits."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, strategy, symbol, side, entry_px, size, opened_ts FROM trades WHERE status = 'open'")
    open_trades = c.fetchall()
    conn.close()
    
    closed = []
    for row in open_trades:
        trade_id = row[0]
        strategy = row[1]
        symbol = row[2]
        side = row[3]
        entry_px = row[4]
        size = row[5]
        opened_ts = row[6]
        
        current_px = fetch_price(symbol)
        if not current_px:
            continue
        
        if side == "long":
            unrealized_pct = (current_px - entry_px) / entry_px
        else:
            unrealized_pct = (entry_px - current_px) / entry_px
        
        if unrealized_pct <= -STOP_LOSS_PCT:
            result = close_trade(trade_id, "stop_loss")
            if result:
                closed.append(result)
            continue
        
        if unrealized_pct >= TAKE_PROFIT_PCT:
            result = close_trade(trade_id, "take_profit")
            if result:
                closed.append(result)
            continue
        
        try:
            opened_dt = datetime.fromisoformat(opened_ts.replace("Z", "+00:00"))
            held_hours = (datetime.now(timezone.utc) - opened_dt).total_seconds() / 3600
            if held_hours >= 8:
                result = close_trade(trade_id, "horizon")
                if result:
                    closed.append(result)
                continue
        except Exception:
            pass
    
    return closed


# ─── Main Loop ───────────────────────────────────────────────────────────────

def run_tick():
    """Run one tick of the trading engine."""
    now = datetime.now(timezone.utc)
    print(f"\n{'='*60}")
    print(f"Tick at {now.strftime('%Y-%m-%d %H:%M:%S')} UTC")
    print(f"{'='*60}")
    
    closed = check_exit_conditions()
    if closed:
        print(f"Closed {len(closed)} positions")
        for c in closed:
            print(f"  {c['strategy']} {c['symbol']} {c['side']}: PnL ${c['pnl_net']:+.4f} ({c['reason']})")
    
    for name, config in STRATEGIES.items():
        if not config["enabled"]:
            continue
        
        can_trade, reason = check_risk_limits(name)
        if not can_trade:
            print(f"[{name}] Risk limit: {reason}")
            continue
        
        equity = get_strategy_equity(name)
        print(f"[{name}] Equity: ${equity['total_equity']:.2f} (cash: ${equity['cash']:.2f})")
        
        for symbol in config["symbols"]:
            positions = get_open_positions(name)
            if any(p["symbol"] == symbol for p in positions):
                continue
            
            func = STRATEGY_FUNCS[name]
            side, confidence = func(symbol)
            
            if side == "flat" or confidence < 0.55:
                continue
            
            result = execute_trade(name, symbol, side, confidence)
            if result:
                print(f"  OPEN {side.upper()} {symbol} @ {result['entry_px']:.4f} "
                      f"size={result['size']:.6f} notional=${result['notional']:.2f} "
                      f"conf={confidence:.2f}")
    
    snapshot_equity()
    
    total = get_total_equity()
    ret_pct = (total / START_EQUITY - 1) * 100
    print(f"\nTotal Equity: ${total:.2f} ({ret_pct:+.2f}%)")


def snapshot_equity():
    """Save equity snapshot."""
    now = datetime.now(timezone.utc).isoformat()
    total = 0.0
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    for name in STRATEGIES:
        eq = get_strategy_equity(name)
        total += eq["total_equity"]
        c.execute("""
            INSERT INTO equity_snapshots (ts, strategy, equity, cash, positions_value, total_equity)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (now, name, eq["total_equity"], eq["cash"], eq["positions_value"], eq["total_equity"]))
    
    c.execute("""
        INSERT INTO equity_snapshots (ts, strategy, equity, cash, positions_value, total_equity)
        VALUES (?, 'TOTAL', ?, ?, ?, ?)
    """, (now, total, total, 0.0, total))
    
    conn.commit()
    conn.close()


def generate_report():
    """Generate a comprehensive report."""
    now = datetime.now(timezone.utc)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute("SELECT COUNT(*), COALESCE(SUM(pnl_net), 0) FROM trades WHERE status = 'closed'")
    total_closed, total_pnl = c.fetchone()
    total_pnl = total_pnl or 0.0
    
    c.execute("SELECT COUNT(*) FROM trades WHERE status = 'open'")
    total_open = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*), COALESCE(SUM(pnl_net), 0) FROM trades WHERE status = 'closed' AND pnl_net > 0")
    winners, win_pnl = c.fetchone()
    win_pnl = win_pnl or 0.0
    
    c.execute("SELECT COUNT(*), COALESCE(SUM(pnl_net), 0) FROM trades WHERE status = 'closed' AND pnl_net < 0")
    losers, loss_pnl = c.fetchone()
    loss_pnl = loss_pnl or 0.0
    
    c.execute("SELECT COALESCE(SUM(fee_usd), 0), COALESCE(SUM(slippage_usd), 0) FROM trades")
    total_fees, total_slippage = c.fetchone()
    total_fees = total_fees or 0.0
    total_slippage = total_slippage or 0.0
    
    conn.close()
    
    total_equity = get_total_equity()
    ret_pct = (total_equity / START_EQUITY - 1) * 100
    win_rate = (winners / total_closed * 100) if total_closed > 0 else 0
    profit_factor = abs(win_pnl / loss_pnl) if loss_pnl != 0 else float('inf')
    
    report = f"""# GoalWorld Trading Simulator — Live Report
**{now.strftime('%Y-%m-%d %H:%M:%S')} UTC**

## Portfolio Summary
- **Starting Capital:** ${START_EQUITY:.2f}
- **Current Equity:** ${total_equity:.2f}
- **Return:** {ret_pct:+.2f}%
- **Total P&L:** ${total_pnl:+.4f}
- **Total Fees:** ${total_fees:.4f}
- **Total Slippage:** ${total_slippage:.4f}

## Trade Statistics
- **Total Opens:** {total_closed + total_open}
- **Total Closes:** {total_closed}
- **Open Positions:** {total_open}
- **Win Rate:** {win_rate:.1f}%
- **Profit Factor:** {profit_factor:.2f}

## Per Strategy
"""
    
    for name in STRATEGIES:
        eq = get_strategy_equity(name)
        report += f"""### {name}
- Equity: ${eq['total_equity']:.2f} (from ${eq['allocated']:.2f})
- Cash: ${eq['cash']:.2f}
- Positions Value: ${eq['positions_value']:.2f}
- Realized P&L: ${eq['realized_pnl']:+.4f}

"""
    
    report += f"\n---\n*Generated by trading-sim v2.0*"
    
    report_path = REPORT_DIR / f"report_{now.strftime('%Y%m%d_%H%M')}.md"
    report_path.write_text(report)
    
    latest_path = REPORT_DIR / "latest.md"
    latest_path.write_text(report)
    
    return report


if __name__ == "__main__":
    import sys
    
    BASE_DIR.mkdir(parents=True, exist_ok=True)
    init_db()
    
    if len(sys.argv) > 1 and sys.argv[1] == "report":
        generate_report()
    else:
        run_tick()