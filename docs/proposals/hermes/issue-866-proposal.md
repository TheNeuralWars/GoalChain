# OA Proposal — Issue #866

## Title
[HERMES] [intake] Voice Task: xq https://x.com/0xMortyx/status/206149125610715

## Source
GitHub issue #866

## Transcription
> xq https://x.com/0xMortyx/status/2061491256107159736?s=20

## Tweet Analysis (extracted 2026-07-10)
@0xMortyx shares Andrej Karpathy wisdom on AI agent frameworks:

**Dead list (hype that never ships):**
- autogen, crewai, autonomous agent pitches
- agent marketplaces, benchmark leaderboards
- semantic kernel, dspy as general framework
- horizontal "build any agent" platforms
- per-seat pricing for agents

**What actually compounds:**
- context engineering
- tool design
- orchestrator-subagent pattern
- eval discipline
- harness mindset (harness > model, always)
- mcp as the protocol layer

---

## OA Plan

### Phase 1: Architecture Alignment Analysis
Verify GoalWorld aligns with "what actually compounds":

1. **orchestrator-subagent pattern** ✅
   - GoalWorld uses Hermes as orchestrator
   - 10 SOUL.md profiles (CEO, dev, qa, money, trader, product, creative, research, social)
   - clear delegation protocol via send_message MCP

2. **mcp as protocol layer** ✅
   - mcp-goalchain-ops.py exists
   - hermes-comms MCP for inter-agent messaging
   - goalworld-ops MCP for player generation

3. **harness > model** ✅
   - eval discipline via routing-eval.jsonl files in skills/
   - test_api.py, test_llm.py in goalchain-multiagent

4. **context engineering** ✅
   - SOUL.md as persistent agent identity/context
   - universal_truth.json for shared state

### Phase 2: Documentation Update
- Create `docs/insights/karpathy-agent-wisdom-2026-06.md`
- Document GoalWorld alignment with compounding patterns
- Archive as reference for future architecture decisions

### Phase 3: Verify Build Sanity
```bash
cd goalchain_webapp && npm run build
```

---

## Proposed File Changes

| File | Action |
|------|--------|
| `docs/insights/karpathy-agent-wisdom-2026-06.md` | CREATE |

---

## Risks / Regressions
- Risk: N/A (documentation only)
- Rollback: `git revert` the insight doc commit

---

## Test Commands
```bash
# Webapp build sanity
cd goalchain_webapp && npm run build
```

---

## Conclusion
GoalWorld architecture ALIGNS with Karpathy's "what compounds" list:
- Uses orchestrator-subagent pattern (Hermes + SOUL.md profiles)
- Uses MCP as protocol layer
- Has eval discipline (routing-eval, tests)
- Focuses on context engineering (SOUL.md, universal_truth.json)

No code changes required. Documenting insight for team awareness.
