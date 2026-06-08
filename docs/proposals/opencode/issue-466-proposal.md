# OA Proposal — Issue #466

## Title
[OPENCODE] [DRAFT] Open Source: README.md "Colabora / Join Us" section

## Source
GitHub issue #466

## Objective
## Objective
## Objective
Add a prominent "Colabora / Join Us" section to README.md to attract both institutional partners and individual developers.

## Files to modify
- README.md (root) - Add section before footer

## Content to add
### Colabora con GoalChain 🤝

**Dos vías, un objetivo:** hacer GoalChain imparable.

#### 🏢 Para Instituciones / Protocolos
Eres un proyecto DeFi, Gaming Web3, AI Agents, Oracle o Infra. Traes herramienta, liquidez, distribución o credibilidad.  
Nosotros: caso de uso real (apuestas futboleras + GCH economics), comunidad global, co-branding.  
→ [Lee COLLABORATORS.md](COLLABORATORS.md) | Contacto: partnerships@goalchain.fun / Discord #dev-room

#### 👩‍💻 Para Desarrolladores Individuales
Escribes Rust/Anchor, React/Next, TypeScript, Solana, AI/ML.  
Quieres portfolio, learning, GCH rewards, governance voice.  
→ [Lee CONTRIBUTING.md](CONTRIBUTING.md) | Good first issues: [GitHub label](https://github.com/TheNeuralWars/GoalChain/labels/good%20first%20issue)

#### 🔄 Cómo funciona
1. Abres issue / PR -> 2. Manager (Hermes) triage + label -> 3. FCC implementa -> 4. Antigravity review -> 5. Nico merge
24/7 orchestrated by Hermes Agent. Transparencia radical.

## Constraints
- Spanish primary, English inline for key terms
- Links must work (relative paths)
- Visual hierarchy: badges, icons, clear CTAs

## Verification
grep -A 20 "Colabora\|Join Us" README.md
# Check links resolve


## Owner
opencode

## Priority

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-466` and close draft PR.
