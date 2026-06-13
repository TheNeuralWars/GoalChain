#!/usr/bin/env python3
"""
Exit Monitor Daemon
Main entry point for monitoring open positions and triggering exits.
Runs every 60s, evaluates 6 exit triggers, places orders via polymarket-cli.
"""
import argparse
import asyncio
import json
import logging
import os
import signal
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import yaml

from position_monitor import PositionMonitor, Position
from volume_tracker import VolumeTracker
from orderbook_watcher import OrderbookWatcher
from gbrain_learning import GBrainLearning, TradeRecord

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('exit_monitor.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class ExitMonitor:
    """Main daemon class orchestrating all exit triggers"""

    def __init__(self, config_path: str = "config.yaml", dry_run: bool = False, once: bool = False):
        self.config_path = Path(config_path)
        self.dry_run = dry_run
        self.once = once
        self.running = False

        # Load config
        self.config = self._load_config()

        # Initialize components
        self.position_monitor = PositionMonitor(self.config['paths']['positions_file'])
        self.volume_tracker = VolumeTracker(
            window_minutes=self.config['triggers']['volume_spike']['window_minutes'],
            spike_multiplier=self.config['triggers']['volume_spike']['volume_multiplier']
        )
        self.orderbook_watcher = OrderbookWatcher(
            window_minutes=self.config['triggers']['liquidation_cascade']['window_minutes'],
            depth_drop_threshold=self.config['triggers']['liquidation_cascade']['depth_drop_threshold']
        )
        self.gbrain = GBrainLearning(
            mcp_server=self.config['gbrain']['mcp_server'],
            enabled=self.config['gbrain']['enabled']
        )

        # Config values
        self.loop_interval = self.config['daemon']['loop_interval_seconds']
        self.clob_url = os.getenv('POLYMARKET_CLOB_URL', self.config['polymarket']['clob_url'])
        self.private_key = os.getenv(self.config['polymarket']['private_key_env'])

        # Whale wallets
        self.whale_wallets = self._load_whale_wallets()

        # Webhook
        self.webhook_url = os.getenv(self.config['webhook']['url_env'].replace('{', '').replace('}', ''))

        logger.info(f"ExitMonitor initialized: dry_run={dry_run}, once={once}")
        if not self.private_key:
            logger.warning("POLYMARKET_PK not set - order placement will fail")

    def _load_config(self) -> dict:
        """Load YAML configuration"""
        with open(self.config_path, 'r') as f:
            return yaml.safe_load(f)

    def _load_whale_wallets(self) -> set:
        """Load whale wallet addresses from JSON file"""
        whale_file = Path(self.config['whale_wallets']['file_path'])
        if whale_file.exists():
            with open(whale_file, 'r') as f:
                return set(json.load(f))
        logger.warning(f"Whale wallets file {whale_file} not found")
        return set()

    async def _fetch_market_data(self, position: Position) -> dict:
        """Fetch current market data for a position"""
        # In production, this would call Polymarket CLOB API
        # For now, use position's current values
        return {
            "current_price": position.current_price or position.entry_price,
            "volume_10m": position.current_10m_volume or 0.0,
            "avg_volume_10m": position.avg_10m_volume or 1000.0,
            "bid_depth": (position.orderbook_depth or 10000.0) / 2,
            "ask_depth": (position.orderbook_depth or 10000.0) / 2,
            "regime": position.regime_at_entry,
            "whale_exits": set(),
        }

    def _check_target_hit(self, position: Position, market_data: dict) -> bool:
        """Trigger 1: TARGET_HIT - price reached 85% of expected gap"""
        if not self.config['triggers']['target_hit']['enabled']:
            return False

        current_price = market_data.get('current_price', position.entry_price)
        target_price = position.entry_price + (0.85 * position.expected_gap)

        hit = current_price >= target_price
        if hit:
            logger.info(f"TARGET_HIT: {position.market} price={current_price:.4f} >= target={target_price:.4f}")
        return hit

    def _check_volume_spike(self, position: Position, market_data: dict) -> bool:
        """Trigger 2: VOLUME_SPIKE - 10m volume > 3x avg (PRIMARY signal)"""
        if not self.config['triggers']['volume_spike']['enabled']:
            return False

        current_vol = market_data.get('volume_10m', 0)
        avg_vol = market_data.get('avg_volume_10m', position.avg_10m_volume or 1)

        if avg_vol <= 0:
            return False

        self.volume_tracker.add_volume(position.token_id, current_vol)
        self.volume_tracker.update_baseline(position.token_id, avg_vol)

        return self.volume_tracker.check_volume_spike(position.token_id)

    def _check_time_decay(self, position: Position, market_data: dict) -> bool:
        """Trigger 3: TIME_DECAY - >24h held with <2% price movement"""
        if not self.config['triggers']['time_decay']['enabled']:
            return False

        hours = position.hours_since_entry or 0
        price_change = abs(position.price_change_pct or 0)

        max_hours = self.config['triggers']['time_decay']['max_hours']
        max_change = self.config['triggers']['time_decay']['max_price_change']

        decay = hours > max_hours and price_change < max_change
        if decay:
            logger.info(f"TIME_DECAY: {position.market} hours={hours:.1f} change={price_change:.3f}")
        return decay

    def _check_regime_flip(self, position: Position, market_data: dict) -> bool:
        """Trigger 4: REGIME_FLIP - market structure changed (EXIT ALL)"""
        if not self.config['triggers']['regime_flip']['enabled']:
            return False

        # In production, this would query the regime analysis brain
        # For now, check if regime_at_exit indicates flip
        regime = market_data.get('regime', position.regime_at_entry)
        flipped = regime == 'news_shock' or regime == 'regime_flip'

        if flipped:
            logger.warning(f"REGIME_FLIP detected: {position.market} regime={regime}")
        return flipped

    def _check_liquidation_cascade(self, position: Position, market_data: dict) -> bool:
        """Trigger 5: LIQUIDATION_CASCADE - orderbook depth drop >50% in 1m"""
        if not self.config['triggers']['liquidation_cascade']['enabled']:
            return False

        bid_depth = market_data.get('bid_depth', 0)
        ask_depth = market_data.get('ask_depth', 0)

        self.orderbook_watcher.add_snapshot(position.token_id, bid_depth, ask_depth)
        return self.orderbook_watcher.check_liquidation_cascade(position.token_id)

    def _check_whale_exit(self, position: Position, market_data: dict) -> bool:
        """Trigger 6: WHALE_EXIT - target wallet closed same position"""
        if not self.config['triggers']['whale_exit']['enabled']:
            return False

        # In production, this would monitor whale wallet activity via indexer
        # For now, check if any whale wallet is in recent closures
        whale_activity = market_data.get('whale_exits', set())
        detected = bool(self.whale_wallets & whale_activity)

        if detected:
            logger.warning(f"WHALE_EXIT detected for {position.market}")
        return detected

    def _evaluate_triggers(self, position: Position, market_data: dict) -> Optional[str]:
        """Evaluate all exit triggers, return first matching trigger reason"""
        triggers = [
            ("REGIME_FLIP", self._check_regime_flip),
            ("LIQUIDATION_CASCADE", self._check_liquidation_cascade),
            ("TARGET_HIT", self._check_target_hit),
            ("VOLUME_SPIKE", self._check_volume_spike),
            ("WHALE_EXIT", self._check_whale_exit),
            ("TIME_DECAY", self._check_time_decay),
        ]

        for name, check_fn in triggers:
            try:
                if check_fn(position, market_data):
                    return name
            except Exception as e:
                logger.error(f"Error checking {name} for {position.token_id}: {e}")

        return None

    async def _place_exit_order(self, position: Position, reason: str) -> Optional[float]:
        """Place exit order via polymarket-cli, return exit price"""
        # Determine order type
        market_triggers = self.config['execution']['market_order_triggers']
        is_market = reason in market_triggers

        side = "sell" if position.side == "YES" else "buy"  # Opposite of entry
        order_type = "market" if is_market else "limit"

        # Build polymarket-cli command
        cmd = [
            "polymarket-cli", "order", "place",
            "--market", position.market,
            "--token-id", position.token_id,
            "--side", side,
            "--size", str(position.size),
            "--type", order_type,
        ]

        if order_type == "limit":
            # For limit orders, use current price with small offset
            offset_bps = self.config['execution']['limit_offset_bps']
            current = position.current_price or position.entry_price
            if position.side == "YES":
                limit_price = current * (1 - offset_bps / 10000)
            else:
                limit_price = current * (1 + offset_bps / 10000)
            cmd.extend(["--price", f"{limit_price:.4f}"])

        if self.dry_run:
            logger.info(f"[DRY RUN] Would execute: {' '.join(cmd)}")
            return position.current_price or position.entry_price

        try:
            # Execute polymarket-cli
            env = os.environ.copy()
            env['POLYMARKET_PK'] = self.private_key or ""
            env['POLYMARKET_CLOB_URL'] = self.clob_url

            proc = await asyncio.create_subprocess_exec(
                *cmd,
                env=env,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await proc.communicate()

            if proc.returncode == 0:
                # Parse exit price from output
                # polymarket-cli output format varies, assume it returns fill price
                output = stdout.decode().strip()
                logger.info(f"Order placed: {output}")
                return position.current_price or position.entry_price
            else:
                logger.error(f"Order failed: {stderr.decode()}")
                return None

        except FileNotFoundError:
            logger.error("polymarket-cli not found in PATH")
            return None
        except Exception as e:
            logger.error(f"Order placement error: {e}")
            return None

    def _send_webhook_alert(self, market: str, reason: str, pnl: float) -> None:
        """Send exit alert via webhook"""
        if not self.webhook_url:
            return

        try:
            import requests
            template = self.config['webhook']['template']
            message = template.format(market=market, reason=reason, pnl=pnl)
            requests.post(self.webhook_url, json={"content": message}, timeout=5)
        except Exception as e:
            logger.debug(f"Webhook send failed: {e}")

    async def _process_position(self, position: Position) -> None:
        """Process a single position: check triggers, execute exit if needed"""
        # Fetch market data
        market_data = await self._fetch_market_data(position)

        # Update position with latest data
        self.position_monitor.update_market_data(
            position.token_id,
            current_price=market_data.get('current_price'),
            avg_10m_volume=market_data.get('avg_volume_10m'),
            current_10m_volume=market_data.get('volume_10m'),
            orderbook_depth=market_data.get('bid_depth', 0) + market_data.get('ask_depth', 0)
        )

        # Check triggers
        trigger_reason = self._evaluate_triggers(position, market_data)

        if not trigger_reason:
            return  # No exit trigger

        logger.info(f"EXIT TRIGGERED: {position.market} ({position.token_id}) - {trigger_reason}")

        # Place exit order
        exit_price = await self._place_exit_order(position, trigger_reason)
        if exit_price is None:
            logger.error(f"Failed to place exit order for {position.token_id}")
            return

        # Calculate PnL
        if position.side == "YES":
            pnl = (exit_price - position.entry_price) * position.size
        else:
            pnl = (position.entry_price - exit_price) * position.size

        # Determine regime at exit
        regime_at_exit = market_data.get('regime', position.regime_at_entry)

        # Close position
        closed_pos = self.position_monitor.close_position(
            position.token_id, exit_price, trigger_reason, regime_at_exit, pnl
        )

        if not closed_pos:
            logger.error(f"Failed to close position {position.token_id}")
            return

        # Record trade for learning
        hours_held = position.hours_since_entry or 0
        trade = TradeRecord(
            market=position.market,
            token_id=position.token_id,
            entry_price=position.entry_price,
            exit_price=exit_price,
            size=position.size,
            pnl=pnl,
            reason=trigger_reason,
            timestamp=datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
            kelly_fraction_at_entry=position.kelly_fraction_at_entry,
            regime_at_exit=regime_at_exit,
            thesis=position.thesis,
            regime_at_entry=position.regime_at_entry,
            hours_held=hours_held,
            price_change_pct=position.price_change_pct or 0,
            volume_spike_ratio=self.volume_tracker.get_volume_ratio(position.token_id),
            depth_drop_ratio=self.orderbook_watcher.get_depth_drop_ratio(position.token_id),
            whale_exit_detected=trigger_reason == "WHALE_EXIT"
        )

        self.gbrain.record_trade(trade)

        # Send webhook alert
        self._send_webhook_alert(position.market, trigger_reason, pnl)

        logger.info(f"EXIT COMPLETE: {position.market} {trigger_reason} PnL: ${pnl:+.2f}")

    async def run_once(self) -> None:
        """Single iteration: check all open positions"""
        logger.info("Starting exit monitor iteration")
        open_positions = self.position_monitor.get_open_positions()

        if not open_positions:
            logger.info("No open positions to monitor")
            return

        logger.info(f"Monitoring {len(open_positions)} open positions")

        for position in open_positions:
            try:
                await self._process_position(position)
            except Exception as e:
                logger.error(f"Error processing {position.token_id}: {e}")

        logger.info("Exit monitor iteration complete")

    async def run_daemon(self) -> None:
        """Run continuous daemon loop"""
        self.running = True
        logger.info(f"Starting exit monitor daemon (interval: {self.loop_interval}s)")

        while self.running:
            start_time = time.time()
            try:
                await self.run_once()
            except Exception as e:
                logger.error(f"Daemon iteration error: {e}")

            if self.once:
                break

            # Sleep for remaining interval
            elapsed = time.time() - start_time
            sleep_time = max(0, self.loop_interval - elapsed)
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)

    def stop(self) -> None:
        """Stop the daemon"""
        self.running = False
        logger.info("Exit monitor stopped")


def main():
    parser = argparse.ArgumentParser(description="Polymarket Exit Monitor Daemon")
    parser.add_argument("--config", default="config.yaml", help="Config file path")
    parser.add_argument("--dry-run", action="store_true", help="Simulate without placing orders")
    parser.add_argument("--once", action="store_true", help="Run once and exit")
    parser.add_argument("--log-level", default="INFO", help="Log level")
    args = parser.parse_args()

    # Set log level
    logging.getLogger().setLevel(args.log_level)

    monitor = ExitMonitor(
        config_path=args.config,
        dry_run=args.dry_run,
        once=args.once
    )

    # Handle signals
    def signal_handler(signum, frame):
        logger.info(f"Received signal {signum}, stopping...")
        monitor.stop()

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Run
    try:
        asyncio.run(monitor.run_daemon())
    except KeyboardInterrupt:
        logger.info("Interrupted")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()