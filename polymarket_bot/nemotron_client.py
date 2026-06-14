"""
Nemotron 3 Ultra client via Hermes Gateway.

Connects to local Hermes gateway at http://localhost:8642/v1
Model: nvidia/nemotron-3-ultra:free (free tier via NVIDIA NIM proxy)
"""

import os
import json
import asyncio
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from openai import AsyncOpenAI
from pydantic import BaseModel


@dataclass
class NemotronConfig:
    base_url: str = "http://localhost:8642/v1"
    model: str = "nvidia/nemotron-3-ultra:free"
    temperature: float = 0.1
    max_tokens: int = 4096
    timeout: float = 60.0


class NemotronClient:
    """Async client for Nemotron 3 Ultra via Hermes Gateway."""

    def __init__(self, config: Optional[NemotronConfig] = None):
        self.config = config or NemotronConfig()
        self.client = AsyncOpenAI(
            base_url=self.config.base_url,
            api_key="not-needed",  # Gateway handles NVIDIA NIM proxy
            timeout=self.config.timeout,
        )

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        response_format: Optional[Dict[str, str]] = None,
    ) -> str:
        """
        Send chat completion request to Nemotron.

        Args:
            messages: List of {"role": "system|user|assistant", "content": "..."}
            temperature: Override default temperature (0.1 for deterministic reasoning)
            max_tokens: Override default max tokens
            response_format: Optional {"type": "json_object"} for JSON mode

        Returns:
            Assistant message content as string
        """
        kwargs = {
            "model": self.config.model,
            "messages": messages,
            "temperature": temperature if temperature is not None else self.config.temperature,
            "max_tokens": max_tokens or self.config.max_tokens,
        }
        if response_format:
            kwargs["response_format"] = response_format

        try:
            response = await self.client.chat.completions.create(**kwargs)
            return response.choices[0].message.content or ""
        except Exception as e:
            raise RuntimeError(f"Nemotron API error: {e}") from e

    async def structured_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        schema: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Get structured JSON output from Nemotron.

        Args:
            system_prompt: System prompt
            user_prompt: User prompt
            schema: Optional JSON schema for validation

        Returns:
            Parsed JSON response
        """
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        # Request JSON output
        response_text = await self.chat_completion(
            messages=messages,
            response_format={"type": "json_object"},
        )

        try:
            return json.loads(response_text)
        except json.JSONDecodeError as e:
            # Attempt to extract JSON from response
            start = response_text.find("{")
            end = response_text.rfind("}") + 1
            if start >= 0 and end > start:
                try:
                    return json.loads(response_text[start:end])
                except json.JSONDecodeError:
                    pass
            raise RuntimeError(f"Failed to parse JSON response: {e}\nResponse: {response_text[:500]}")


class MockNemotronClient:
    """Mock client for development when gateway is unavailable."""

    def __init__(self, config: Optional[NemotronConfig] = None):
        self.config = config or NemotronConfig()

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        response_format: Optional[Dict[str, str]] = None,
    ) -> str:
        # Return mock structured response based on last user message
        user_msg = messages[-1]["content"] if messages else ""
        return self._mock_response(user_msg)

    async def structured_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        schema: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        response_text = await self.chat_completion(
            [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}]
        )
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            # Return default mock structure
            return self._default_mock_structured()

    def _mock_response(self, user_prompt: str) -> str:
        if "regime" in user_prompt.lower():
            return json.dumps(
                {
                    "market_flipped": False,
                    "confidence": 0.92,
                    "action": "continue",
                    "signals": [],
                }
            )
        elif "news" in user_prompt.lower():
            return json.dumps(
                {
                    "agree": True,
                    "confidence": 0.65,
                    "reasoning": "No significant macro news in last 6h. Crypto-specific news neutral.",
                    "relevant_news": [],
                }
            )
        elif "whale" in user_prompt.lower():
            return json.dumps(
                {
                    "agree": True,
                    "confidence": 0.55,
                    "reasoning": "No target whale activity detected in this market.",
                    "active_whales": [],
                }
            )
        elif "disposition" in user_prompt.lower() or "crowd" in user_prompt.lower():
            return json.dumps(
                {
                    "agree": True,
                    "confidence": 0.70,
                    "reasoning": "Market shows signs of recency bias - pricing in recent momentum.",
                }
            )
        else:
            # General thesis generation
            return json.dumps(
                {
                    "action": "buy_yes",
                    "confidence": 0.75,
                    "reasoning": "Mock analysis: 3/4 checks agree, base rate deviation detected.",
                    "probability_dist": {"low": 0.15, "mid": 0.70, "high": 0.15},
                }
            )

    def _default_mock_structured(self) -> Dict[str, Any]:
        return {
            "action": "buy_yes",
            "confidence": 0.75,
            "reasoning": "Mock analysis: 3/4 checks agree",
            "probability_dist": {"low": 0.15, "mid": 0.70, "high": 0.15},
        }


def create_client(use_mock: bool = False) -> NemotronClient | MockNemotronClient:
    """Factory function to create appropriate client."""
    if use_mock or os.getenv("NEMOTRON_USE_MOCK", "").lower() in ("1", "true", "yes"):
        return MockNemotronClient()
    return NemotronClient()