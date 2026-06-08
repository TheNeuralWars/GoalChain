# Open Source Collaboration Strategy — GoalChain

- **Status:** ready
- **Priority:** P1
- **Owner (implementer):** human (Nico + Manager orchestration)
- **Reviewers:** grok | hermes
- **Created:** 2026-06-07

## Objective

Establecer las bases de colaboración open source de GoalChain para atraer: (1) instituciones crypto/agenticas establecidas con herramientas para jugabilidad/operabilidad avanzada y economías beneficiosas, y (2) desarrolladores individuales que aporten código directamente — todo orquestado por Hermes Manager 24/7.

## Context

GoalChain está en fase pre-Mundial (devnet MVP target 11 jun 2026). El repo ya opera con arquitectura multi-agente (Hermes Manager, FCC, Antigravity, Cursor, Grok) y pipeline intake → issue → PR → merge. Hermes ya gestiona Discord, WhatsApp, cron jobs, GBrain, y despacho automático a FCC via `agent:opencode`.

Inspiración: Hermes Agent (Nous Research) — actualizaciones constantes, comunidad que aporta, transparencia total.

Visión alta: "Tocar las fibras más profundas de la avaricia humana (apuestas) para hacer un cambio en el mundo hacia la paz y la armonía."

## Allowed files

- `docs/intake/2026-06-07-open-source-collaboration-strategy.md` (this file)
- `docs/GOVERNANCE.md` (to create)
- `CONTRIBUTING.md` (to create)
- `COLLABORATORS.md` (to create)
- `.github/ISSUE_TEMPLATE/` (to create)
- `.github/PULL_REQUEST_TEMPLATE.md` (to create)
- `docs/governance/` (existing governance docs)
- `ai_context/AGENT_ORCHESTRATION.md` (reference)
- `README.md` (updates)

## Out of scope

- Cambios al core on-chain/economía (those are P0 separate briefs)
- Implementación técnica de features de colaboración (separate tasks)
- Fundraising / token sales / legal entity setup

## Acceptance criteria

- [ ] `CONTRIBUTING.md` publicado con guías claras para desarrolladores individuales
- [ ] `COLLABORATORS.md` con framework para socios institucionales (criteria, benefits, onboarding)
- [ ] `docs/GOVERNANCE.md` documentando modelo de gobernanza multi-stakeholder
- [ ] GitHub issue/PR templates listos para contribuciones externas
- [ ] README actualizado con sección "Join Us / Colabora" visible
- [ ] Pipeline Hermes → FCC documentado para contribuciones externas (issue labeling, review flow)
- [ ] Lista inicial de 5-10 instituciones crypto/agenticas objetivo con contactos/approach
- [ ] Brief de "Developer Experience" para onboarding suave (dev env, first good issues)

## Test commands

```bash
# Verify files exist
ls -la /data/apps/GoalChain/CONTRIBUTING.md /data/apps/GoalChain/COLLABORATORS.md /data/apps/GoalChain/docs/GOVERNANCE.md

# Check GitHub templates
ls -la /data/apps/GoalChain/.github/ISSUE_TEMPLATE/ /data/apps/GoalChain/.github/PULL_REQUEST_TEMPLATE.md

# Validate links in README
grep -i "colabora\|join\|contribu" /data/apps/GoalChain/README.md
```

## Risks and rollback

- Risk: Scope creep en documentación antes de merge stack #32-#34
- Rollback: Mantener briefs en draft, no publicar hasta main actualizado
- Risk: Atraer contribuyentes antes de DX pulido (frustración)
- Rollback: Etiquetar issues "good first issue" solo cuando dev env documentado y CI verde

## Notes for other agents

- Grok: Investigación de instituciones crypto/agenticas alineadas (DeFi, gaming, AI agents, oracles). Output: tabla con nombre, fit, contacto, propuesta valor.
- Antigravity: Revisión técnica de CONTRIBUTING.md (dev env, build, test commands) y CI/CD readiness para PRs externos.
- Hermes: Orquestación continua — mantener intake actualizado, disparar tasks FCC para templates, recordatorios semanales a Nico.
- FCC: Implementación de templates GitHub, CI checks para PRs externos, automatización labeling.

---

## Estrategia Detallada (Working Notes)

### 1. Dos vías de colaboración

| Vía | Perfil | Valor para GoalChain | Valor para ellos |
|-----|--------|----------------------|------------------|
| **Institucional** | Protocolos DeFi, Gaming Web3, AI Agents, Oracles, Infra | Herramientas avanzadas, liquidez, distribución, credibilidad | Caso de uso real, comunidad futbolera, economics GCH, co-branding |
| **Individual** | Devs Rust/Anchor, React/Next, TS, Solana, AI/ML | Código, features, bug fixes, diversidad, community | Portfolio, learning, GCH rewards, governance voice |

### 2. Institutional Target Categories (investigación Grok)

- **Liquid Staking / Yield**: Jito, Marinade, SolBlaze, Sanctum — vault integration, yield strategies
- **DeFi Primitives**: Drift, Kamino, MarginFi, Save — lending, perps, structured products para GCH
- **Gaming / Metaverse**: Star Atlas, Aurory, Faraway — cross-game NFT utility, interoperability
- **AI Agent Frameworks**: Nous (Hermes), ElizaOS, Autonolas, Morpheus — agent-to-agent economy, autonomous managers
- **Oracles / Data**: Pyth, Switchboard, Helius — fixture data, on-chain randomness, yield verification
- **Infra / Tooling**: Helius, Triton, QuickNode, Solana Foundation — RPC, indexing, dev tools grants

### 3. Governance Model (borrador)

- **Core Team** (Nico, Lucas, Antigravity): Merge authority, economic parameters, security
- **Institutional Partners**: Advisory council (quarterly), early access, co-marketing
- **Contributors**: Merit-based — sustained PRs → maintainer rights per subsystem
- **Community**: Discord/forum voice, snapshot voting para parámetros no-críticos (post-mainnet)

### 4. Developer Experience Priorities

1. `devcontainer` / `nix` dev env one-click
2. `make test` / `make build` / `make lint` scripts
3. `docs/DEV_ENV_SETUP.md` actualizado y probado
4. Good first issues etiquetados con `good first issue` + `help wanted`
5. PR template con checklist: tests, docs, economy impact, security
6. Automated preview deployments para webapp PRs (Vercel)

### 5. Hermes Orchestration Loop

- **Semanal**: Recordatorio a Nico para outreach institucional
- **Por issue externa**: Auto-label `external-contribution`, assign reviewer, ping Discord `#dev-room`
- **Mensual**: Reporte de contribuciones (PRs merged, contributors nuevos, institutional touches)
- **Continuo**: FCC procesa issues `agent:opencode` + `status:ready` con skill hints apropiados

### 6. Economic Incentives for Contributors

- GCH allocation pool post-mainnet (vested)
- NFT Genesis Squad whitelist / discount
- Vault yield sharing para maintainers activos
- Builder fund grants (from treasury) para features aprobadas
- Reputation on-chain (SBT / attestations)

### 7. Immediate Next Steps (this week)

1. Nico: Aprobar merge stack #32-#34 (blocker para todo)
2. Manager: Crear CONTRIBUTING.md + COLLABORATORS.md drafts → **Issue #465 dispatched to FCC**
3. Grok: Research 10 instituciones target → tabla en intake → **Issue #468 dispatched to Grok**
4. Antigravity: Validar dev env + CI readiness → **Issue #467 dispatched to Antigravity**
5. FCC: Implement GitHub templates + auto-labeling → **Issue #464 dispatched to FCC**
6. Manager: Actualizar README con sección "Colabora" → **Issue #466 dispatched to FCC**

### 8. Dispatched Tasks (tracking)

| Issue | Owner | Priority | Title | Status |
|-------|-------|----------|-------|--------|
| [#464](https://github.com/TheNeuralWars/GoalChain/issues/464) | opencode (FCC) | P1 | GitHub issue/PR templates + auto-label external-contribution | Dispatched |
| [#465](https://github.com/TheNeuralWars/GoalChain/issues/465) | opencode (FCC) | P2 | CONTRIBUTING.md + COLLABORATORS.md + GOVERNANCE.md drafts | Dispatched |
| [#466](https://github.com/TheNeuralWars/GoalChain/issues/466) | opencode (FCC) | P2 | README.md "Colabora / Join Us" section | Dispatched |
| [#467](https://github.com/TheNeuralWars/GoalChain/issues/467) | antigravity | P1 | Validate dev env + CI readiness for external PRs | Dispatched |
| [#468](https://github.com/TheNeuralWars/GoalChain/issues/468) | grok | P1 | Research 10 institutional targets for partnerships | Dispatched |

---

*Este brief vive en `docs/intake/`. Actualizaciones de estado van aquí. Cuando pase a `ready`, Hermes dispatchará tasks a FCC/Antigravity según ownership.*