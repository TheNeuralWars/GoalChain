"""English-only guard for video pipeline copy.

The actual check lives in ops/hermes/social_multiplexer.py::check_english_max_law.
We lazy-import it so callers don't need to pre-wire sys.path.
"""
from __future__ import annotations

import importlib
import sys
from pathlib import Path
from typing import Iterable


def _get_impl():
    """Lazy import to avoid pre-load path dependencies."""
    if "social_multiplexer" in sys.modules:
        return sys.modules["social_multiplexer"].check_english_max_law
    # Add ops/hermes to sys.path once, idempotently.
    ops_hermes = str(Path(__file__).resolve().parents[4] / "ops" / "hermes")
    if ops_hermes not in sys.path:
        sys.path.insert(0, ops_hermes)
    mod = importlib.import_module("social_multiplexer")
    return mod.check_english_max_law


class EnglishMaxViolation(ValueError):
    """Raised when text violates the English Max Law."""


def assert_english(text: str, *, what: str = "text") -> None:
    """Raise EnglishMaxViolation if `text` violates English Max Law."""
    impl = _get_impl()
    try:
        impl(text)
    except ValueError as e:
        raise EnglishMaxViolation(f"{what}: {e}") from e


def assert_each(items: Iterable[tuple[str, str]]) -> None:
    for name, text in items:
        assert_english(text, what=name)

