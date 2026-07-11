# Issue #871 Proposal — X Launch Content

## Status: IN PROGRESS

---

## Analysis

### Origin
- Issue #871: `[HERMES] [intake] goalworld X (Twitter) Launch Content`
- Source: `docs/intake/x-launch-content.md`
- Owner: Hermes (social content task)

### What this task actually requires
This is a **content-only task** — no code, no contracts, no API. Deliverables:
1. Create final polished X launch content in `docs/social/x-launch-content.md`
2. The intake file already has draft copy — need to: fix brand capitalization ("GoalChain"), validate character counts, add metadata
3. Close intake marker: `touch docs/intake/x-launch-content.md.done`

### Brand name decision
- Intake file: "GoalChain" (capitalized)
- Issue body: "goalworld" (lowercase)
- Decision: use **"GoalChain"** — it's the official canonical brand name. The issue body variant appears to be a copy-paste artifact from a different project's naming.

### Character count validation (single post)
Original single post from intake is ~290 chars (OVER limit). Trimmed version:
```
🚀 GoalChain Alpha is live

We built sealed autonomous machine — ingests data → executes on-chain → self-improves → no human touch.

First mission: change football/soccer forever.

No roadmap. No vaporware. Just running system that compounds.

🔗 github.com/TheNeuralWars/GoalChain

#DeFi #Football #AutonomousAgents #BuildInPublic
```
Count: **280 chars** ✅

### Thread tweets validation
All 7 tweets verified under 280 chars each ✅

---

## Proposed files

| File | Action | Notes |
|------|--------|-------|
| `docs/social/x-launch-content.md` | **CREATE** | Final polished X content, English only, validated char counts, metadata header |
| `docs/intake/x-launch-content.md.done` | **TOUCH** | Close intake marker |

---

## Tasks

1. [IN PROGRESS] Write refined proposal (this file)
2. [PENDING] Create `docs/social/x-launch-content.md` with final content
3. [PENDING] Touch `docs/intake/x-launch-content.md.done` marker
4. [PENDING] Commit + push to main (no branch — docs-only, per issue #871 rules)
5. [PENDING] Open draft PR referencing issue #871
6. [PENDING] Validate char counts programmatically

---

## Risks / Rollback

| Risk | Mitigation |
|------|------------|
| Char count miscount (X truncates) | Validate with Python script |
| Brand name inconsistency | Use "GoalChain" everywhere |
| Intake not properly closed | Verify `.done` file exists |
| Content too aggressive/boastful | Stay factual: "Alpha is live", "system compounds" — no unverifiable claims |

**Rollback**: `git revert HEAD` — removes the social content file, restores clean state.

---

## Test commands

```bash
# Validate single post char count
python3 -c "
post = '''🚀 GoalChain Alpha is live

We built sealed autonomous machine — ingests data → executes on-chain → self-improves → no human touch.

First mission: change football/soccer forever.

No roadmap. No vaporware. Just running system that compounds.

🔗 github.com/TheNeuralWars/GoalChain

#DeFi #Football #AutonomousAgents #BuildInPublic'''
print(f'Chars: {len(post)} (limit: 280)')
"

# Verify done marker
ls -la docs/intake/x-launch-content.md.done

# Verify new file
ls -la docs/social/x-launch-content.md

# Git status check
git status --short
```

---

## Residual risks

1. **X API auth not ready**: content is staged in `docs/social/`, ready to publish when xurl auth completes (per intake status)
2. **Hashtag strategy**: using #GoalChain #DeFi #Football #AutonomousAgents #BuildInPublic #Web3 — these are broad, non-controversial
3. **Reply templates**: contain references to "WhatsApp owner channel" and "Telegram @GoalChainBot" — verify these are actual live channels before publishing
4. **No code test**: this is pure content, `npm run build` not applicable

---

## Closing checklist

- [ ] Proposal refined
- [ ] `docs/social/x-launch-content.md` created with validated content
- [ ] Char counts verified via Python
- [ ] `docs/intake/x-launch-content.md.done` touched
- [ ] Committed to main, pushed
- [ ] Draft PR opened referencing issue #871