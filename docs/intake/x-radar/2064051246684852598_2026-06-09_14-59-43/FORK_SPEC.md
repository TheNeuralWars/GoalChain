# Fork Spec: 2064051246684852598

## Their Stack
- Model: MiniMax M3 (cloud) + Ollama local (quantized)
- Orchestration: Hermes Agent (manual config)
- Scheduling: Manual crontab / shell scripts
- Delivery: Telegram bot for mobile approvals
- Pricing: $5,000 setup + $500/mo retainer per client

## Our Upgraded Stack
| Layer | Their Choice | Our Choice | Why |
|-------|--------------|------------|-----|
| LLM | MiniMax M3 (cloud) | Grok (primary) + Ollama qwen2.5:32b/nemotron3:8b (local) | Free tier + zero API cost + data sovereignty |
| Orchestration | Hermes Agent (manual) | Hermes Agent (production config + skills system) | Versioned skills, multi-provider, auto-reload |
| Scheduling | Manual crontab | Hermes cronjobs + systemd timers | GitOps, observable, portable across nodes |
| Mobile | Telegram bot | Telegram + WhatsApp (Twilio) + Discord | Multi-channel approvals, richer UX |
| Monitoring | None | Superpowers MCP (economy_health, ops_status) | Live health + on-chain metrics |
| Updates | SSH manual | GitOps (git pull → systemctl reload) | Zero-downtime, auditable, scalable |
