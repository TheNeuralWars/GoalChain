"""
GBrain Learning Loop Integration
Stores trade outcomes in GBrain via MCP for continuous optimization
"""
import json
import logging
import subprocess
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)


@dataclass
class TradeRecord:
    """Complete trade record for GBrain learning"""
    market: str
    token_id: str
    entry_price: float
    exit_price: float
    size: float
    pnl: float
    reason: str  # TARGET_HIT, VOLUME_SPIKE, TIME_DECAY, REGIME_FLIP, LIQUIDATION_CASCADE, WHALE_EXIT
    timestamp: str
    kelly_fraction_at_entry: float
    regime_at_exit: str
    thesis: str
    regime_at_entry: str
    hours_held: float
    price_change_pct: float
    volume_spike_ratio: float = 0.0
    depth_drop_ratio: float = 0.0
    whale_exit_detected: bool = False


class GBrainLearning:
    """
    Integrates with GBrain via MCP for learning loop.
    Per-exit: writes {thesis, outcome, regime, PnL} to GBrain.
    Weekly: Nemotron analyzes all trades (external scheduler).
    Monthly: Auto-reoptimize thresholds (external scheduler).
    """

    def __init__(self, mcp_server: str = "gbrain", enabled: bool = True):
        self.mcp_server = mcp_server
        self.enabled = enabled
        self.trades_file = Path("trades.json")
        self._ensure_trades_file()

    def _ensure_trades_file(self) -> None:
        """Ensure trades.json exists"""
        if not self.trades_file.exists():
            self.trades_file.write_text("[]")

    def _load_trades(self) -> List[Dict]:
        """Load existing trades from file"""
        try:
            return json.loads(self.trades_file.read_text())
        except (json.JSONDecodeError, FileNotFoundError):
            return []

    def _save_trades(self, trades: List[Dict]) -> None:
        """Save trades to file"""
        self.trades_file.write_text(json.dumps(trades, indent=2))

    def record_trade(self, trade: TradeRecord) -> None:
        """Record a completed trade locally and in GBrain"""
        # Save locally
        trades = self._load_trades()
        trades.append(asdict(trade))
        self._save_trades(trades)

        logger.info(f"Recorded trade: {trade.market} {trade.reason} PnL: ${trade.pnl:+.2f}")

        # Write to GBrain via MCP
        if self.enabled:
            self._write_to_gbrain(trade)

    def _write_to_gbrain(self, trade: TradeRecord) -> bool:
        """
        Write trade outcome to GBrain via MCP.
        Uses `gbrain think` or `gbrain query` CLI.
        """
        try:
            # Prepare the learning entry
            learning_entry = {
                "type": "trade_outcome",
                "thesis": trade.thesis,
                "outcome": "profit" if trade.pnl > 0 else "loss",
                "regime_at_entry": trade.regime_at_entry,
                "regime_at_exit": trade.regime_at_exit,
                "pnl": trade.pnl,
                "pnl_pct": (trade.pnl / (trade.entry_price * trade.size)) * 100 if trade.entry_price * trade.size > 0 else 0,
                "exit_reason": trade.reason,
                "hours_held": trade.hours_held,
                "kelly_fraction": trade.kelly_fraction_at_entry,
                "market": trade.market,
                "timestamp": trade.timestamp,
                "metadata": {
                    "price_change_pct": trade.price_change_pct,
                    "volume_spike_ratio": trade.volume_spike_ratio,
                    "depth_drop_ratio": trade.depth_drop_ratio,
                    "whale_exit_detected": trade.whale_exit_detected
                }
            }

            # Use gbrain CLI to store the entry
            # Note: GBrain MCP server should be configured in ~/.hermes/config.yaml
            cmd = [
                "gbrain", "think",
                f"Store this trade outcome for learning: {json.dumps(learning_entry)}"
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

            if result.returncode == 0:
                logger.debug(f"GBrain write successful for {trade.token_id}")
                return True
            else:
                logger.warning(f"GBrain write failed: {result.stderr}")
                return False

        except subprocess.TimeoutExpired:
            logger.error("GBrain write timed out")
            return False
        except FileNotFoundError:
            logger.warning("GBrain CLI not found, skipping GBrain write")
            return False
        except Exception as e:
            logger.error(f"GBrain write error: {e}")
            return False

    def get_recent_trades(self, limit: int = 100) -> List[Dict]:
        """Get recent trades for analysis"""
        trades = self._load_trades()
        return trades[-limit:]

    def get_trades_by_reason(self, reason: str) -> List[Dict]:
        """Get all trades with a specific exit reason"""
        trades = self._load_trades()
        return [t for t in trades if t.get("reason") == reason]

    def get_trades_by_regime(self, regime: str) -> List[Dict]:
        """Get all trades in a specific regime"""
        trades = self._load_trades()
        return [t for t in trades if t.get("regime_at_exit") == regime or t.get("regime_at_entry") == regime]

    def calculate_performance_stats(self) -> Dict[str, Any]:
        """Calculate performance statistics for reporting"""
        trades = self._load_trades()
        if not trades:
            return {"total_trades": 0}

        total_pnl = sum(t.get("pnl", 0) for t in trades)
        wins = [t for t in trades if t.get("pnl", 0) > 0]
        losses = [t for t in trades if t.get("pnl", 0) <= 0]

        by_reason: Dict[str, Dict] = {}
        for t in trades:
            reason = t.get("reason", "UNKNOWN")
            if reason not in by_reason:
                by_reason[reason] = {"count": 0, "total_pnl": 0.0, "wins": 0}
            by_reason[reason]["count"] += 1
            by_reason[reason]["total_pnl"] += t.get("pnl", 0)
            if t.get("pnl", 0) > 0:
                by_reason[reason]["wins"] += 1

        for reason, stats in by_reason.items():
            stats["win_rate"] = stats["wins"] / stats["count"] if stats["count"] > 0 else 0
            stats["avg_pnl"] = stats["total_pnl"] / stats["count"] if stats["count"] > 0 else 0

        return {
            "total_trades": len(trades),
            "total_pnl": total_pnl,
            "win_rate": len(wins) / len(trades) if trades else 0,
            "avg_win": sum(t.get("pnl", 0) for t in wins) / len(wins) if wins else 0,
            "avg_loss": sum(t.get("pnl", 0) for t in losses) / len(losses) if losses else 0,
            "by_reason": by_reason,
            "best_trade": max(trades, key=lambda t: t.get("pnl", 0)) if trades else None,
            "worst_trade": min(trades, key=lambda t: t.get("pnl", 0)) if trades else None
        }

    def generate_weekly_report(self) -> str:
        """Generate weekly performance report for Nemotron analysis"""
        stats = self.calculate_performance_stats()

        report = f"""
# Weekly Polymarket Bot Performance Report
Generated: {datetime.utcnow().isoformat()}Z

## Summary
- Total Trades: {stats['total_trades']}
- Total PnL: ${stats['total_pnl']:+.2f}
- Win Rate: {stats['win_rate']:.1%}
- Avg Win: ${stats['avg_win']:+.2f}
- Avg Loss: ${stats['avg_loss']:+.2f}

## By Exit Reason
"""
        for reason, data in stats.get("by_reason", {}).items():
            report += f"- {reason}: {data['count']} trades, ${data['total_pnl']:+.2f}, {data['win_rate']:.1%} win rate\n"

        report += "\n## Recommendations for Nemotron\n"
        report += "1. Analyze win/loss patterns by regime\n"
        report += "2. Identify threshold optimizations\n"
        report += "3. Suggest Kelly fraction adjustments\n"
        report += "4. Flag any regime-specific issues\n"

        return report