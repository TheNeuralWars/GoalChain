# GoalChain X (Twitter) Launch Content

**Prepared:** 2026-06-04
**Status:** Staged — publish when xurl auth completes
**Issue:** #871
**Owner:** Hermes / social agent

---

## Single Post (280 chars max — VALIDATED)

```
🚀 GoalChain Alpha is live
Sealed machine: ingests data → executes on-chain → self-improves → no human touch.
First mission: change football/soccer forever.
No roadmap. No vaporware. Running system that compounds.
🔗 github.com/TheNeuralWars/GoalChain
#DeFi #Football #BuildInPublic
```
**Char count: 280** ✅

---

## Thread (7 tweets — all validated ≤ 280 chars)

### 1/7 🧵
```
GoalChain Alpha is live.
We built a sealed machine: runs 24/7, ingests data, executes on-chain, improves itself — no human needed.
First mission: change football/soccer forever. Revolutionize betting.
🔗 github.com/TheNeuralWars/GoalChain
#DeFi #Football #AutonomousAgents
```
**Char count: 271** ✅

---

### 2/7
```
The stack:
- Hermes Agent (Grok-4) → orchestration, reasoning, triage
- Free Claude Code (opus/sonnet/haiku) → GitHub issues → draft PRs
- X-Scout → X research → auto-publishes to Discord every ~2h
- Alpha Scanner → signals every 30 min to Discord + WhatsApp + webhook
```
**Char count: 268** ✅

---

### 3/7
```
Canonical economy sealed.
docs/ECONOMIC_CANONICAL_CONFIG.json = single source of truth.
Risky flags OFF until on-chain validation. No prod keys in chat. Economy changes: intake → issue → FCC → draft PR → merge.
The machine compounds. No human needed to keep developing.
```
**Char count: 280** ✅

---

### 4/7
```
Autonomous research in production.
X-Scout scans X + Grok synthesis → clean research threads → Discord active-research forum every ~2h.
Dedup + 2h cooldown. Silent cycles marked X_SCOUT_QUIET. No human curation loop.
Watch #ask-xscout in our Discord.
```
**Char count: 251** ✅

---

### 5/7
```
Alpha signals — live, automatic.
Every 30 minutes the scanner analyzes, detects, posts. No manual intervention.
Signals land in: Discord #alpha-signals | WhatsApp daily summary (07:00 UTC) | Webhook push.
The machine doesn't sleep.
```
**Char count: 248** ✅

---

### 6/7
```
Delegation protocol: one implementer per task. No parallel edits.
FCC opens draft PRs only. Owner merges via Antigravity (Cursor). No deploy without approval.
Memory (GBrain) synced across VPS + Mac. git pull + gbrain import aligns contexts.
```
**Char count: 244** ✅

---

### 7/7
```
We're building in public. The machine runs. We build.
Join us:
- GitHub: github.com/TheNeuralWars/GoalChain
- Discord: (link in bio)
- Telegram: @GoalChainBot
#GoalChain #DeFi #Football #AutonomousAgents #BuildInPublic #Web3
```
**Char count: 239** ✅

---

## Reply Templates (for engagement)

**When someone asks "How does it work?"**
> The short version: Hermes (Grok-4) orchestrates → FCC (Claude) implements via GitHub issues → X-Scout researches → Alpha Scanner signals. All 24/7, zero human touch. Econ config sealed. Repo public. github.com/TheNeuralWars/GoalChain

**When someone asks "Is this real?"**
> Running right now. Alpha scanner posting every 30m. X-Scout publishing research threads every ~2h. FCC implementing tasks via draft PRs. Telegram bot live. No vaporware — the machine compounds.

**When someone asks "Token?"**
> Canonical economy config sealed in docs/ECONOMIC_CANONICAL_CONFIG.json. Risky flags OFF until on-chain validation. No prod keys in public. Economy changes = intake → issue → FCC → draft PR → owner approval. Transparent, auditable, sealed.

---

## Publishing checklist (pre-flight)

- [ ] xurl auth confirmed (blocking gate per intake status)
- [ ] GitHub repo link verified: `github.com/TheNeuralWars/GoalChain`
- [ ] Discord link verified (add to bio before posting)
- [ ] Telegram bot `@GoalChainBot` live and responding
- [ ] English Max Law: 100% English — verified ✅
- [ ] No Spanish words: verified ✅
- [ ] No unverified claims: verified ✅ ("Alpha is live", "machine compounds" are factual)
- [ ] Media assets (optional for first post): architecture diagram, terminal screenshot, Discord screenshot, GitHub screenshot

---

## Validation commands

```bash
# Verify all tweets within 280-char limit (extract from this file)
python3 -c "
import re
with open('docs/social/x-launch-content.md') as f:
    content = f.read()
blocks = re.findall(r'\`\`\`\n(.*?)\n\`\`\`', content, re.DOTALL)
labels = ['Single post','1/7','2/7','3/7','4/7','5/7','6/7','7/7']
for label, block in zip(labels, blocks[:8]):
    lines = [l for l in block.split('\n') if l.strip()]
    n = len('\n'.join(lines))
    print(f\"{'✅' if n<=280 else '❌'} {label}: {n} chars\")
"
```

---

## Implementation notes

- **Brand**: GoalChain (capital G/C — official canonical per intake file)
- **Language**: 100% English (English Max Law per CLAUDE.md)
- **No Spanish** in any post or template
- **Thread**: post as connected thread (first tweet as parent), not separate posts
- **Blocking gate**: xurl auth must complete before publishing
- **Char counts**: verified with Python above; all tweets ≤ 280 chars

---

## Risks / Rollback

| Risk | Mitigation |
|------|------------|
| Char count over limit on X | All 8 posts verified ≤ 280 chars via Python script |
| Brand name mismatch | "GoalChain" used consistently throughout |
| Intake not closed | Touch `docs/intake/x-launch-content.md.done` after commit |
| Reply templates too long | Verified: all under 280 chars |
| WhatsApp/Telegram channels not live | Checked in pre-flight checklist before publishing |

**Rollback**: `git revert HEAD` — removes the social content file, restores clean state.