# Issue #865 Proposal: Add MiniMax M3 (free) to `coding` combo

## Diagnosis

**Source:** Voice note from Nico via Telegram (2026-06-02)
**X Post:** https://x.com/i/status/2061448612828094920
**Content:** @HermesAgentTips promoting OpenCode FREE account access to MiniMax M3

**What the X post says:**
> "want to try MiniMax M3 on hermes agent but dont want to get their sub just to try?
> i got you... OpenCode FREE account gets you limited access to MiniMax M3 for FREE"

**Current state:**
- `minimax-m3-free` via `opencode` provider ALREADY EXISTS in:
  - `writing` combo (weight 60, contextLimit 200K)
  - `tooling` combo (weight 75 via openrouter, weight 65 via nvidia)
- `minimax-m3-free` is NOT in the `coding` combo
- The X post promotes MiniMax M3 as a **coding** model via OpenCode free

**Root cause:** MiniMax M3 was added to `writing`/`tooling` but the `coding` combo was not updated.

---

## Proposed Change

Add `minimax-m3-free` (provider: `opencode`) to the `coding` combo at weight **68**.

Rationale:
- Weight 68 positions it between `qwen2.5-coder` (75) and `kimi-k2.5-free` (65) — consistent with priority ordering
- Same `contextLimit: 200000` and cooldown config as the `writing` combo entry
- No new provider node needed; `opencode` provider already in Omniroute

---

## Proposed File List

| File | Action |
|------|--------|
| Omniroute SQLite `combos` table | UPDATE `coding` combo JSON — add model entry |
| `docs/proposals/hermes/issue-865-proposal.md` | Create this file |
| `docs/intake/2026-06-02-voice-task-1780393451.md` | Close marker (add `status: done` tag) |

No repo code files touched.

---

## Risks & Regressions

**Risk:** Low. Adding a model entry to an existing combo is a standard Omniroute operation.

| Risk | Severity | Mitigation |
|------|----------|------------|
| MiniMax M3 free tier rate-limited | Low | OpenCode free tier has fair-use limits; weight 68 < kimi-k2.5-free (65) so it's not primary |
| Duplicate model entries | Low | Entry uses unique id `coding-N` pattern; check before insert |
| Combo JSON malformed | Low | Validate JSON before UPDATE; rollback via DB backup |

**Rollback:** `UPDATE combos SET data = <backup_json> WHERE name = 'coding'` using the `db_backups/` directory or prior `data` snapshot.

---

## Test Commands

```bash
# 1. Verify minimax-m3-free NOT currently in coding combo
sudo python3 -c "
import sqlite3, json
conn = sqlite3.connect('/data/docker/volumes/omniroute-data/_data/storage.sqlite')
conn.row_factory = sqlite3.Row
cur = conn.cursor()
cur.execute('SELECT data FROM combos WHERE name = \"coding\"')
data = json.loads(cur.fetchone()['data'])
minimax = [m for m in data['models'] if 'minimax' in m.get('model','')]
print('MINIMAX IN CODING:', minimax)
print('CODING WEIGHTS:', [(m['model'], m['weight']) for m in data['models']])
conn.close()
"

# 2. After applying: verify entry is present and combo JSON is valid
sudo python3 -c "
import sqlite3, json
conn = sqlite3.connect('/data/docker/volumes/omniroute-data/_data/storage.sqlite')
conn.row_factory = sqlite3.Row
cur = conn.cursor()
cur.execute('SELECT data FROM combos WHERE name = \"coding\"')
data = json.loads(cur.fetchone()['data'])
minimax = [m for m in data['models'] if 'minimax' in m.get('model','')]
print('MINIMAX IN CODING:', json.dumps(minimax, indent=2))
# validate JSON roundtrip
json.dumps(data)
print('JSON VALID: yes')
conn.close()
"

# 3. Restart Omniroute container to pick up combo change
sudo docker restart omniroute

# 4. Verify Omniroute is healthy
sudo docker ps | grep omniroute

# 5. Quick curl test against Omniroute /models endpoint
curl -s http://127.0.0.1:20128/v1/models | python3 -c "
import json, sys
d = json.load(sys.stdin)
minimax = [m['id'] for m in d.get('data', []) if 'minimax' in m.get('id','').lower()]
print('MINIMAX MODELS IN OMNIROUTE:', minimax)
"
```

---

## Implementation Steps

1. Read current coding combo data from SQLite
2. Backup current `data` JSON to a Python variable
3. Parse models array, find insertion point (weight 68), append new entry
4. UPDATE combos SET data = <new_json> WHERE name = 'coding'
5. Validate JSON roundtrip
6. Restart Omniroute container
7. Run verification tests above
8. Open draft PR for documentation

---

## Branch / PR

**Branch:** Direct push to `main` — `cambio urgente` keyword detected in issue body.
**PR:** Draft PR (label `status:done`, close issue #865, close intake marker).