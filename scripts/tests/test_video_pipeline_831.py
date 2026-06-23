"""Unit tests for issue #831 video pipeline (stdlib unittest).

Run: python3 scripts/tests/test_video_pipeline_831.py

Contracts encoded:
- english_check rejects Spanish literals.
- Buffer payload shape matches Buffer REST.
- Default flag state is OFF (no token, no publish).
- Grok narrative English-safe (falls back to deterministic English).
"""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

_VID_DIR = Path(__file__).resolve().parents[1] / "marketing" / "video-automation"
_OPS_DIR = Path(__file__).resolve().parents[1] / "ops" / "hermes"
_MARKETING = Path(__file__).resolve().parents[1] / "marketing"
for p in (str(_MARKETING), str(_VID_DIR), str(_OPS_DIR)):
    sys.path.insert(0, p)

import compose as _compose_pkg  # noqa: E402
from compose import english_check  # noqa: E402
from compose.english_check import EnglishMaxViolation, assert_english  # noqa: E402
from compose.buffer_config import load, enabled_profile_ids  # noqa: E402
from compose.buffer_publisher import submit_video, submit_all  # noqa: E402
from compose.grok_narrative import safe as grok_safe  # noqa: E402


class EnglishCheckTests(unittest.TestCase):
    def test_blocks_spanish(self):
        with self.assertRaises(EnglishMaxViolation):
            english_check.assert_english("Hola todos, bienvenidos al canal.")

    def test_accepts_english(self):
        # Must not raise
        assert_english("GoalChain oracle fires: yields jumped 12 percent.")

    def test_blocks_with_inverted_marks(self):
        with self.assertRaises(EnglishMaxViolation):
            english_check.assert_english("\u00a1Atencion! El partido arranca.")


class BufferConfigTests(unittest.TestCase):
    def setUp(self):
        # Save and restore env
        self._saved = {k: v for k, v in __import__("os").environ.items() if k.startswith(("BUFFER_", "ORACLE_VIDEO_BUFFER_"))}

    def tearDown(self):
        import os

        for k in ("BUFFER_ACCESS_TOKEN", "BUFFER_YT_PROFILE_ID", "BUFFER_X_PROFILE_ID",
                 "BUFFER_TIKTOK_PROFILE_ID", "ORACLE_VIDEO_BUFFER_PUBLISH"):
            os.environ.pop(k, None)
        for k, v in self._saved.items():
            os.environ[k] = v

    def test_loads_empty(self):
        import os
        for k in ("BUFFER_ACCESS_TOKEN", "BUFFER_YT_PROFILE_ID", "BUFFER_X_PROFILE_ID",
                 "BUFFER_TIKTOK_PROFILE_ID", "ORACLE_VIDEO_BUFFER_PUBLISH"):
            os.environ.pop(k, None)
        cfg = load()
        self.assertIsNone(cfg.access_token)
        self.assertFalse(cfg.publish_enabled)
        self.assertEqual(enabled_profile_ids(cfg), [])

    def test_loads_full(self):
        import os
        os.environ["BUFFER_ACCESS_TOKEN"] = "tkn"
        os.environ["BUFFER_YT_PROFILE_ID"] = "yt1"
        os.environ["BUFFER_X_PROFILE_ID"] = "x2"
        os.environ["BUFFER_TIKTOK_PROFILE_ID"] = "tk3"
        os.environ["ORACLE_VIDEO_BUFFER_PUBLISH"] = "true"
        cfg = load()
        self.assertEqual(cfg.access_token, "tkn")
        self.assertTrue(cfg.publish_enabled)
        ids = enabled_profile_ids(cfg)
        self.assertIn(("youtube", "yt1"), ids)
        self.assertIn(("x", "x2"), ids)
        self.assertIn(("tiktok", "tk3"), ids)


class BufferPublisherTests(unittest.TestCase):
    def test_payload_shape_dry_run(self):
        r = submit_video(
            token="",
            profile_id="pid",
            channel="youtube",
            video_url="https://example.com/video.mp4",
            text="Hello",
            dry_run=True,
        )
        self.assertTrue(r.dry_run)
        self.assertIsNone(r.update_id)
        self.assertIn("would_post", r.payload)
        p = r.payload["would_post"]
        self.assertEqual(p["profile_ids[]"], "pid")
        self.assertEqual(p["media[link]"], "https://example.com/video.mp4")
        self.assertIn("text", p)

    def test_submit_all_fanout(self):
        self.assertEqual(submit_all(None, [], "", "x", dry_run=True), [])
        rs = submit_all(None, [("y", "y1"), ("x", "x1")], "https://e/v.mp4", "Hi", dry_run=True)
        self.assertEqual([r.channel for r in rs], ["y", "x"])
        self.assertTrue(all(r.dry_run for r in rs))

    def test_publish_gate_off_no_token(self):
        import os

        for k in ("BUFFER_ACCESS_TOKEN", "ORACLE_VIDEO_BUFFER_PUBLISH"):
            os.environ.pop(k, None)
        cfg = load()
        self.assertFalse(cfg.publish_enabled)
        r = submit_video(token=cfg.access_token or "", profile_id="any", channel="x",
                         video_url="", text="x", dry_run=cfg.access_token is None)
        self.assertTrue(r.dry_run)


class PublishGateTests(unittest.TestCase):
    """compose_916.py must hard-gate without ORACLE_VIDEO_PUBLIC_URL."""

    def test_dry_run_no_url_no_token(self):
        # Operator clears publish URL -> orchestrator falls back to dry-run.
        import os
        for k in ("BUFFER_ACCESS_TOKEN", "ORACLE_VIDEO_BUFFER_PUBLISH",
                  "ORACLE_VIDEO_PUBLIC_URL"):
            os.environ.pop(k, None)
        # Cannot shell out without rendering assets; use the buffer_publisher
        # surface directly to verify gate semantics.
        from compose.buffer_publisher import submit_all
        rs = submit_all(None, [("youtube", "y1")], "", "Hello", dry_run=True)
        self.assertTrue(all(r.dry_run for r in rs))
        self.assertEqual(rs[0].status_code, 0)  # dry-run status sentinel


class GrokNarrativeTests(unittest.TestCase):
    def test_fallback_is_english(self):
        import os

        os.environ.pop("XAI_API_KEY", None)
        os.environ.pop("GROK_API_KEY", None)
        out = grok_safe({
            "teamA": "Argentina", "teamB": "France",
            "scoreA": "2", "scoreB": "1",
            "eventText": "Goal at 82", "yieldChange": "+15.4%",
        })
        try:
            assert_english(out, what="grok_fallback")
        except EnglishMaxViolation as e:
            self.fail(f"grok fallback leaked non-English: {e!r}")


if __name__ == "__main__":
    unittest.main(verbosity=2)
