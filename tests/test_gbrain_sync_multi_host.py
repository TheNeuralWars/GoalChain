#!/usr/bin/env python3
"""Smoke tests for ops/hermes/gbrain-sync-server.py multi-host binding.

GBRAIN_SYNC_HOST may be a comma/whitespace-separated list of bind addresses;
one ThreadingHTTPServer is started per address on the shared port. A single
address must behave exactly as before.

Stdlib-only (unittest). Run: python3 tests/test_gbrain_sync_multi_host.py
"""

from __future__ import annotations

import os
import subprocess
import sys
import tempfile
import time
import unittest
import urllib.error
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SERVER = REPO_ROOT / "ops" / "hermes" / "gbrain-sync-server.py"
PORT = 18648
STARTUP_TIMEOUT = 10.0


def _health(host: str, port: int, timeout: float = 1.0) -> int:
    """Return the HTTP status of GET /health on host:port (raises on network error)."""
    with urllib.request.urlopen(f"http://{host}:{port}/health", timeout=timeout) as resp:
        return resp.status


def _wait_ready(host: str, port: int, deadline: float) -> None:
    while time.time() < deadline:
        try:
            if _health(host, port) == 200:
                return
        except (urllib.error.URLError, OSError, ConnectionError):
            time.sleep(0.1)
    raise AssertionError(f"server not ready on {host}:{port}")


class MultiHostBindTest(unittest.TestCase):
    def _start(self, hosts: str) -> subprocess.Popen:
        env = dict(os.environ)
        env["GBRAIN_SYNC_HOST"] = hosts
        env["GBRAIN_SYNC_PORT"] = str(PORT)
        env["GBRAIN_SYNC_DIR"] = tempfile.mkdtemp(prefix="gbrain-sync-test-")
        proc = subprocess.Popen(
            [sys.executable, str(SERVER)],
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        self.addCleanup(self._stop, proc)
        return proc

    @staticmethod
    def _stop(proc: subprocess.Popen) -> None:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait(timeout=5)

    def test_multi_host_binds_each_address(self) -> None:
        self._start("127.0.0.1,127.0.0.2")
        deadline = time.time() + STARTUP_TIMEOUT
        _wait_ready("127.0.0.1", PORT, deadline)
        _wait_ready("127.0.0.2", PORT, deadline)
        self.assertEqual(_health("127.0.0.1", PORT), 200)
        self.assertEqual(_health("127.0.0.2", PORT), 200)

    def test_whitespace_and_empty_entries_tolerated(self) -> None:
        self._start(" 127.0.0.1 ,, 127.0.0.2 , ")
        deadline = time.time() + STARTUP_TIMEOUT
        _wait_ready("127.0.0.1", PORT, deadline)
        _wait_ready("127.0.0.2", PORT, deadline)

    def test_single_address_binds_only_one(self) -> None:
        self._start("127.0.0.1")
        deadline = time.time() + STARTUP_TIMEOUT
        _wait_ready("127.0.0.1", PORT, deadline)
        self.assertEqual(_health("127.0.0.1", PORT), 200)
        with self.assertRaises((urllib.error.URLError, OSError, ConnectionError)):
            _health("127.0.0.2", PORT, timeout=0.5)


if __name__ == "__main__":
    unittest.main(verbosity=2)
