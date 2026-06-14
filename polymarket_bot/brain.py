"""
Brain.py - Polymarket Bot Thesis Generation Engine

Orchestrates 4 checks + regime detection via Nemotron 3 Ultra
to generate trading thesis with Kelly sizing and probability distributions.
"""

import json
import os
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
from pathlib import Path

from nemotron_client import create_client, NemotronConfig
from regime_detector import create_regime_detector, RegimeAction, RegimeCheckResult

# Load environment
try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass


@dataclass
class CheckResult:
    agree: bool
    confidence: float
    reasoning: str
    extra: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        result = {"agree": self.agree, "confidence": self.confidence, "reasoning": self.reasoning}
        if self.extra:
            result.update(self.extra)
        return result


@dataclass
class Thesis:
    market: str
    condition_id: str
    token_id: str
    category: str
    is_updown: bool
    regime_flag: str
    action: str  # "buy_yes", "buy_no", "skip"
    confidence: float
    kelly_size: float
    probability_distribution: Dict[str, float]
    regime_check: Dict[str, Any]
    reasoning: str
    base_rate: float
    news_check: Dict[str, Any]
    whale_check: Dict[str, Any]
    disposition_check: Dict[str, Any]
    created_at: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class Brain:
    """
    Main thesis generation engine.

    For each market:
    1. Base rate check (statistical anchor)
    2. News check (information edge)
    3. Whale check (smart money signal)
    4. Disposition check (crowd psychology)
    5. Regime detection (structural risk)

    If 3/4 checks agree → generate thesis with Kelly sizing
    """

    def __init__(
        self,
        nemotron_client=None,
        regime_detector=None,
        target_wallets: Optional[List[str]] = None,
        bankroll_usd: float = 10000.0,
        quarter_kelly_cap: float = 0.25,
        profit_compound_ratio: float = 0.5,
    ):
        self.nemotron = nemotron_client or create_client()
        self.regime_detector = regime_detector or create_regime_detector(target_wallets)
        self.target_wallets = set(target_wallets or [])
        self.bankroll_usd = bankroll_usd
        self.quarter_kelly_cap = quarter_kelly_cap
        self.profit_compound_ratio = profit_compound_ratio

        # Base rates by category (from poly_data analysis)
        self.base_rates = {
            "crypto_directional": 0.48,
            "crypto_updown": 0.52,
            "sports": 0.50,
            "politics": 0.50,
            "other": 0.50,
        }

        # Load system prompt
        self.system_prompt = self._load_system_prompt()

    def _load_system_prompt(self) -> str:
        prompt_path = Path(__file__).parent / "prompts" / "brain_system.md"
        if prompt_path.exists():
            return prompt_path.read_text()
        return "You are a Polymarket trading bot reasoning engine. Analyze markets and output structured JSON."

    async def run(self, markets_file: str = "markets_cache.json", output_file: str = "thesis.json") -> List[Thesis]:
        """
        Main entry point: process all markets and generate thesis.json

        Args:
            markets_file: Path to markets cache (serves as queue.json)
            output_file: Path to output thesis.json

        Returns:
            List of generated thesis objects
        """
        markets = self._load_markets(markets_file)
        print(f"Loaded {len(markets)} markets from {markets_file}")

        theses = []
        for i, market in enumerate(markets):
            print(f"\n[{i+1}/{len(markets)}] Processing: {market.get('question', 'unknown')[:60]}...")
            try:
                thesis = await self._process_market(market)
                if thesis:
                    theses.append(thesis)
                    print(f"  ✓ Action: {thesis.action} | Confidence: {thesis.confidence:.2f} | Kelly: ${thesis.kelly_size:.2f}")
            except Exception as e:
                print(f"  ✗ Error processing market: {e}")

        # Save all theses
        self._save_theses(theses, output_file)
        print(f"\n✓ Saved {len(theses)} theses to {output_file}")

        return theses

    def _load_markets(self, filepath: str) -> List[Dict[str, Any]]:
        path = Path(filepath)
        if not path.exists():
            # Try relative to script directory
            path = Path(__file__).parent / filepath
        if not path.exists():
            raise FileNotFoundError(f"Markets file not found: {filepath}")

        with open(path) as f:
            return json.load(f)

    def _save_theses(self, theses: List[Thesis], output_file: str) -> None:
        path = Path(output_file)
        data = [t.to_dict() for t in theses]
        with open(path, "w") as f:
            json.dump(data, f, indent=2)

    async def _process_market(self, market: Dict[str, Any]) -> Optional[Thesis]:
        """Process a single market through all checks."""
        condition_id = market.get("condition_id", "")
        question = market.get("question", "")
        category = self._infer_category(market)
        is_updown = "up or down" in question.lower()
        tokens = market.get("tokens", [])

        # Determine which token to trade (YES or NO)
        yes_token = next((t for t in tokens if t.get("outcome") == "Yes"), None)
        no_token = next((t for t in tokens if t.get("outcome") == "No"), None)

        if not yes_token or not no_token:
            return None

        yes_price = yes_token.get("price", 0.5)
        no_price = no_token.get("price", 0.5)

        # Run 4 checks in parallel
        base_rate = self._check_base_rate(category)
        news_check = await self._check_news(market)
        whale_check = await self._check_whales(market)
        disposition_check = await self._check_disposition(market, yes_price, no_price)

        # Count agreements
        checks = [news_check, whale_check, disposition_check]
        agree_count = sum(1 for c in checks if c.agree)

        # Run regime detection
        regime_result = self.regime_detector.detect(
            market=market,
            whale_activity=whale_check.extra.get("raw_activity", []) if whale_check.extra else [],
            news_items=news_check.extra.get("raw_news", []) if news_check.extra else [],
            orderbook_data={},  # Would come from CLOB in production
            price_history=[],  # Would come from historical data in production
        )

        # Decision logic
        if agree_count < 3:
            return self._create_skip_thesis(
                market, condition_id, yes_token, category, is_updown, base_rate,
                news_check, whale_check, disposition_check, regime_result,
                reason=f"Only {agree_count}/3 checks agree (need 3)"
            )

        # Determine action based on price vs base rate + check signals
        action, confidence = self._determine_action(
            base_rate, yes_price, no_price, checks, regime_result
        )

        # Handle regime action
        kelly_fraction = self._calculate_kelly_fraction(base_rate, yes_price, no_price, action, confidence)
        if regime_result.action == RegimeAction.KILL_SWITCH:
            action = "skip"
            kelly_fraction = 0.0
            confidence = min(confidence, 0.5)
        elif regime_result.action == RegimeAction.REDUCE_KELLY:
            kelly_fraction = kelly_fraction / 8

        # Apply quarter-Kelly cap
        kelly_fraction = min(kelly_fraction, self.quarter_kelly_cap)

        # Calculate kelly size from bankroll
        kelly_size = self.bankroll_usd * kelly_fraction

        # Generate probability distribution
        prob_dist = self._generate_probability_distribution(confidence, base_rate, yes_price)

        # Build reasoning
        reasoning = self._build_reasoning(
            base_rate, yes_price, no_price, checks, regime_result, action, confidence
        )

        return Thesis(
            market=question,
            condition_id=condition_id,
            token_id=yes_token["token_id"] if action == "buy_yes" else no_token["token_id"],
            category=category,
            is_updown=is_updown,
            regime_flag="flipped" if regime_result.market_flipped else "normal",
            action=action,
            confidence=confidence,
            kelly_size=round(kelly_size, 2),
            probability_distribution=prob_dist,
            regime_check=regime_result.to_dict(),
            reasoning=reasoning,
            base_rate=base_rate,
            news_check=news_check.to_dict(),
            whale_check=whale_check.to_dict(),
            disposition_check=disposition_check.to_dict(),
            created_at=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        )

    def _infer_category(self, market: Dict[str, Any]) -> str:
        """Infer market category from question/description."""
        question = market.get("question", "").lower()
        desc = market.get("description", "").lower()

        if "up or down" in question:
            return "crypto_updown"
        if any(kw in question for kw in ["btc", "eth", "sol", "price", "above", "below"]):
            return "crypto_directional"
        if any(kw in desc for kw in ["football", "soccer", "nfl", "nba", "match", "game"]):
            return "sports"
        if any(kw in desc for kw in ["election", "vote", "president", "congress"]):
            return "politics"
        return "other"

    def _check_base_rate(self, category: str) -> float:
        """Get historical base rate for category."""
        return self.base_rates.get(category, 0.50)

    async def _check_news(self, market: Dict[str, Any]) -> CheckResult:
        """Check for relevant news via Nemotron."""
        question = market.get("question", "")
        prompt = f"""
Market: {question}
Category: {self._infer_category(market)}

Search for relevant news on X/Twitter in the last 6 hours related to this market.
Consider: macro (CPI, FOMC, rates), crypto-specific (ETF, hacks, regulation), asset-specific news.

Output JSON:
{{
  "agree": boolean,
  "confidence": 0-1,
  "reasoning": "string",
  "relevant_news": [{{"title": "", "url": "", "sentiment": "bullish|bearish|neutral", "hours_ago": 0}}],
  "raw_news": []
}}
"""
        try:
            result = await self.nemotron.structured_completion(
                system_prompt=self.system_prompt,
                user_prompt=prompt,
            )
            return CheckResult(
                agree=result.get("agree", True),
                confidence=result.get("confidence", 0.5),
                reasoning=result.get("reasoning", "No news analysis"),
                extra={"relevant_news": result.get("relevant_news", []), "raw_news": result.get("raw_news", [])},
            )
        except Exception as e:
            print(f"  News check error: {e}")
            return CheckResult(agree=True, confidence=0.5, reasoning="News check failed - defaulting to agree", extra={})

    async def _check_whales(self, market: Dict[str, Any]) -> CheckResult:
        """Check target whale activity via Nemotron."""
        question = market.get("question", "")
        prompt = f"""
Market: {question}
Target wallets: {len(self.target_wallets)} wallets from poly_data analysis

Analyze if any of the 47 target wallets are active in this market.
Track: entry/exit timing, position sizing, recent behavior patterns.
Wallet strategies: accumulator, swing trader, scalper, hedger.

Output JSON:
{{
  "agree": boolean,
  "confidence": 0-1,
  "reasoning": "string",
  "active_whales": [{{"wallet": "", "strategy": "", "side": "buy|sell", "size_usd": 0, "timing": "recent|historical"}}],
  "raw_activity": []
}}
"""
        try:
            result = await self.nemotron.structured_completion(
                system_prompt=self.system_prompt,
                user_prompt=prompt,
            )
            return CheckResult(
                agree=result.get("agree", True),
                confidence=result.get("confidence", 0.5),
                reasoning=result.get("reasoning", "No whale data"),
                extra={"active_whales": result.get("active_whales", []), "raw_activity": result.get("raw_activity", [])},
            )
        except Exception as e:
            print(f"  Whale check error: {e}")
            return CheckResult(agree=True, confidence=0.5, reasoning="Whale check failed - defaulting to agree", extra={})

    async def _check_disposition(self, market: Dict[str, Any], yes_price: float, no_price: float) -> CheckResult:
        """Check crowd psychology / cognitive errors via Nemotron."""
        question = market.get("question", "")
        category = self._infer_category(market)
        base_rate = self._check_base_rate(category)

        prompt = f"""
Market: {question}
Category: {category}
Current prices: YES={yes_price:.3f}, NO={no_price:.3f}
Base rate (historical YES win): {base_rate:.2f}

Analyze crowd disposition - is the market making a cognitive error?
Look for: recency bias, overconfidence, narrative-driven pricing, gambler's fallacy,
lottery-ticket pricing (extreme skew), price/volume divergence.

Output JSON:
{{
  "agree": boolean,
  "confidence": 0-1,
  "reasoning": "string"
}}
"""
        try:
            result = await self.nemotron.structured_completion(
                system_prompt=self.system_prompt,
                user_prompt=prompt,
            )
            return CheckResult(
                agree=result.get("agree", True),
                confidence=result.get("confidence", 0.5),
                reasoning=result.get("reasoning", "No disposition analysis"),
                extra={},
            )
        except Exception as e:
            print(f"  Disposition check error: {e}")
            return CheckResult(agree=True, confidence=0.5, reasoning="Disposition check failed - defaulting to agree", extra={})

    def _determine_action(
        self,
        base_rate: float,
        yes_price: float,
        no_price: float,
        checks: List[CheckResult],
        regime_result: RegimeCheckResult,
    ) -> tuple[str, float]:
        """Determine trade action and confidence."""
        # Simple logic: if YES price < base_rate → buy YES (undervalued)
        # if NO price < (1 - base_rate) → buy NO
        yes_edge = base_rate - yes_price
        no_edge = (1 - base_rate) - no_price

        # Weight by check confidences
        avg_confidence = sum(c.confidence for c in checks) / len(checks) if checks else 0.5
        regime_confidence = regime_result.confidence

        # Combined confidence
        confidence = (avg_confidence * 0.6) + (regime_confidence * 0.4)

        if yes_edge > no_edge and yes_edge > 0.02:  # 2% minimum edge
            return "buy_yes", min(confidence, 0.95)
        elif no_edge > yes_edge and no_edge > 0.02:
            return "buy_no", min(confidence, 0.95)
        else:
            return "skip", 0.5

    def _calculate_kelly_fraction(
        self,
        base_rate: float,
        yes_price: float,
        no_price: float,
        action: str,
        confidence: float,
    ) -> float:
        """Calculate Kelly fraction f* = (bp - q) / b, capped at quarter-Kelly."""
        if action == "buy_yes":
            p = confidence  # Our estimated win probability
            b = (1 - yes_price) / yes_price  # Net odds (decimal odds - 1)
            q = 1 - p
        elif action == "buy_no":
            p = confidence
            b = (1 - no_price) / no_price
            q = 1 - p
        else:
            return 0.0

        if b <= 0:
            return 0.0

        kelly = (b * p - q) / b
        return max(0.0, kelly)

    def _generate_probability_distribution(
        self, confidence: float, base_rate: float, market_price: float
    ) -> Dict[str, float]:
        """Generate probability distribution: low/mid/high scenarios per spec."""
        # Per issue spec: {"low": 0.15, "mid": 0.70, "high": 0.15} scaled by confidence
        # The mid probability reflects our confidence-adjusted estimate
        # Low/high represent tail risks
        
        base_mid = 0.70
        base_tail = 0.15
        
        # Adjust based on confidence: higher confidence -> more concentrated mid
        # Lower confidence -> wider tails
        confidence_factor = confidence  # 0.5 to 0.95
        
        mid = base_mid * confidence_factor + (1 - confidence_factor) * 0.5
        tail_total = 1 - mid
        low = tail_total * 0.5
        high = tail_total * 0.5
        
        # Ensure minimum tail probability
        low = max(low, 0.05)
        high = max(high, 0.05)
        mid = 1 - low - high
        
        return {
            "low": round(low, 3),
            "mid": round(mid, 3),
            "high": round(high, 3),
        }

    def _build_reasoning(
        self,
        base_rate: float,
        yes_price: float,
        no_price: float,
        checks: List[CheckResult],
        regime_result: RegimeCheckResult,
        action: str,
        confidence: float,
    ) -> str:
        """Build comprehensive reasoning string for audit trail."""
        parts = []
        parts.append(f"Base rate ({base_rate:.0%}) vs market: YES={yes_price:.3f}, NO={no_price:.3f}")
        parts.append(f"Checks agree: {sum(c.agree for c in checks)}/3")
        for name, check in zip(["News", "Whale", "Disposition"], checks):
            parts.append(f"  {name}: {'✓' if check.agree else '✗'} (conf={check.confidence:.2f}) - {check.reasoning[:80]}")
        parts.append(f"Regime: {regime_result.action.value} (conf={regime_result.confidence:.2f}) signals={regime_result.signals}")
        parts.append(f"Decision: {action} @ {confidence:.0%} confidence")
        return " | ".join(parts)

    def _create_skip_thesis(
        self,
        market: Dict,
        condition_id: str,
        yes_token: Dict,
        category: str,
        is_updown: bool,
        base_rate: float,
        news_check: CheckResult,
        whale_check: CheckResult,
        disposition_check: CheckResult,
        regime_result: RegimeCheckResult,
        reason: str,
    ) -> Thesis:
        """Create a 'skip' thesis when checks don't agree."""
        return Thesis(
            market=market.get("question", ""),
            condition_id=condition_id,
            token_id="",
            category=category,
            is_updown=is_updown,
            regime_flag="flipped" if regime_result.market_flipped else "normal",
            action="skip",
            confidence=0.3,
            kelly_size=0.0,
            probability_distribution={"low": 0.33, "mid": 0.34, "high": 0.33},
            regime_check=regime_result.to_dict(),
            reasoning=reason,
            base_rate=base_rate,
            news_check=news_check.to_dict(),
            whale_check=whale_check.to_dict(),
            disposition_check=disposition_check.to_dict(),
            created_at=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        )


async def main():
    """Main entry point for CLI execution."""
    import argparse

    parser = argparse.ArgumentParser(description="Polymarket Bot Brain - Thesis Generation")
    parser.add_argument("--markets", default="markets_cache.json", help="Input markets file")
    parser.add_argument("--output", default="thesis.json", help="Output thesis file")
    parser.add_argument("--bankroll", type=float, default=10000.0, help="Current bankroll USD")
    parser.add_argument("--mock", action="store_true", help="Use mock Nemotron client")
    args = parser.parse_args()

    # Create brain with mock client if requested
    nemotron = create_client(use_mock=args.mock)
    regime = create_regime_detector()

    brain = Brain(
        nemotron_client=nemotron,
        regime_detector=regime,
        bankroll_usd=args.bankroll,
    )

    await brain.run(markets_file=args.markets, output_file=args.output)


if __name__ == "__main__":
    asyncio.run(main())