# GoalChain Governance

## Decision Making

### Core Team (Final Authority)
- **Nico Pez** — Product Architect, Founder
- **Lucas Bello** — Art Director, Co-Founder

### Maintainers (Merge Rights)
- Nico Pez
- Lucas Bello
- Designated core contributors (by invitation)

### Contributors
- Anyone with merged PRs
- Invited to participate in discussions
- Can propose features via Issues/Discussions

## Proposal Process

### 1. Small Changes (Bug fixes, docs, minor features)
- Open PR directly
- 1 approval from CODEOWNERS
- Merge when CI passes

### 2. Medium Changes (New components, API changes, UI overhauls)
- Open **Discussion** first (RFC style)
- 3-day feedback period
- Then PR with reference to discussion
- 2 approvals (including 1 core team)

### 3. Large Changes (Architecture, tokenomics, new protocols, governance)
- **Formal Proposal** (GitHub Discussion with `governance` label)
- Template: Problem, Solution, Alternatives, Risks, Testing, Timeline
- 7-day discussion period
- Core team decision (consensus or Nico final call)
- Implementation via tracked issues/PRs

## Roadmap & Priorities

- **Quarterly planning** (public roadmap in `/docs/roadmap.md`)
- **Sprint cycles**: 2-week iterations
- **Priority labels**: `P0-critical`, `P1-high`, `P2-medium`, `P3-nice`
- Community can upvote issues (👍 reactions) to signal interest

## Token Governance (Future)

Once $GCH launches and DAO is live:
- **Parameter changes**: Fee caps, emission rates, sink ratios → on-chain vote
- **Treasury spending**: Builder fund, marketing, grants → DAO proposal
- **Protocol upgrades**: Program authority → multisig + timelock
- **Emergency actions**: Multisig (3/5 core + community reps)

Until then: **Core team decides**, community advises.

## Communication Channels

| Channel | Purpose | Access |
|---------|---------|--------|
| GitHub Issues | Bugs, features, tasks | Public |
| GitHub Discussions | RFCs, governance, Q&A | Public |
| Discord (#dev-room) | Daily dev chat, quick sync | Contributors |
| Discord (#dao-governance) | Governance proposals | $GCH holders (future) |
| Telegram (core) | Urgent/private coord | Core team only |

## Conflict Resolution

1. **Technical disagreements**: Data-driven (benchmarks, prototypes, user testing)
2. **Design/UX**: Lucas has final say on visual/brand
3. **Product/Strategy**: Nico has final say
4. **Deadlock**: 24h cooling off → Nico decides

## Amendments

This governance doc can be amended by:
- Core team consensus
- Or formal DAO vote (post-launch)

Changes documented in `GOVERNANCE_CHANGELOG.md`.

---

*GoalChain — Building the future of football on Solana. Governance evolves with the protocol.*