# Fork Spec: ollama-hermes-agency

## Their Stack
- **Model:** GLM 5.1 Cloud / Minimax M2.7 Cloud / Kimmy K2.5 Cloud (free tiers) + local Ollama models
- **Orchestration:** Hermes Agent (via `ollama launch hermes`)
- **Scheduling:** Manual / skill-based cron
- **Delivery:** Telegram bot interface for clients
- **Pricing:** £500-5,000 setup + £2,000-5,000/mo retainer; £10K done-for-you packages
- **Skills:** 1,000+ community skills (AI Profit Boardroom); custom skill building

## Our Upgraded Stack
| Layer | Their Choice | Our Choice | Why |
|-------|--------------|------------|-----|
| LLM | GLM/Minimax/Kimmy cloud free tiers | Grok (xAI) + Ollama local (qwen2.5:32b, llama3.3:70b) + OpenRouter fallback | Multi-provider, zero lock-in; Grok for coding/research; local for privacy/cost |
| Orchestration | Hermes via Ollama launch | Hermes Agent (native, running on VPS) | Skills, cron, multi-provider, GitOps, observability |
| Scheduling | Manual skill triggers | Hermes cronjobs + systemd timers | GitOps, observable, versioned |
| Mobile/Delivery | Telegram only | Telegram + WhatsApp (Baileys) + Discord (oa-worker) | Multi-channel; clients choose; oa-worker production-hardened |
| Monitoring | None / community | Superpowers MCP (economy/ops health) | Health checks, economy monitoring, on-chain visibility |
| Updates | SSH / manual | GitOps (GitHub → FCC → PR → Antigravity merge) | Zero-downtime, auditable, rollback |
| Skills | Markdown in community | `~/.hermes/profiles/side-projects/skills/` + `docs/intake/x-radar/` | Versioned, testable, portable, repo-tracked |
| Webhook Ingestion | None | oa-worker webhook on :3456 | Event-driven, scalable, Discord/Telegram approvals |
| Research/Intel | Manual | X-Scout (oa-x-scout-run.sh → Discord forum) | Automated intel pipeline, dedup, cooldown |

## GoalChain Infrastructure Reuse
- **Hermes Agent** — Already running on VPS (hermes-ceo profile)
- **Ollama** — Can install on same VPS or ship Mac Mini to client
- **Discord** — oa-worker forums/threads for client coordination
- **WhatsApp** — Baileys for client approvals (Nico's self-chat pattern)
- **Cron** — Hermes cronjobs for scheduled skill runs
- **Skills** — Markdown skills in side-projects profile; portable
- **GitOps** — FCC for implementation; Antigravity for merge
- **Webhooks** — Event-driven triggers from client systems
- **Monitoring** — Superpowers MCP for health/economy

## Client Deployment Options
| Option | Infra Cost | Setup Time | Best For |
|--------|------------|------------|----------|
| VPS (shared) | $0 (our VPS) | 15 min | Low-volume, non-sensitive |
| Client Mac Mini | ~$1,500 one-time | 1 hr | Data sovereignty, air-gap |
| Client VPS | $15-50/mo | 30 min | Production workloads, scale |
| Hetzner dedicated | ~$100/mo | 1 hr | High-volume, compliance |

## Pricing Model Adaptation
| Their Tier | Our Adaptation | Rationale |
|------------|----------------|-----------|
| £500-5,000 setup | $2,000-8,000 setup | Higher value; includes infra + monitoring + multi-channel |
| £2,000-5,000/mo retainer | $3,000-8,000/mo | Includes ops, monitoring, skill updates, priority support |
| £10K done-for-you | $15-25K productised | Full GitOps delivery, documentation, handover |
| Lead gen £10-50/lead | $50-150/qualified lead | Higher quality; our research pipeline (X-Scout) adds value |

## Risk Mitigation
- **Model availability:** Multi-provider (Grok + Ollama + OpenRouter) — no single point of failure
- **Client data:** Local Ollama option for sovereignty; our VPS for non-sensitive
- **Skill maintenance:** Versioned in Git; FCC can update; GitOps deploy
- **Scaling:** Demo node → productised skill template → FCC builds new skills per client