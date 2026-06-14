"""
Regime Detector for Polymarket Bot.

Detects market regime changes that invalidate standard trading edges:
- Volume anomalies (spikes)
- Whale dumps (smart money exiting)
- News shocks (macro/breaking events)
- Liquidation cascades (orderbook collapse)
"""

import json
from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from enum import Enum
from datetime import datetime, timezone, timedelta


class RegimeAction(str, Enum):
    CONTINUE = "continue"
    REDUCE_KELLY = "reduce_kelly"
    KILL_SWITCH = "kill_switch"


@dataclass
class RegimeSignal:
    name: str
    severity: RegimeAction
    description: str
    confidence: float


@dataclass
class RegimeCheckResult:
    market_flipped: bool
    confidence: float
    action: RegimeAction
    signals: List[str]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "market_flipped": self.market_flipped,
            "confidence": self.confidence,
            "action": self.action.value,
            "signals": self.signals,
        }


# Signal definitions with severity
REGIME_SIGNALS = {
    # Volume signals
    "volume_spike_2x": RegimeSignal(
        name="volume_spike_2x",
        severity=RegimeAction.REDUCE_KELLY,
        description="24h volume > 2x average 24h volume",
        confidence=0.75,
    ),
    "volume_spike_5x": RegimeSignal(
        name="volume_spike_5x",
        severity=RegimeAction.KILL_SWITCH,
        description="24h volume > 5x average 24h volume",
        confidence=0.90,
    ),
    "volume_spike_10x": RegimeSignal(
        name="volume_spike_10x",
        severity=RegimeAction.KILL_SWITCH,
        description="24h volume > 10x average 24h volume - extreme anomaly",
        confidence=0.95,
    ),
    # Whale signals
    "whale_dump_detected": RegimeSignal(
        name="whale_dump_detected",
        severity=RegimeAction.REDUCE_KELLY,
        description=">2 target wallets exiting same position",
        confidence=0.80,
    ),
    "whale_dump_mass": RegimeSignal(
        name="whale_dump_mass",
        severity=RegimeAction.KILL_SWITCH,
        description=">5 target wallets exiting - coordinated smart money exit",
        confidence=0.92,
    ),
    "whale_accumulation": RegimeSignal(
        name="whale_accumulation",
        severity=RegimeAction.CONTINUE,
        description="Target wallets accumulating - bullish signal",
        confidence=0.70,
    ),
    # News signals
    "news_shock_CPI": RegimeSignal(
        name="news_shock_CPI",
        severity=RegimeAction.REDUCE_KELLY,
        description="CPI/FOMC/major macro release in last 2 hours",
        confidence=0.85,
    ),
    "news_shock_major": RegimeSignal(
        name="news_shock_major",
        severity=RegimeAction.KILL_SWITCH,
        description="Major geopolitical/black swan event (war, crash, etc.)",
        confidence=0.95,
    ),
    "news_shock_crypto": RegimeSignal(
        name="news_shock_crypto",
        severity=RegimeAction.REDUCE_KELLY,
        description="Major crypto-specific news (ETF, hack, regulation)",
        confidence=0.75,
    ),
    # Orderbook signals
    "liquidation_cascade": RegimeSignal(
        name="liquidation_cascade",
        severity=RegimeAction.KILL_SWITCH,
        description="Orderbook depth drop >50% in 1 minute",
        confidence=0.93,
    ),
    "orderbook_thinning": RegimeSignal(
        name="orderbook_thinning",
        severity=RegimeAction.REDUCE_KELLY,
        description="Orderbook depth drop >25% in 5 minutes",
        confidence=0.70,
    ),
    # Price action signals
    "price_gap_break": RegimeSignal(
        name="price_gap_break",
        severity=RegimeAction.REDUCE_KELLY,
        description="Price moves >3σ from VWAP in 5 minutes",
        confidence=0.75,
    ),
    "momentum_divergence": RegimeSignal(
        name="momentum_divergence",
        severity=RegimeAction.REDUCE_KELLY,
        description="Price up but volume down - weakening conviction",
        confidence=0.65,
    ),
}


class RegimeDetector:
    """
    Detects regime changes in Polymarket markets.

    Combines multiple signals to determine if market structure has flipped.
    Most severe signal wins: KILL_SWITCH > REDUCE_KELLY > CONTINUE
    """

    def __init__(self, target_wallets: Optional[List[str]] = None):
        self.target_wallets = set(target_wallets or [])
        self.signal_history: Dict[str, List[Dict]] = {}  # market_id -> signal history

    def detect(
        self,
        market: Dict[str, Any],
        whale_activity: Optional[List[Dict]] = None,
        news_items: Optional[List[Dict]] = None,
        orderbook_data: Optional[Dict] = None,
        price_history: Optional[List[Dict]] = None,
    ) -> RegimeCheckResult:
        """
        Run full regime detection on a market.

        Args:
            market: Market data from markets_cache.json
            whale_activity: List of whale transactions in this market
            news_items: Recent news items relevant to market
            orderbook_data: Current orderbook snapshot
            price_history: Recent price/volume history

        Returns:
            RegimeCheckResult with action and signals
        """
        detected_signals = []

        # 1. Volume anomaly detection
        volume_signals = self._check_volume_anomaly(market)
        detected_signals.extend(volume_signals)

        # 2. Whale dump detection
        whale_signals = self._check_whale_dump(whale_activity or [])
        detected_signals.extend(whale_signals)

        # 3. News shock detection
        news_signals = self._check_news_shock(news_items or [])
        detected_signals.extend(news_signals)

        # 4. Orderbook/liquidation detection
        ob_signals = self._check_orderbook(orderbook_data or {})
        detected_signals.extend(ob_signals)

        # 5. Price action detection
        price_signals = self._check_price_action(price_history or [], market)
        detected_signals.extend(price_signals)

        # Determine final action (most severe wins)
        action = self._determine_action(detected_signals)

        # Calculate aggregate confidence
        confidence = self._calculate_confidence(detected_signals, action)

        # Market flipped if any kill_switch or reduce_kelly signal
        market_flipped = action != RegimeAction.CONTINUE

        # Store in history
        market_id = market.get("condition_id", "unknown")
        self._store_signal_history(market_id, detected_signals, action)

        return RegimeCheckResult(
            market_flipped=market_flipped,
            confidence=confidence,
            action=action,
            signals=[s.name for s in detected_signals],
        )

    def _check_volume_anomaly(self, market: Dict[str, Any]) -> List[RegimeSignal]:
        """Check for volume spikes vs historical average."""
        signals = []
        volume_24h = market.get("volume_24h", 0)
        avg_volume_24h = market.get("avg_volume_24h", 1)  # Avoid div by zero

        if avg_volume_24h > 0:
            ratio = volume_24h / avg_volume_24h
            if ratio >= 10:
                signals.append(REGIME_SIGNALS["volume_spike_10x"])
            elif ratio >= 5:
                signals.append(REGIME_SIGNALS["volume_spike_5x"])
            elif ratio >= 2:
                signals.append(REGIME_SIGNALS["volume_spike_2x"])

        return signals

    def _check_whale_dump(self, whale_activity: List[Dict]) -> List[RegimeSignal]:
        """Check for target wallet exits."""
        signals = []
        if not whale_activity:
            return signals

        # Count exits by target wallets
        exit_count = 0
        for activity in whale_activity:
            wallet = activity.get("wallet", "").lower()
            side = activity.get("side", "").lower()  # "buy" or "sell"
            size = activity.get("size_usd", 0)

            if wallet in self.target_wallets and side == "sell" and size > 1000:
                exit_count += 1

        if exit_count >= 5:
            signals.append(REGIME_SIGNALS["whale_dump_mass"])
        elif exit_count >= 2:
            signals.append(REGIME_SIGNALS["whale_dump_detected"])

        # Also check for accumulation (positive signal)
        buy_count = sum(
            1
            for a in whale_activity
            if a.get("wallet", "").lower() in self.target_wallets
            and a.get("side", "").lower() == "buy"
            and a.get("size_usd", 0) > 1000
        )
        if buy_count >= 3:
            signals.append(REGIME_SIGNALS["whale_accumulation"])

        return signals

    def _check_news_shock(self, news_items: List[Dict]) -> List[RegimeSignal]:
        """Check for breaking news in last 2-6 hours."""
        signals = []
        now = datetime.now(timezone.utc)

        for item in news_items:
            # Check timestamp
            published_raw = item.get("published_at")
            if not published_raw:
                continue
            if isinstance(published_raw, str):
                try:
                    published = datetime.fromisoformat(published_raw.replace("Z", "+00:00"))
                except ValueError:
                    continue
            else:
                published = published_raw

            hours_ago = (now - published).total_seconds() / 3600
            if hours_ago > 6:
                continue

            text = (item.get("text", "") + " " + item.get("title", "")).lower()

            # Major macro events
            macro_keywords = ["cpi", "fomc", "fed rate", "interest rate", "inflation", "nfp", "unemployment", "gdp"]
            # Major geopolitical
            geo_keywords = ["war", "invasion", "missile", "nuclear", "sanctions", "default", "bankruptcy"]
            # Crypto specific
            crypto_keywords = ["etf approval", "etf rejection", "hack", "exploit", "sec lawsuit", "regulation", "ban"]

            if any(kw in text for kw in geo_keywords):
                signals.append(REGIME_SIGNALS["news_shock_major"])
            elif any(kw in text for kw in macro_keywords) and hours_ago <= 2:
                signals.append(REGIME_SIGNALS["news_shock_CPI"])
            elif any(kw in text for kw in crypto_keywords) and hours_ago <= 4:
                signals.append(REGIME_SIGNALS["news_shock_crypto"])

        return signals

    def _check_orderbook(self, orderbook_data: Dict) -> List[RegimeSignal]:
        """Check for liquidation cascade / orderbook thinning."""
        signals = []

        depth_change_1m = orderbook_data.get("depth_change_1m_pct", 0)
        depth_change_5m = orderbook_data.get("depth_change_5m_pct", 0)

        if depth_change_1m <= -50:  # 50% drop in 1 minute
            signals.append(REGIME_SIGNALS["liquidation_cascade"])
        elif depth_change_5m <= -25:  # 25% drop in 5 minutes
            signals.append(REGIME_SIGNALS["orderbook_thinning"])

        return signals

    def _check_price_action(
        self, price_history: List[Dict], market: Dict[str, Any]
    ) -> List[RegimeSignal]:
        """Check for price gaps, momentum divergence."""
        signals = []

        if len(price_history) < 10:
            return signals

        # Simple momentum divergence: price up, volume down
        recent = price_history[-5:]
        older = price_history[-10:-5]

        if recent and older:
            avg_price_recent = sum(p.get("price", 0) for p in recent) / len(recent)
            avg_price_older = sum(p.get("price", 0) for p in older) / len(older)
            avg_vol_recent = sum(p.get("volume", 0) for p in recent) / len(recent)
            avg_vol_older = sum(p.get("volume", 0) for p in older) / len(older)

            price_up = avg_price_recent > avg_price_older * 1.02  # 2% up
            vol_down = avg_vol_recent < avg_vol_older * 0.8  # 20% down

            if price_up and vol_down:
                signals.append(REGIME_SIGNALS["momentum_divergence"])

        # Price gap break (simplified - would need VWAP in production)
        tokens = market.get("tokens", [])
        for token in tokens:
            price = token.get("price", 0.5)
            # Mock: if price is extreme (>0.9 or <0.1), could indicate gap
            if price > 0.9 or price < 0.1:
                signals.append(REGIME_SIGNALS["price_gap_break"])
                break

        return signals

    def _determine_action(self, signals: List[RegimeSignal]) -> RegimeAction:
        """Determine final action: most severe signal wins."""
        if any(s.severity == RegimeAction.KILL_SWITCH for s in signals):
            return RegimeAction.KILL_SWITCH
        if any(s.severity == RegimeAction.REDUCE_KELLY for s in signals):
            return RegimeAction.REDUCE_KELLY
        return RegimeAction.CONTINUE

    def _calculate_confidence(
        self, signals: List[RegimeSignal], action: RegimeAction
    ) -> float:
        """Calculate aggregate confidence based on signals and action."""
        if not signals:
            return 0.95  # High confidence in normal regime

        if action == RegimeAction.KILL_SWITCH:
            # High confidence when kill switch triggered
            kill_signals = [s for s in signals if s.severity == RegimeAction.KILL_SWITCH]
            return max(s.confidence for s in kill_signals) if kill_signals else 0.90

        if action == RegimeAction.REDUCE_KELLY:
            # Medium-high confidence for reduce_kelly
            reduce_signals = [s for s in signals if s.severity == RegimeAction.REDUCE_KELLY]
            return max(s.confidence for s in reduce_signals) if reduce_signals else 0.80

        return 0.95

    def _store_signal_history(
        self, market_id: str, signals: List[RegimeSignal], action: RegimeAction
    ) -> None:
        """Store signal history for learning loop."""
        if market_id not in self.signal_history:
            self.signal_history[market_id] = []

        self.signal_history[market_id].append(
            {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "signals": [s.name for s in signals],
                "action": action.value,
            }
        )

        # Keep last 100 entries
        if len(self.signal_history[market_id]) > 100:
            self.signal_history[market_id] = self.signal_history[market_id][-100:]

    def get_signal_history(self, market_id: str) -> List[Dict]:
        """Get signal history for a market."""
        return self.signal_history.get(market_id, [])


def create_regime_detector(target_wallets: Optional[List[str]] = None) -> RegimeDetector:
    """Factory function to create RegimeDetector with target wallets."""
    return RegimeDetector(target_wallets)


# Default 47 target wallets from poly_data analysis (placeholder)
DEFAULT_TARGET_WALLETS = [
    # These would be loaded from GBrain/poly_data in production
    "0x1234...wallet1",
    "0x5678...wallet2",
    # ... 45 more
]


if __name__ == "__main__":
    # Quick test
    detector = create_regime_detector(DEFAULT_TARGET_WALLETS)

    test_market = {
        "condition_id": "0x0000000000000000000000000000000000000001",
        "question": "Will ETH be above $3000?",
        "volume_24h": 50000,
        "avg_volume_24h": 10000,  # 5x spike
        "tokens": [{"price": 0.45}],
    }

    result = detector.detect(
        market=test_market,
        whale_activity=[],
        news_items=[],
        orderbook_data={},
        price_history=[],
    )

    print(json.dumps(result.to_dict(), indent=2))