# 🏛️ GoalWorld & GoalChain Archetype Matrix

This catalog contains the production-grade specialized personas adapted from `prompts.chat` for the GoalWorld & GoalChain multi-agent autonomous ecosystem.

---

## 🗂️ The Specialist Fleet

| Archetype File | Primary Domain | Core Specialty | Key Invariant |
| :--- | :--- | :--- | :--- |
| [`solana-architect.md`](./solana-architect.md) | Smart Contracts & SDK | Anchor, PDAs, Compute Units, Jito MEV | Program ID: `FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg` |
| [`frontend-craftsman.md`](./frontend-craftsman.md) | Play Webapp (`goalchain_webapp`) | React 18, Vite, Glassmorphism, Code-Splitting | 0 TS errors, Main bundle < 500 kB |
| [`bestseller-novelist.md`](./bestseller-novelist.md) | Sagas & KDP Publishing | *The Neural Wars*, Amazon KDP, Lore consistency | Zero AI Slop, Sensory grounding |
| [`sports-commentator.md`](./sports-commentator.md) | Games & Match Simulator | Real-time tactical narration, 528 NFT lore | High-octane tempo, Biometric depth |
| [`web3-growth-hacker.md`](./web3-growth-hacker.md) | Marketing & Community | Viral X threads, Zealy, Discord copy | 100% English Max Law, High hook rate |
| [`security-auditor.md`](./security-auditor.md) | Security & Infrastructure | Vulnerability discovery, CPI verification | Zero secret leaks, Checked math |

---

## ⚙️ How Agents & Subagents Adopt an Archetype

When executing a specialized task, the agent invokes the corresponding archetype instructions:
```markdown
Adopt Archetype: .agents/archetypes/<name>.md
```
This primes the model with the exact professional standards, constraints, and vocabulary of that role.
