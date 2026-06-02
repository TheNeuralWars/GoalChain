#!/usr/bin/env python3
"""
discord_cleanup_admin.py — GoalChain Discord Admin Cleanup Tool
==============================================================
Scans marketing channels for repetitive/spam posts and deletes them.
Runs as GoalChain Manager bot (needs MANAGE_MESSAGES permission).

Usage:
  DRY RUN (list only, no delete):
    python3 discord_cleanup_admin.py --dry-run

  DELETE repetitive posts from last 48h:
    python3 discord_cleanup_admin.py --delete --hours 48

  DELETE specific message IDs:
    python3 discord_cleanup_admin.py --delete-ids 123456789,987654321

  DELETE all bot's own messages from last 24h (nuke mode):
    python3 discord_cleanup_admin.py --nuke-bot-posts --hours 24
"""

import discord
import asyncio
import argparse
import os
import re
from datetime import datetime, timedelta, timezone
from collections import defaultdict
from difflib import SequenceMatcher

# ─── CONFIG ──────────────────────────────────────────────────────────────────
TOKEN = os.environ.get("DISCORD_BOT_TOKEN",
    "MTUwOTMyMTI0NTczNTM5MTI0Mg.GskD8X.vy0Vozh1KqquBS37xgZ1bviuGBddYdkGzyt1gY")

# Channels to scan (add more IDs as needed)
# Format: {"channel-name": channel_id}
MARKETING_CHANNELS = {
    "marketing-active":   None,   # resolved by name
    "genesis-lounge":     None,
    "announcements":      None,
    "degen-locker-room":  None,
    "general":            None,
    "alpha-room":         None,
}

# Similarity threshold — messages more similar than this are considered duplicates
SIMILARITY_THRESHOLD = 0.72

# Keywords that flag a message as a marketing post (bot-generated)
MARKETING_KEYWORDS = [
    "528", "Grok", "biometric", "Vault", "X-Scout", "Zealy",
    "presale", "GCH", "GoalChain", "World Cup", "WC 2026",
    "Jito", "burn", "airdrop", "SOL", "yield", "stamina",
    "play.goalchain.fun"
]

# ─── SIMILARITY ──────────────────────────────────────────────────────────────
def similarity(a: str, b: str) -> float:
    """Return 0..1 similarity ratio between two strings."""
    # Normalise: lowercase, collapse whitespace, strip mentions/URLs
    def norm(s):
        s = s.lower()
        s = re.sub(r"https?://\S+", "URL", s)
        s = re.sub(r"<[^>]+>", "", s)          # strip Discord mentions/emoji codes
        s = re.sub(r"\s+", " ", s).strip()
        return s
    return SequenceMatcher(None, norm(a), norm(b)).ratio()

def is_marketing_post(content: str) -> bool:
    content_lower = content.lower()
    return sum(1 for kw in MARKETING_KEYWORDS if kw.lower() in content_lower) >= 2

def find_duplicates(messages: list, threshold: float) -> list:
    """Return list of message IDs that are duplicates (keep the FIRST occurrence)."""
    to_delete = []
    seen = []
    for msg in messages:
        if not msg.content:
            continue
        is_dup = False
        for ref in seen:
            if similarity(msg.content, ref.content) >= threshold:
                to_delete.append(msg)
                is_dup = True
                break
        if not is_dup:
            seen.append(msg)
    return to_delete

# ─── BOT ─────────────────────────────────────────────────────────────────────
class CleanupBot(discord.Client):
    def __init__(self, args):
        intents = discord.Intents.default()
        intents.message_content = True
        intents.guilds = True
        intents.messages = True
        super().__init__(intents=intents)
        self.args = args
        self.deleted_count = 0
        self.scanned_count = 0

    async def on_ready(self):
        print(f"\n🤖 Logged in as: {self.user} (ID: {self.user.id})")
        print(f"📋 Mode: {'DRY RUN — no deletes' if self.args.dry_run else 'LIVE DELETE'}")
        print("=" * 60)

        for guild in self.guilds:
            print(f"\n🏠 Server: {guild.name} ({guild.id})")
            await self.process_guild(guild)

        print(f"\n{'=' * 60}")
        print(f"✅ Done. Scanned: {self.scanned_count} | Deleted: {self.deleted_count}")
        await self.close()

    async def process_guild(self, guild: discord.Guild):
        # ── Mode: delete specific IDs ─────────────────────────────────────
        if self.args.delete_ids:
            ids = [int(x.strip()) for x in self.args.delete_ids.split(",")]
            for channel in guild.text_channels:
                for msg_id in ids:
                    try:
                        msg = await channel.fetch_message(msg_id)
                        print(f"  🗑️  Deleting ID {msg_id} in #{channel.name}")
                        if not self.args.dry_run:
                            await msg.delete()
                            self.deleted_count += 1
                            await asyncio.sleep(0.5)
                    except discord.NotFound:
                        pass
                    except discord.Forbidden:
                        print(f"  ⛔ No permission in #{channel.name}")
            return

        # ── Scan channels by name ─────────────────────────────────────────
        cutoff = datetime.now(timezone.utc) - timedelta(hours=self.args.hours)

        for channel in guild.text_channels:
            chan_name = channel.name.lower()
            is_target = any(
                target.lower() in chan_name
                for target in MARKETING_CHANNELS.keys()
            )
            if not is_target:
                continue

            print(f"\n  📢 Scanning #{channel.name}...")
            try:
                messages = []
                async for msg in channel.history(limit=500, after=cutoff):
                    self.scanned_count += 1
                    if msg.author.bot and is_marketing_post(msg.content):
                        messages.append(msg)

                print(f"     Found {len(messages)} bot marketing posts in last {self.args.hours}h")

                if self.args.nuke_bot_posts:
                    # Delete ALL bot marketing posts
                    await self._delete_messages(channel, messages, label="bot-post")

                else:
                    # Only delete DUPLICATES
                    duplicates = find_duplicates(messages, SIMILARITY_THRESHOLD)
                    print(f"     Detected {len(duplicates)} duplicates (>{int(SIMILARITY_THRESHOLD*100)}% similar)")

                    for msg in duplicates:
                        preview = msg.content[:80].replace('\n', ' ')
                        print(f"     🔴 DUP [{msg.id}] {msg.created_at.strftime('%H:%M')} — {preview}…")

                    await self._delete_messages(channel, duplicates, label="duplicate")

            except discord.Forbidden:
                print(f"     ⛔ No access to #{channel.name}")
            except Exception as e:
                print(f"     ❌ Error in #{channel.name}: {e}")

    async def _delete_messages(self, channel, messages, label="message"):
        if not messages:
            return

        if self.args.dry_run:
            print(f"     [DRY RUN] Would delete {len(messages)} {label}(s)")
            return

        # Discord bulk delete only works for messages < 14 days old
        now = datetime.now(timezone.utc)
        bulk = [m for m in messages if (now - m.created_at).days < 14]
        old  = [m for m in messages if (now - m.created_at).days >= 14]

        # Bulk delete (up to 100 at a time)
        for i in range(0, len(bulk), 100):
            batch = bulk[i:i+100]
            try:
                if len(batch) == 1:
                    await batch[0].delete()
                else:
                    await channel.purge(limit=None, check=lambda m: m.id in {x.id for x in batch})
                self.deleted_count += len(batch)
                print(f"     🗑️  Bulk-deleted {len(batch)} {label}(s)")
                await asyncio.sleep(1)
            except discord.Forbidden:
                print(f"     ⛔ Bulk delete forbidden — trying one-by-one")
                for msg in batch:
                    try:
                        await msg.delete()
                        self.deleted_count += 1
                        await asyncio.sleep(0.6)
                    except Exception as e:
                        print(f"     ❌ {e}")

        # Old messages (>14 days) must be deleted one by one
        for msg in old:
            try:
                await msg.delete()
                self.deleted_count += 1
                await asyncio.sleep(0.8)
            except Exception as e:
                print(f"     ❌ {e}")

# ─── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="GoalChain Discord Cleanup Admin")
    parser.add_argument("--dry-run", action="store_true",
        help="List duplicates only — do NOT delete anything")
    parser.add_argument("--delete", action="store_true",
        help="Delete duplicate/repetitive posts")
    parser.add_argument("--hours", type=int, default=48,
        help="How many hours back to scan (default: 48)")
    parser.add_argument("--nuke-bot-posts", action="store_true",
        help="Delete ALL bot marketing posts (not just duplicates)")
    parser.add_argument("--delete-ids", type=str,
        help="Comma-separated list of specific message IDs to delete")
    parser.add_argument("--threshold", type=float, default=SIMILARITY_THRESHOLD,
        help=f"Similarity threshold 0-1 (default: {SIMILARITY_THRESHOLD})")

    args = parser.parse_args()

    # Default to dry-run if nothing explicit
    if not args.delete and not args.nuke_bot_posts and not args.delete_ids:
        args.dry_run = True
        print("ℹ️  No action flag given — defaulting to --dry-run")

    bot = CleanupBot(args)
    bot.run(TOKEN)

if __name__ == "__main__":
    main()
