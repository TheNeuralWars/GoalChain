# Fork Spec: sovereign-ai-deployment

## Their Stack (MindMap Digital)
- Model: Ollama local (llama3.1:70b, qwen2.5:32b) + optional cloud fallback
- Orchestration: Custom Kubernetes + Hermes Agent
- Scheduling: Kubernetes CronJobs + ArgoCD
- Delivery: On-prem hardware (Dell/HPE) + VPN + private registry
- Pricing: $50K-200K project + $2-5K/mo managed services

## Our Upgraded Stack
| Layer | Their Choice | Our Choice | Why |
|-------|--------------|------------|-----|
| LLM | Ollama only | Grok + Ollama + local vLLM | Multi-provider, cheaper inference at scale |
| Orchestration | K8s + custom | Hermes Agent + systemd + GitOps | Simpler, fewer deps, skills system |
| Scheduling | K8s CronJobs | Hermes cronjobs + systemd timers | Lighter, portable to Mac Mini/VPS |
| Delivery | On-prem hardware | Mac Mini M4 / Hetzner dedicated / Client rack | Flexible: ship node or deploy to their DC |
| Monitoring | Prometheus/Grafana | Superpowers MCP + custom dashboards | GoalChain-native, economy/ops health |
| Updates | ArgoCD + manual | GitOps (git pull → systemctl reload) | Zero-downtime, auditable |
| Skills | Custom YAML | `~/.hermes/profiles/hermes-ceo/skills/` | Versioned, testable, shared across nodes |
| Compliance | Custom audit | Automated compliance skills (SOC2, HIPAA, GDPR) | Reusable, auditable, faster |

## Synergy with GoalChain Stack
| GoalChain Component | Reuse | Notes |
|---------------------|-------|-------|
| Hermes Agent | ✅ 100% | Core orchestration |
| Superpowers MCP | ✅ 100% | Health monitoring |
| FCC (opencode) | ✅ 100% | Parallel custom skill dev per client |
| oa-worker | ✅ 80% | Multi-channel alerts (less Discord focus) |
| GoalChain SDK | 🔄 20% | Only for crypto/regulatory clients |
| Webapp | 🔄 30% | Admin dashboard for node fleet |
| On-chain program | ❌ 0% | Not applicable |

## Differentiation vs MindMap Digital
| Their Approach | Our Upgrade |
|----------------|-------------|
| 6-9 week deployments | 2-3 weeks (skills system + installer + templates) |
| Custom K8s per client | Standardized Hermes node + client skill pack |
| High engineering touch | FCC parallel agents + template skills = lower marginal cost |
| Single LLM (Ollama) | Multi-provider (Grok + Ollama + vLLM) |
| Manual compliance | Automated compliance skill packs |