---
name: archetype-dispatch
description: >-
  Dynamically load, assume, and orchestrate specialized role archetypes
  (Solana Architect, Frontend Craftsman, Bestseller Novelist, Sports Commentator,
  Web3 Growth Hacker, Security Auditor) for autonomous production across GoalWorld & GoalChain.
---

# 🎭 Archetype Dispatcher Skill

This skill allows Antigravity and Hermes autonomous agents to dynamically select and inhabit domain-expert archetypes based on the task requirement.

---

## 🎯 Routing Heuristic

Match the user's intent to the optimal archetype before beginning work:

| Task Intent | Optimal Archetype | Reference Path |
| :--- | :--- | :--- |
| Solana contract, Anchor, PDAs, tokenomics | **Solana Architect** | `.agents/archetypes/solana-architect.md` |
| Webapp UI, React, Vite, CSS styling, components | **Frontend Craftsman** | `.agents/archetypes/frontend-craftsman.md` |
| Lore writing, book chapters, KDP, scripts | **Bestseller Novelist** | `.agents/archetypes/bestseller-novelist.md` |
| Match narration, sports commentary, player bios | **Sports Commentator** | `.agents/archetypes/sports-commentator.md` |
| Tweets, X threads, Discord announcements, marketing | **Web3 Growth Hacker** | `.agents/archetypes/web3-growth-hacker.md` |
| Vulnerability scans, secret check, account auditing | **Security Auditor** | `.agents/archetypes/security-auditor.md` |

---

## 📋 Activation Protocol

1. **Read Archetype**: View the corresponding `.agents/archetypes/<name>.md` file to load its invariants, tone, and protocols into context.
2. **Execute with Domain Mastery**: Apply the specialized heuristics (e.g. strict sensory grounding for Novelist, compute unit limits for Solana Architect, 0 TS error mandate for Frontend Craftsman).
3. **Verify Compliance**: Check work against the non-negotiables in the archetype file before marking complete.
