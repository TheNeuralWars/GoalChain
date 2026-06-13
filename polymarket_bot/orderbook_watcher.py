"""
Orderbook Watcher Module
Tracks orderbook depth for LIQUIDATION_CASCADE trigger
"""
import logging
import time
from dataclasses import dataclass
from typing import Dict, Optional

import aiohttp

logger = logging.getLogger(__name__)


@dataclass
class OrderbookSnapshot:
    """Single orderbook depth measurement"""
    timestamp: float
    bid_depth: float  # Total bid volume near mid
    ask_depth: float  # Total ask volume near mid
    total_depth: float
    token_id: str


class OrderbookWatcher:
    """
    Monitors orderbook depth for sudden drops indicating liquidation cascade.
    Triggers LIQUIDATION_CASCADE when depth drops > 50% in 1 minute.
    """

    def __init__(self, window_minutes: int = 1, depth_drop_threshold: float = 0.50):
        self.window_seconds = window_minutes * 60
        self.depth_drop_threshold = depth_drop_threshold
        # token_id -> deque of OrderbookSnapshot
        self.depth_history: Dict[str, list] = {}
        # token_id -> baseline depth (initial reference)
        self.baseline_depths: Dict[str, float] = {}

    def add_snapshot(self, token_id: str, bid_depth: float, ask_depth: float,
                     timestamp: Optional[float] = None) -> None:
        """Add an orderbook depth measurement"""
        if timestamp is None:
            timestamp = time.time()

        total_depth = bid_depth + ask_depth

        if token_id not in self.depth_history:
            self.depth_history[token_id] = []

        self.depth_history[token_id].append(OrderbookSnapshot(
            timestamp=timestamp,
            bid_depth=bid_depth,
            ask_depth=ask_depth,
            total_depth=total_depth,
            token_id=token_id
        ))

        # Set baseline if not set
        if token_id not in self.baseline_depths:
            self.baseline_depths[token_id] = total_depth
            logger.info(f"Initialized baseline depth for {token_id}: {total_depth:.2f}")

        # Prune old entries
        self._prune_history(token_id, timestamp)

    def _prune_history(self, token_id: str, current_time: float) -> None:
        """Remove snapshots older than the window"""
        cutoff = current_time - self.window_seconds
        history = self.depth_history.get(token_id, [])

        # Keep only recent entries
        self.depth_history[token_id] = [s for s in history if s.timestamp >= cutoff]

    def get_current_depth(self, token_id: str) -> Optional[float]:
        """Get most recent total depth"""
        history = self.depth_history.get(token_id, [])
        if not history:
            return None
        return history[-1].total_depth

    def get_baseline_depth(self, token_id: str) -> float:
        """Get baseline depth for comparison"""
        return self.baseline_depths.get(token_id, 0.0)

    def check_liquidation_cascade(self, token_id: str) -> bool:
        """
        Check if orderbook depth dropped > threshold in the window.
        Returns True if LIQUIDATION_CASCADE trigger condition is met.
        """
        current_depth = self.get_current_depth(token_id)
        baseline = self.get_baseline_depth(token_id)

        if current_depth is None or baseline <= 0:
            return False

        drop_ratio = 1 - (current_depth / baseline)
        is_cascade = drop_ratio >= self.depth_drop_threshold

        if is_cascade:
            logger.warning(f"LIQUIDATION_CASCADE detected for {token_id}: "
                          f"baseline={baseline:.2f}, current={current_depth:.2f}, "
                          f"drop={drop_ratio:.1%}")

        return is_cascade

    def get_depth_drop_ratio(self, token_id: str) -> float:
        """Get current depth drop ratio for monitoring"""
        current = self.get_current_depth(token_id)
        baseline = self.get_baseline_depth(token_id)
        if baseline <= 0 or current is None:
            return 0.0
        return 1 - (current / baseline)

    async def fetch_orderbook_from_api(self, session: aiohttp.ClientSession,
                                        token_id: str, clob_url: str) -> Optional[Dict]:
        """
        Fetch orderbook from Polymarket CLOB API.
        Returns dict with bids/asks or None on failure.
        """
        try:
            # Polymarket CLOB orderbook endpoint
            url = f"{clob_url}/book/{token_id}"
            async with session.get(url) as resp:
                if resp.status == 200:
                    return await resp.json()
        except Exception as e:
            logger.debug(f"Failed to fetch orderbook for {token_id}: {e}")
        return None

    def calculate_depth_from_book(self, book_data: Dict, levels: int = 10) -> tuple:
        """
        Calculate bid/ask depth from orderbook data.
        Sums volume across top N levels.
        """
        bids = book_data.get("bids", [])[:levels]
        asks = book_data.get("asks", [])[:levels]

        bid_depth = sum(float(b.get("size", 0)) for b in bids)
        ask_depth = sum(float(a.get("size", 0)) for a in asks)

        return bid_depth, ask_depth