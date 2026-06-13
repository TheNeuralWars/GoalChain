"""
Volume Tracker Module
Monitors 10m volume vs avg_10m_volume for VOLUME_SPIKE trigger
"""
import logging
import time
from collections import deque
from dataclasses import dataclass
from typing import Dict, Optional

import aiohttp

logger = logging.getLogger(__name__)


@dataclass
class VolumeSnapshot:
    """Single volume measurement"""
    timestamp: float
    volume: float
    token_id: str


class VolumeTracker:
    """
    Tracks 10-minute rolling volume windows for each token.
    Detects VOLUME_SPIKE when current 10m volume > 3x average 10m volume.
    """

    def __init__(self, window_minutes: int = 10, spike_multiplier: float = 3.0):
        self.window_seconds = window_minutes * 60
        self.spike_multiplier = spike_multiplier
        # token_id -> deque of VolumeSnapshot
        self.volume_history: Dict[str, deque] = {}
        # token_id -> average 10m volume (baseline)
        self.baseline_volumes: Dict[str, float] = {}

    def add_volume(self, token_id: str, volume: float, timestamp: Optional[float] = None) -> None:
        """Add a volume measurement for a token"""
        if timestamp is None:
            timestamp = time.time()

        if token_id not in self.volume_history:
            self.volume_history[token_id] = deque()

        self.volume_history[token_id].append(VolumeSnapshot(
            timestamp=timestamp,
            volume=volume,
            token_id=token_id
        ))

        # Prune old entries outside the window
        self._prune_history(token_id, timestamp)

    def _prune_history(self, token_id: str, current_time: float) -> None:
        """Remove volume snapshots older than the window"""
        cutoff = current_time - self.window_seconds
        history = self.volume_history.get(token_id, deque())

        while history and history[0].timestamp < cutoff:
            history.popleft()

    def get_current_10m_volume(self, token_id: str) -> float:
        """Get total volume in the last 10 minutes"""
        self._prune_history(token_id, time.time())
        history = self.volume_history.get(token_id, deque())
        return sum(s.volume for s in history)

    def get_avg_10m_volume(self, token_id: str) -> float:
        """Get baseline average 10m volume"""
        return self.baseline_volumes.get(token_id, 0.0)

    def update_baseline(self, token_id: str, avg_volume: float) -> None:
        """Update the baseline average volume (e.g., from historical data)"""
        self.baseline_volumes[token_id] = avg_volume

    def check_volume_spike(self, token_id: str) -> bool:
        """
        Check if current 10m volume exceeds spike_multiplier * avg_10m_volume
        Returns True if VOLUME_SPIKE trigger condition is met
        """
        current = self.get_current_10m_volume(token_id)
        avg = self.get_avg_10m_volume(token_id)

        if avg <= 0:
            # No baseline yet, can't determine spike
            return False

        ratio = current / avg
        is_spike = ratio >= self.spike_multiplier

        if is_spike:
            logger.warning(f"VOLUME_SPIKE detected for {token_id}: "
                          f"current={current:.2f}, avg={avg:.2f}, ratio={ratio:.2f}x")

        return is_spike

    def get_volume_ratio(self, token_id: str) -> float:
        """Get current/avg volume ratio for logging/monitoring"""
        current = self.get_current_10m_volume(token_id)
        avg = self.get_avg_10m_volume(token_id)
        if avg <= 0:
            return 0.0
        return current / avg

    async def fetch_volume_from_api(self, session: aiohttp.ClientSession,
                                     token_id: str, clob_url: str) -> Optional[float]:
        """
        Fetch current volume from Polymarket CLOB API
        Note: Actual endpoint depends on Polymarket API structure
        """
        try:
            # Polymarket CLOB endpoint for market data
            url = f"{clob_url}/markets/{token_id}"
            async with session.get(url) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    # Extract volume from response (structure depends on API)
                    return data.get("volume_24h", 0) / 144  # Rough 10m estimate from 24h
        except Exception as e:
            logger.debug(f"Failed to fetch volume for {token_id}: {e}")
        return None