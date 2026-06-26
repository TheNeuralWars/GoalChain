"""Mattermost background listener daemon for GoalChain.

Polls Mattermost channels and DMs for mentions/messages directed at Hermes,
executes them through the LangGraph multi-agent swarm, and returns responses.
"""

from __future__ import annotations

import logging
import threading
import time
import urllib.request
import urllib.error
import json
from typing import Any

from goalchain_multiagent.config import Settings, get_settings
from goalchain_multiagent.graph import run_objective

logger = logging.getLogger(__name__)

# Global flag to control the background thread loop
_running = False
_thread: threading.Thread | None = None


def _http_get(url: str, token: str) -> dict | None:
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as exc:
        logger.debug("Mattermost GET failed: %s", exc)
        return None


def _http_post(url: str, payload: dict, token: str) -> dict | None:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as exc:
        logger.error("Mattermost POST failed: %s", exc)
        return None


class MattermostListener:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.token = settings.goalchain_ma_mattermost_bot_token.strip()
        self.server_url = settings.goalchain_ma_mattermost_url.strip()
        self.bot_id = ""
        self.bot_username = ""
        self.last_post_ids: set[str] = set()
        self.initialized = False

    def setup(self) -> bool:
        if not self.token or not self.server_url:
            logger.warning("Mattermost credentials missing. Listener will not run.")
            return False

        # Get bot details
        url = f"{self.server_url.rstrip('/')}/api/v4/users/me"
        me = _http_get(url, self.token)
        if me and "id" in me:
            self.bot_id = me["id"]
            self.bot_username = me["username"]
            logger.info("Mattermost Bot authenticated as @%s (ID: %s)", self.bot_username, self.bot_id)
            self.initialized = True
            return True
        logger.error("Failed to authenticate Mattermost bot.")
        return False

    def poll_once(self) -> None:
        if not self.initialized:
            return

        # 1. Get all channels the bot is in
        url = f"{self.server_url.rstrip('/')}/api/v4/users/me/channels"
        channels = _http_get(url, self.token)
        if not isinstance(channels, list):
            return

        for ch in channels:
            ch_id = ch.get("id")
            ch_type = ch.get("type")  # 'O' (open), 'P' (private), 'D' (direct message)
            if not ch_id:
                continue

            # 2. Get recent posts for this channel
            posts_url = f"{self.server_url.rstrip('/')}/api/v4/channels/{ch_id}/posts?page=0&per_page=5"
            posts_data = _http_get(posts_url, self.token)
            if not posts_data or "posts" not in posts_data:
                continue

            posts = posts_data["posts"]
            order = posts_data.get("order", [])

            # We process posts in chronological order (reverse of the returned order)
            for post_id in reversed(order):
                if post_id in self.last_post_ids:
                    continue

                # Add to history map so we only process new posts
                self.last_post_ids.add(post_id)
                # Keep cache bounded
                if len(self.last_post_ids) > 1000:
                    self.last_post_ids.clear()

                post = posts.get(post_id)
                if not post:
                    continue

                user_id = post.get("user_id")
                # Ignore posts made by the bot itself
                if user_id == self.bot_id:
                    continue

                message = post.get("message", "").strip()
                if not message:
                    continue

                # 3. Check if the post is a mention or a direct message
                is_dm = ch_type == "D"
                is_mention = f"@{self.bot_username}" in message

                if is_dm or is_mention:
                    # Clean the message text from mention prefix if present
                    clean_msg = message.replace(f"@{self.bot_username}", "").strip()
                    logger.info("Mattermost: Processing objective: %s", clean_msg)

                    # 4. Invoke LangGraph Swarm Agent
                    try:
                        result = run_objective(
                            clean_msg,
                            source="mattermost",
                            actor=post.get("props", {}).get("from_users", "user"),
                            thread_id=post.get("root_id") or post_id,
                        )
                        reply = result.get("summary") or "Completo sin reporte."
                    except Exception as e:
                        logger.exception("Error running LangGraph objective from Mattermost: %s", e)
                        reply = f"❌ **Error:** {e}"

                    # 5. Reply to Mattermost channel
                    reply_url = f"{self.server_url.rstrip('/')}/api/v4/posts"
                    _http_post(
                        reply_url,
                        {
                            "channel_id": ch_id,
                            "message": reply,
                            "root_id": post.get("root_id") or post_id,  # Thread reply
                        },
                        self.token,
                    )


def _listener_loop() -> None:
    global _running
    settings = get_settings()
    listener = MattermostListener(settings)
    if not listener.setup():
        _running = False
        return

    # Seed the initial post list to avoid replying to old messages on startup
    url = f"{settings.goalchain_ma_mattermost_url.strip().rstrip('/')}/api/v4/users/me/channels"
    channels = _http_get(url, listener.token)
    if isinstance(channels, list):
        for ch in channels:
            ch_id = ch.get("id")
            if ch_id:
                posts_url = f"{settings.goalchain_ma_mattermost_url.strip().rstrip('/')}/api/v4/channels/{ch_id}/posts?page=0&per_page=5"
                posts_data = _http_get(posts_url, listener.token)
                if posts_data and "order" in posts_data:
                    listener.last_post_ids.update(posts_data["order"])

    while _running:
        try:
            listener.poll_once()
        except Exception as e:
            logger.error("Error in Mattermost polling iteration: %s", e)
        time.sleep(5)  # Poll every 5 seconds


def start_mattermost_listener() -> None:
    global _running, _thread
    settings = get_settings()
    if not settings.goalchain_multiagent_enabled:
        return
    if not settings.goalchain_ma_mattermost_bot_token.strip():
        return

    if _running:
        return

    _running = True
    _thread = threading.Thread(target=_listener_loop, name="MattermostListener", daemon=True)
    _thread.start()
    logger.info("Mattermost Background Listener Thread started.")


def stop_mattermost_listener() -> None:
    global _running, _thread
    if not _running:
        return
    _running = False
    if _thread:
        _thread.join(timeout=5)
        _thread = None
    logger.info("Mattermost Background Listener Thread stopped.")
