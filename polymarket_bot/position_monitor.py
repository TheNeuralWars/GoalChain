"""
Position Monitor Module
Loads, parses, and tracks positions from positions.json
"""
import json
import logging
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)


@dataclass
class Position:
    """Represents an open trading position"""
    market: str
    token_id: str
    side: str  # "YES" or "NO"
    entry_price: float
    size: float
    expected_gap: float
    entry_time: str  # ISO format
    thesis: str
    regime_at_entry: str
    kelly_fraction_at_entry: float
    status: str = "OPEN"  # OPEN, CLOSING, CLOSED
    current_price: Optional[float] = None
    avg_10m_volume: Optional[float] = None
    current_10m_volume: Optional[float] = None
    orderbook_depth: Optional[float] = None
    hours_since_entry: Optional[float] = None
    price_change_pct: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class PositionMonitor:
    """Manages loading/saving positions and tracking their state"""

    def __init__(self, positions_file: str = "positions.json"):
        self.positions_file = Path(positions_file)
        self.positions: Dict[str, Position] = {}  # key: token_id
        self._load()

    def _load(self) -> None:
        """Load positions from JSON file"""
        if not self.positions_file.exists():
            logger.info(f"Positions file {self.positions_file} not found, starting empty")
            self.positions = {}
            return

        try:
            with open(self.positions_file, 'r') as f:
                data = json.load(f)

            self.positions = {}
            for item in data:
                pos = Position(**item)
                self.positions[pos.token_id] = pos

            logger.info(f"Loaded {len(self.positions)} positions from {self.positions_file}")
        except (json.JSONDecodeError, KeyError, TypeError) as e:
            logger.error(f"Failed to load positions: {e}")
            self.positions = {}

    def save(self) -> None:
        """Save positions to JSON file"""
        try:
            data = [pos.to_dict() for pos in self.positions.values()]
            with open(self.positions_file, 'w') as f:
                json.dump(data, f, indent=2)
            logger.debug(f"Saved {len(self.positions)} positions to {self.positions_file}")
        except Exception as e:
            logger.error(f"Failed to save positions: {e}")

    def get_open_positions(self) -> List[Position]:
        """Get all positions with OPEN status"""
        return [p for p in self.positions.values() if p.status == "OPEN"]

    def get_position(self, token_id: str) -> Optional[Position]:
        """Get position by token_id"""
        return self.positions.get(token_id)

    def update_position(self, position: Position) -> None:
        """Update a position and save"""
        self.positions[position.token_id] = position
        self.save()

    def close_position(self, token_id: str, exit_price: float, reason: str,
                       regime_at_exit: str, pnl: float) -> Optional[Position]:
        """Mark position as closed and return it for trade logging"""
        pos = self.positions.get(token_id)
        if not pos:
            return None

        pos.status = "CLOSED"
        pos.current_price = exit_price
        self.save()
        return pos

    def update_market_data(self, token_id: str, current_price: float,
                           avg_10m_volume: float = None,
                           current_10m_volume: float = None,
                           orderbook_depth: float = None) -> bool:
        """Update real-time market data for a position"""
        pos = self.positions.get(token_id)
        if not pos or pos.status != "OPEN":
            return False

        pos.current_price = current_price
        if avg_10m_volume is not None:
            pos.avg_10m_volume = avg_10m_volume
        if current_10m_volume is not None:
            pos.current_10m_volume = current_10m_volume
        if orderbook_depth is not None:
            pos.orderbook_depth = orderbook_depth

        # Calculate derived metrics
        if pos.entry_time:
            entry_dt = datetime.fromisoformat(pos.entry_time.replace('Z', '+00:00'))
            now = datetime.now(timezone.utc)
            pos.hours_since_entry = (now - entry_dt).total_seconds() / 3600

        if pos.entry_price and current_price:
            pos.price_change_pct = (current_price - pos.entry_price) / pos.entry_price

        return True