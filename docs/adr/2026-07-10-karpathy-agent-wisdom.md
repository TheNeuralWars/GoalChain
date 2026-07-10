# ADR: GoalWorld Agent Architecture — Karpathy Survival Wisdom Alignment

**Date:** 2026-07-10
**Status:** Accepted
**Issue:** #866 (intake), #288 (source)
**Decision makers:** Nico (owner), Hermes CEO (FCC)
**Source:** Voice task via Telegram Bot (Gemini transcription)

## Context

Nico requested analysis of a tweet by @0xMortyx sharing Andrej Karpathy's insights on which AI agent frameworks/tools will survive vs. which will die. This ADR documents:

1. The extracted wisdom from the tweet
2. GoalWorld's current architecture alignment
3. Validation that we're on the right path
4. Potential future improvements

## Tweet Source

**URL:** https://x.com/0xMortyx/status/2061491256107159736
**Author:** @0xMortyx (sharing Karpathy's wisdom)
**Date:** May 31, 2026
**Reach:** 381K views

### Full Transcription

> Andrej Karpathy: "90% of what AI Twitter tells you to learn will be dead in 6 months"
>
> 90% of what AI Twitter tells you to learn dies in 6 months. Senior engineers already stopped chasing it.
>
> **THE DEAD LIST:**
> - autogen, crewai, autonomous agent pitches
> - agent marketplaces, benchmark leaderboards
> - semantic kernel, dspy as a general framework
> - horizontal "build any agent" platforms
> - per-seat pricing for agents
>
> The pattern is obvious. Demos that break in production. Hype that never ships. Frameworks that go viral on Monday and vanish by spring.
>
> **WHAT ACTUALLY COMPOUNDS:**
> - context engineering
> - tool design
> - orchestrator-subagent pattern
> - eval discipline
> - the harness mindset. Harness > model, always
> - MCP as the protocol layer
>
> The edge isn't the newest framework. It's staying a few steps ahead until your signal becomes everyone's mass-opinion.
>
> Book and study this.

## Decision

### VALIDATION: GoalWorld Architecture is Correct

Our current architecture aligns perfectly with Karpathy's survival list:

| Principle | Karpathy | GoalWorld Implementation | Status |
|-----------|----------|-------------------------|--------|
| Orchestrator-subagent | ✅ Survivor | Hermes CEO → 24 Greek workers (alpha-omega) | ✅ ALIGNED |
| Context engineering | ✅ Survivor | GBrain memory + MCP gbrain server | ✅ ALIGNED |
| Tool design | ✅ Survivor | Hermes tools: send_message, delegate_task, mcp_* | ✅ ALIGNED |
| MCP as protocol | ✅ Survivor | MCP servers: goalchain-ops, hermes-comms, gbrain | ✅ ALIGNED |
| Harness > model | ✅ Survivor | SOUL.md configs, META principles, skill system | ✅ ALIGNED |
| Eval discipline | ✅ Survivor | Partial — test suites exist, no formal agent scoring | ⚠️ PARTIAL |

### NOT APPLICABLE (We Avoided the Dead List)

- GoalWorld does NOT use: autogen, crewai, dspy, semantic kernel
- No agent marketplace (direct ops model)
- No per-seat pricing for agents
- No benchmark leaderboard chasing

### ARCHITECTURE EVIDENCE

#### Orchestrator-Subagent Pattern
```
Hermes CEO (profile: hermes-ceo)
├── send_message → delegates to specialist agents
├── delegate_task → spawns parallel workers
└── mcp_hermes_comms → inter-agent communication
```

#### Context Engineering
- GBrain institutional memory (`mcp_servers.gbrain`)
- Session memory across profiles
- `universal_truth.json` as canonical state

#### MCP Protocol Layer
- `goalchain-ops`: economy health, on-chain program info
- `hermes-comms`: inbox/message routing
- `goalworld-ops`: generation progress, economy config
- `codebase-memory-mcp`: code graph intelligence

#### Harness System
- SOUL.md per profile (identity + responsibilities)
- Skills system (procedural memory)
- META principles (engineering constraints)
- Non-negotiables enforcement

## Potential Improvements

### 1. Eval Discipline Enhancement
**Current:** Test suites exist (`npm test`, `anchor test`)
**Gap:** No formal agent performance metrics
**Recommendation:** Consider adding agent scoring to kanban.db:
- Task completion rate
- Error rate per agent
- Average implementation quality (via review pass)

### 2. Harness Reinforcement
**Current:** SOUL.md + skills provide strong harness
**Gap:** No formal scoring rubric
**Recommendation:** Document agent quality rubric in `ai_context/`

## Consequences

1. **No architectural changes required** — GoalWorld is already aligned
2. **Documentation value** — This ADR serves as rationale for current choices
3. **Future guidance** — New agent/framework decisions should be evaluated against Karpathy's survival list
4. **Confidence boost** — Validates that the Hermes-based orchestration approach is correct

## References

- Source tweet: https://x.com/0xMortyx/status/2061491256107159736
- Issue #288: Original voice task source
- Issue #866: This ADR implementation
- SOUL.md (ops/hermes/SOUL.md): Agent identity configs
- ai_context/AGENT_ORCHESTRATION.md: Orchestration contract
- CLAUDE.md: FCC instructions and scope rules