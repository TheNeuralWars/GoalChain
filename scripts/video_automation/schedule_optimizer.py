#!/usr/bin/env python3
"""
schedule_optimizer.py — Hermes Smart Scheduling Engine

Calculates optimal Buffer posting slots for GoalChain videos using:
- Platform-specific audience peak hours (LATAM/Argentina UTC-3)
- Hype-building sequencing strategy (TikTok → Instagram → YouTube)
- Minimum gap enforcement between posts on same channel
- Buffer queue awareness (doesn't over-schedule)

Usage:
    from schedule_optimizer import get_scheduled_at
    iso_ts = get_scheduled_at(channel_id, channel_service)
"""
import json
import urllib.request
from datetime import datetime, timezone, timedelta
import sys
from typing import Optional

# ── Constants ────────────────────────────────────────────────────────────────

BUFFER_TOKEN = "VB1d1PaKlkyQA-Q97Go4k7SIbk9kQcBxy8pVaRAYJta"
BUFFER_API = "https://api.buffer.com"

# LATAM target timezone: Argentina/Buenos Aires UTC-3 (no DST)
LATAM_TZ = timezone(timedelta(hours=-3))

# Channel service mapping
CHANNEL_SERVICES = {
    "6a283a868f1d11f9b26b0226": "tiktok",       # NicoPezDorado TikTok
    "6a283a4d8f1d11f9b26b0068": "youtube",       # GoalChainSol YouTube Shorts
    "6a283a328f1d11f9b26aff82": "instagram",     # GoalChainSol Instagram
}

# Peak hour ranges by platform (in LATAM/Argentina local time, UTC-3)
# Format: list of (start_hour, end_hour) tuples — we'll aim for start_hour
PLATFORM_PEAKS = {
    "tiktok": [
        (7, 9),    # Morning commute
        (12, 14),  # Lunch break
        (19, 21),  # Prime evening
        (21, 23),  # Late night
    ],
    "youtube": [
        (12, 15),  # Post-lunch
        (18, 20),  # After work
        (20, 22),  # Prime time
    ],
    "instagram": [
        (11, 13),  # Late morning
        (19, 21),  # Prime evening
        (21, 23),  # Late night
    ],
}

# Hype sequencing offset: after TikTok drops, wait before Instagram/YouTube
# This creates cross-platform momentum (people see it on TikTok → search on IG/YT)
HYPE_OFFSETS = {
    "tiktok": 0,       # First to post
    "instagram": 2,    # 2h after TikTok
    "youtube": 4,      # 4h after TikTok
}

# Best days for football content (1=Monday...7=Sunday)
HIGH_ENGAGEMENT_DAYS = {1, 2, 3, 6, 7}  # Mon, Tue, Wed, Sat, Sun
LOW_ENGAGEMENT_DAYS = {4, 5}             # Thu, Fri (slightly lower)

# Minimum gap between consecutive posts on the same channel (hours)
MIN_GAP_HOURS = 3


# ── Buffer Queue Query ────────────────────────────────────────────────────────

def get_pending_scheduled_times(channel_id: str) -> list[datetime]:
    """Query Buffer's pending/scheduled posts for a channel to avoid over-scheduling."""
    query = """
    query GetPendingPosts($input: PostsInput!) {
      posts(input: $input) {
        edges {
          node {
            id
            dueAt
            status
          }
        }
      }
    }
    """
    variables = {
        "input": {
            "organizationId": "6a2816a912de31678241942c",
            "filter": {
                "channelIds": [channel_id],
                "status": ["scheduled", "needs_approval"]
            }
        }
    }
    try:
        payload = json.dumps({"query": query, "variables": variables}).encode("utf-8")
        req = urllib.request.Request(
            BUFFER_API,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {BUFFER_TOKEN}",
            },
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read().decode("utf-8"))
        
        edges = data.get("data", {}).get("posts", {}).get("edges", [])
        times = []
        for edge in edges:
            node = edge.get("node", {})
            due_at = node.get("dueAt")
            if due_at:
                try:
                    dt = datetime.fromisoformat(due_at.replace("Z", "+00:00"))
                    times.append(dt)
                except Exception:
                    pass
        return times
    except Exception as e:
        err_body = ""
        if hasattr(e, "read"):
            try:
                err_body = " - " + e.read().decode("utf-8")
            except:
                pass
        print(f"[Optimizer] Warning: Could not fetch Buffer queue: {e}{err_body}", file=sys.stderr)
        return []


# ── Core Scheduling Logic ─────────────────────────────────────────────────────

def _find_next_peak_slot(
    service: str,
    after: datetime,
    busy_times: list[datetime],
) -> datetime:
    """
    Find the next available peak-hour slot for a given service.
    
    Args:
        service: 'tiktok', 'instagram', or 'youtube'
        after: earliest datetime to consider (UTC)
        busy_times: list of already-scheduled datetimes for this channel (UTC)
    
    Returns:
        datetime in UTC of the chosen slot
    """
    peaks = PLATFORM_PEAKS.get(service, [(19, 21)])
    
    # Convert 'after' to LATAM local time for day/hour reasoning
    after_local = after.astimezone(LATAM_TZ)
    
    # Try up to 14 days ahead to find a slot
    for day_offset in range(14):
        candidate_date = after_local.date() + timedelta(days=day_offset)
        weekday = candidate_date.isoweekday()  # 1=Mon, 7=Sun
        
        # Prefer high-engagement days, but don't skip low-engagement days if needed
        day_penalty = 0 if weekday in HIGH_ENGAGEMENT_DAYS else 1
        
        for (peak_start, peak_end) in peaks:
            # Pick the start of the peak window as our candidate hour
            candidate_local = datetime(
                candidate_date.year, candidate_date.month, candidate_date.day,
                peak_start, 0, 0,
                tzinfo=LATAM_TZ
            )
            candidate_utc = candidate_local.astimezone(timezone.utc)
            
            # Skip if this slot is in the past or too soon
            if candidate_utc <= after + timedelta(minutes=30):
                continue
            
            # Check minimum gap against already-busy times
            too_close = any(
                abs((candidate_utc - bt).total_seconds()) < MIN_GAP_HOURS * 3600
                for bt in busy_times
            )
            if too_close:
                continue
            
            # Found a valid slot
            busy_times.append(candidate_utc)  # Reserve it
            print(f"[Optimizer] {service}: slot -> {candidate_local.strftime('%a %d/%m %H:%M')} ART ({day_penalty=})", file=sys.stderr)
            return candidate_utc
    
    # Fallback: schedule 24h from now
    fallback = after + timedelta(hours=24)
    print(f"[Optimizer] {service}: fallback slot -> {fallback}", file=sys.stderr)
    return fallback


def get_scheduled_at(channel_id: str, all_channel_ids: Optional[list] = None) -> str:
    """
    Calculate optimal Buffer scheduledAt timestamp for a video.
    
    Applies hype-sequencing: if multiple channels are being posted at once
    (e.g. TikTok + Instagram + YouTube for GoalChainSol), they're staggered
    to create cross-platform momentum.
    
    Args:
        channel_id: Buffer channel ID to schedule for
        all_channel_ids: All channels being posted in this run (for hype offset)
    
    Returns:
        ISO8601 UTC string for Buffer's scheduledAt field (e.g. "2026-06-28T20:00:00Z")
    """
    service = CHANNEL_SERVICES.get(channel_id, "instagram")
    now_utc = datetime.now(timezone.utc)
    
    # Fetch already-scheduled times for this channel
    busy_times = get_pending_scheduled_times(channel_id)
    
    # Apply hype offset if multiple channels are in this run
    hype_offset_hours = 0
    if all_channel_ids and len(all_channel_ids) > 1:
        # Sort channels by their hype order: TikTok first, then Instagram, then YouTube
        def channel_order(cid):
            svc = CHANNEL_SERVICES.get(cid, "instagram")
            return HYPE_OFFSETS.get(svc, 2)
        
        sorted_channels = sorted(all_channel_ids, key=channel_order)
        if channel_id in sorted_channels:
            hype_offset_hours = HYPE_OFFSETS.get(service, 0)
    
    # Earliest possible time (now + buffer + hype offset)
    earliest = now_utc + timedelta(minutes=15) + timedelta(hours=hype_offset_hours)
    
    # Find next optimal slot
    slot_utc = _find_next_peak_slot(service, earliest, busy_times)
    
    return slot_utc.strftime("%Y-%m-%dT%H:%M:%SZ")


def get_schedule_preview(channel_ids: list) -> dict:
    """
    Returns a preview of upcoming schedule slots for the given channels.
    Used by the API endpoint for the UI.
    """
    preview = {}
    now_utc = datetime.now(timezone.utc)
    
    for channel_id in channel_ids:
        service = CHANNEL_SERVICES.get(channel_id, "instagram")
        busy_times = get_pending_scheduled_times(channel_id)
        
        slots = []
        after = now_utc
        for i in range(5):  # Next 5 slots
            slot = _find_next_peak_slot(service, after, busy_times)
            slots.append(slot.isoformat())
            after = slot + timedelta(hours=MIN_GAP_HOURS)
        
        preview[channel_id] = {
            "service": service,
            "next_slots": slots,
            "pending_in_queue": len([
                t for t in get_pending_scheduled_times(channel_id)
                if t > now_utc
            ])
        }
    
    return preview


if __name__ == "__main__":
    import sys
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument("--preview", action="store_true", help="Print schedule preview JSON")
    parser.add_argument("--channel", type=str, help="Channel ID to calculate next slot for")
    parser.add_argument("--all-channels", nargs="+", help="All channel IDs in this run")
    
    args = parser.parse_args()
    
    all_ids = [
        "6a283a868f1d11f9b26b0226",
        "6a283a4d8f1d11f9b26b0068",
        "6a283a328f1d11f9b26aff82",
    ]
    
    if args.preview:
        preview_data = get_schedule_preview(all_ids)
        print(json.dumps(preview_data, indent=2))
        sys.exit(0)
        
    if args.channel:
        slot = get_scheduled_at(args.channel, args.all_channels)
        print(slot)
        sys.exit(0)
        
    print("=== Schedule Optimizer — Dry Run ===")
    print(f"Now (UTC): {datetime.now(timezone.utc).isoformat()}")
    print(f"Now (ART): {datetime.now(LATAM_TZ).strftime('%a %d/%m/%Y %H:%M')} UTC-3\n")
    
    for cid in all_ids:
        svc = CHANNEL_SERVICES.get(cid, "?")
        slot = get_scheduled_at(cid, all_ids)
        slot_dt = datetime.fromisoformat(slot.replace("Z", "+00:00"))
        slot_art = slot_dt.astimezone(LATAM_TZ)
        print(f"  [{svc}] -> {slot_art.strftime('%a %d/%m %H:%M')} ART  (UTC: {slot})")
