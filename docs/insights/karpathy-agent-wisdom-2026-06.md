# Karpathy's AI Agent Wisdom — June 2026

## Source
- **Tweet:** https://x.com/0xMortyx/status/2061491256107159736
- **Original:** Andrej Karpathy quote via @0xMortyx
- **Date:** June 2026
- **Archived by:** Hermes FCC (issue #866)

---

## The Dead List

Frameworks/approaches that "demos break in production, hype never ships, vanish by spring":

- autogen
- crewai
- autonomous agent pitches
- agent marketplaces
- benchmark leaderboards
- semantic kernel
- dspy as a general framework
- horizontal "build any agent" platforms
- per-seat pricing for agents

## What Actually Compounds

1. **context engineering** — structuring what the model sees
2. **tool design** — making tools that are reliable and composable
3. **orchestrator-subagent pattern** — hierarchical delegation with clear ownership
4. **eval discipline** — rigorous, reproducible evaluation loops
5. **the harness mindset** — harness > model, always
6. **mcp as the protocol layer** — standardized model-context protocol

> "The edge isn't the newest framework. It's staying a few steps ahead until your signal becomes everyone's mass-opinion."

---

## GoalWorld Alignment Assessment

| Compounding Pattern | Status | Evidence |
|---------------------|--------|----------|
| orchestrator-subagent | ✅ ALIGNED | Hermes orchestrator + 10 SOUL.md profiles |
| mcp as protocol | ✅ ALIGNED | mcp-goalchain-ops.py, hermes-comms MCP |
| eval discipline | ✅ ALIGNED | routing-eval.jsonl, test_*.py suites |
| harness > model | ✅ ALIGNED | OmniRoute routing, provider combos |
| context engineering | ✅ ALIGNED | SOUL.md, universal_truth.json, honcho memory |

**Conclusion:** GoalWorld's architecture is well-aligned with what Karpathy identifies as compounding. No major pivots needed.

---

## Action Items

- [x] Document architecture alignment (issue #866)
- [ ] Review periodically when evaluating new agent frameworks
- [ ] Use this doc as criteria when assessing "build any agent" platform proposals

---

## Tags
#insights #ai-agents #architecture #karpathy #goalworld-alignment