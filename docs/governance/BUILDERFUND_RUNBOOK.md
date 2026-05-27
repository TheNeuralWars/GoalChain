# BuilderFund — Contributor Epoch Validation Runbook

**Issue:** [#155](https://github.com/TheNeuralWars/GoalChain/issues/155)  
**Backlog ID:** 47  
**Priority:** P2  
**Epic:** post-mundial  
**Status:** active  
**Generated:** 2026-05-27

---

## Objective

Define how the BuilderFund validates contributor eligibility and calculates epoch rewards — the procedure an operator runs at the end of each contributor epoch to confirm who gets allocated, how much, and with what on-chain proof.

---

## BuilderFund Overview

The BuilderFund allocates a portion of protocol revenue to active contributors each epoch. Epochs are defined by:

| Parameter | Value |
|-----------|-------|
| Duration | 4 weeks |
| Source | Protocol fee split (`fee_jackpot_bps` portion) |
| Distribution | Equal per eligible contributor OR weighted by activity score |
| On-chain account | `builder_fund` PDA (future — see `GENESIS_AGENTS_BRIEF.md`) |

---

## Eligibility Criteria

A contributor is eligible for an epoch allocation if they meet **all** of:

1. **Minimum activity:** ≥ 1 merged PR or ≥ 3 closed issues in the epoch window
2. **No slashing events:** No confirmed malicious oracle reports or governance violations
3. **Active wallet:** Solana wallet that received at least 1 devnet transaction in the epoch
4. **Verified registration:** GitHub username linked to Solana public key in `contributors.json`

---

## Validation Procedure

### Step 1 — Determine epoch window

```bash
# Example: epoch 1
EPOCH_START="2026-06-01T00:00:00Z"
EPOCH_END="2026-06-28T23:59:59Z"
```

### Step 2 — Pull merged PRs and closed issues

```bash
# PRs merged in epoch
gh pr list --state merged \
  --search "merged:${EPOCH_START}..${EPOCH_END}" \
  --json number,author,mergedAt,title \
  > /tmp/epoch-prs.json

# Issues closed in epoch
gh issue list --state closed \
  --search "closed:${EPOCH_START}..${EPOCH_END}" \
  --json number,assignees,closedAt,title \
  > /tmp/epoch-issues.json
```

### Step 3 — Compute contributor activity scores

```bash
python3 - <<'PY'
import json

prs = json.load(open("/tmp/epoch-prs.json"))
issues = json.load(open("/tmp/epoch-issues.json"))

scores = {}
for pr in prs:
    author = pr["author"]["login"]
    scores[author] = scores.get(author, 0) + 2  # PRs worth 2 pts

for issue in issues:
    for assignee in issue.get("assignees", []):
        login = assignee["login"]
        scores[login] = scores.get(login, 0) + 1  # issues worth 1 pt

# Filter: minimum 2 points (1 PR or 3 issues equiv)
eligible = {k: v for k, v in scores.items() if v >= 2}
print("Eligible contributors:")
for k, v in sorted(eligible.items(), key=lambda x: -x[1]):
    print(f"  {k}: {v} pts")
PY
```

### Step 4 — Cross-reference with contributors.json

```bash
# contributors.json format:
# { "github_login": "solana_pubkey", ... }
cat docs/governance/contributors.json 2>/dev/null || echo "FILE NOT FOUND — create it"
```

### Step 5 — Generate epoch report

```bash
# Output: docs/governance/builderfund/epoch-N-report.md
EPOCH_NUM=1
mkdir -p docs/governance/builderfund
cat > docs/governance/builderfund/epoch-${EPOCH_NUM}-report.md <<EOF
# BuilderFund Epoch ${EPOCH_NUM} — Validation Report
Date: $(date -u '+%Y-%m-%d')
Window: ${EPOCH_START} → ${EPOCH_END}

## Eligible Contributors
<!-- Paste output from Step 3 here -->

## Allocation
<!-- Total pool: X GOAL tokens (from protocol revenue) -->
<!-- Per-contributor: TBD based on score weighting -->

## On-chain execution
<!-- Approved by Nico: [ ] -->
<!-- TX signature: ... -->
EOF
```

### Step 6 — On-chain allocation (future — when BuilderFund PDA is live)

When `builder_fund` PDA is implemented (see `GENESIS_AGENTS_BRIEF.md`):

```bash
# Placeholder — not executable until Genesis Agents protocol is implemented
# goalchain-sdk distribute-builder-fund --epoch $EPOCH_NUM --config epoch-report.json
echo "ON-CHAIN DISTRIBUTION NOT YET IMPLEMENTED — requires Genesis Agents (#143)"
```

---

## Files

| File | Purpose |
|------|---------|
| `docs/governance/contributors.json` | GitHub → Solana pubkey registry (create manually) |
| `docs/governance/builderfund/epoch-N-report.md` | Per-epoch validation output |
| `ECONOMIC_CANONICAL_CONFIG.json` | Source of `fee_jackpot_bps` (do not edit) |

---

## Acceptance Criteria

- [x] This runbook present and reviewed
- [ ] `docs/governance/contributors.json` created with at least team members
- [ ] Epoch 1 report generated after 2026-06-28
- [ ] On-chain distribution path unblocked after Genesis Agents (#143) is implemented

---

## Dependencies

- Issue #143 — Genesis Agents (BuilderFund PDA)
- Issue #145 — Mainnet gate (distribution requires mainnet)
