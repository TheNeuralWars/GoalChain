# Fork Spec: ollama-hermes-agency

## Their Stack (AI Money Lab / Julian Goldie)
- Model: Ollama local (qwen2.5:32b, nemotron3:8b, llama3.1:8b)
- Orchestration: Hermes Agent (manual config)
- Scheduling: Manual crontab
- Delivery: Telegram bot + local web UI
- Pricing: $3-5K setup + $500-1000/mo retainer

## Our Upgraded Stack
| Layer | Their Choice | Our Choice | Why |
|-------|--------------|------------|-----|
| LLM | Ollama quantized models | Grok + Ollama (qwen2.5:32b/nemotron3:8b) | Free Grok tier + local fallback, multi-provider |
| Orchestration | Hermes Agent (manual) | Hermes Agent (production config + skills system) | Versioned skills, multi-provider, auto-reload, FCC delegation |
| Scheduling | Manual crontab | Hermes cronjobs + systemd timers | GitOps, observable, portable across nodes |
| Mobile | Telegram bot | Telegram + WhatsApp (Baileys) + Discord | Multi-channel approvals, richer UX, existing oa-worker |
| Monitoring | None | Superpowers MCP (economy_health, ops_status) | Live health + on-chain metrics |
| Updates | SSH manual | GitOps (git pull → systemctl reload) | Zero-downtime, auditable, scalable |
| Skills | Ad-hoc prompts | `~/.hermes/profiles/hermes-ceo/skills/` (versioned) | Testable, portable, team-shareable |
| Deployment | Manual VPS setup | `install-hermes-node.sh` one-liner | Repeatable, <10 min deploy |

## Synergy with GoalChain Stack
| GoalChain Component | Reuse | Notes |
|---------------------|-------|-------|
| Hermes Agent | ✅ 100% | Reference implementation running on VPS |
| Superpowers MCP | ✅ 100% | Economy/ops health checks for client nodes |
| oa-worker (Discord/Telegram/WhatsApp) | ✅ 100% | Multi-channel delivery already production |
| FCC (opencode) | ✅ 100% | Parallel agent delegation for client customizations |
| X-Scout | ✅ 100% | Automated research pipeline for client intelligence |
| GoalChain SDK/API | 🔄 50% | Sports/crypto data plugins adaptable |
| Webapp | 🔄 30% | Dashboard for client monitoring |
| On-chain program | ❌ 0% | Not needed for this model |