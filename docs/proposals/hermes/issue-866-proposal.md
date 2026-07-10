# OA Proposal — Issue #866

## Title
[HERMES] [intake] Voice Task: xq https://x.com/0xMortyx/status/206149125610715

## Source
GitHub issue #866

## Task Summary
Voice task from Nico ("xq" = examinar/query) asking to analyze a tweet by @0xMortyx sharing Andrej Karpathy's wisdom on AI agent framework survival.

## Tweet Content (Extracted)
Andrej Karpathy: "90% of what AI twitter tells you to learn will be dead in 6 months"

**THE DEAD LIST:**
- autogen, crewai, autonomous agent pitches
- agent marketplaces, benchmark leaderboards
- semantic kernel, dspy as general framework
- horizontal "build any agent" platforms
- per-seat pricing for agents

**THE SURVIVORS (what compounds):**
- context engineering
- tool design
- orchestrator-subagent pattern
- eval discipline
- the harness mindset (harness > model, always)
- MCP as the protocol layer

Key insight: "The edge isn't the newest framework. It's staying a few steps ahead until your signal becomes everyone's mass-opinion."

## Analysis: GoalWorld Architecture Alignment

### CURRENT STATE (Already Aligned with Survivors)

| Karpathy Principle | GoalWorld Implementation | Status |
|-------------------|-------------------------|--------|
| Orchestrator-subagent pattern | Hermes CEO → 24 Greek workers (alpha-omega) | ✅ ALIGNED |
| Context engineering | GBrain memory system + MCP gbrain server | ✅ ALIGNED |
| Tool design | Hermes tools: send_message, delegate_task, mcp_* | ✅ ALIGNED |
| MCP as protocol layer | MCP servers: goalchain-ops, hermes-comms, gbrain | ✅ ALIGNED |
| Harness > model | SOUL.md configs, META principles, skill system | ✅ ALIGNED |

### NOT APPLICABLE (Dead List)
- GoalWorld does NOT use: autogen, crewai, dspy, semantic kernel
- No agent marketplace or per-seat pricing model
- No benchmark leaderboard chasing

### POTENTIAL IMPROVEMENTS

1. **Eval discipline** — No formal eval harness exists. Consider:
   - Test suite coverage tracking
   - Agent performance metrics in kanban.db

2. **Harness mindset reinforcement** — Current:
   - SOUL.md provides identity/harness
   - Skills provide procedural memory
   - Could add: formal agent scoring rubric

## Implementation Plan

Since this is an ANALYTICAL task (not code implementation), deliverables are:

1. **ADR** — `docs/adr/2026-07-10-karpathy-agent-wisdom.md`
   - Formal record of alignment analysis
   - No code changes required

2. **Close intake marker** — `docs/intake/2026-06-02-voice-task-1780409734.md`
   - Mark as implemented

## Files to Create/Modify

- CREATE: `docs/adr/2026-07-10-karpathy-agent-wisdom.md`
- MODIFY: `docs/intake/2026-06-02-voice-task-1780409734.md` (add closing marker)

## Risk Assessment
- **Risk:** None. This is documentation-only, no code changes.
- **Rollback:** Delete the ADR file if needed.

## Verification
No build/test commands needed for this analytical task.

## Workflow
- One implementer (FCC) — this agent
- Branch: N/A (working on main per CLAUDE.md rules)
- No PR needed (documentation only)
- Close intake marker when complete

---
Status: ready-for-implementation
