# Fork Spec: sovereign-ai-deployment

## Their Stack (MindMap Digital)
- **Models:** Llama 3.3 70B, Qwen 2.5 72B, DeepSeek V3, Mistral
- **Inference:** vLLM / TGI on A100/H100 GPUs
- **Vector DB:** pgvector (<10M chunks), Qdrant (10-100M), Milvus (>100M)
- **Embeddings:** BGE-M3, nomic-embed-text (local)
- **Orchestration:** LangGraph (agent runtime, human-in-the-loop)
- **RAG:** Hybrid dense + BM25 + re-ranking
- **Identity:** Keycloak / customer IdP (SSO)
- **Storage:** MinIO / S3 / Postgres / customer data stores
- **Monitoring:** Customer SIEM integration (full provenance)
- **Network:** Namespace-level egress blocking (air-gap)
- **Hardware:** 2x A100/H100 + 3-node CPU pool + MinIO
- **Deployment:** Bare metal, VMware, OpenShift, any CNCF K8s
- **Timeline:** 11 days cluster-to-prompt; 6-9 weeks full pilot

## Our Upgraded Stack
| Layer | Their Choice | Our Choice | Why |
|-------|--------------|------------|-----|
| LLM | Llama/Qwen/DeepSeek on vLLM | Same + Grok API fallback for non-sensitive | Multi-provider; free tier for dev |
| Inference | vLLM on customer GPUs | vLLM on customer GPUs + Ollama fallback | Ollama simpler for <70B; same models |
| Vector DB | pgvector/Qdrant/Milvus | Qdrant (default) + pgvector option | Qdrant better scaling; pgvector simpler |
| Embeddings | BGE-M3 / nomic | Local Ollama embeddings (bge-m3, nomic-embed) | Zero API cost; same quality |
| Orchestration | LangGraph | Hermes Agent (skills + cron + webhooks) | Skills versioned; GitOps; multi-channel |
| RAG | Hybrid + re-ranking | Hermes RAG skill + Qdrant + local embeddings | Reusable; testable; portable |
| Identity | Keycloak | Customer IdP + our Telegram/WA/Discord for approvals | Client chooses; we add multi-channel |
| Monitoring | Customer SIEM | Superpowers MCP + customer SIEM webhook | Our health + their compliance |
| Network | K8s namespace egress block | Same + Tailscale for our remote mgmt | Secure remote access without egress |
| Updates | 45-day hypercare embedded | GitOps (FCC → PR → Antigravity) + 30-day hypercare | Zero-downtime; auditable |
| Hardware | Customer procures | We specify; Hetzner GPU / Mac Mini cluster options | Turnkey for SMB; enterprise procures |

## GoalChain Infrastructure Reuse
- **Hermes Agent** — Orchestration layer (skills, cron, webhooks, multi-provider)
- **Ollama** — Local model serving (embeddings, <70B inference)
- **vLLM** — Can run on client GPU nodes; we automate deploy
- **Qdrant/pgvector** — Vector DB; our VPS has capacity for demos
- **Discord/Telegram/WhatsApp** — oa-worker for client approvals, alerts
- **Cron** — Scheduled eval runs, corpus updates, health checks
- **Skills** — Deployment, RAG, eval, monitoring as versioned skills
- **GitOps** — FCC builds deployment skills; Antigravity merges
- **Webhooks** — Event-driven corpus ingestion, eval triggers
- **Superpowers MCP** — Health monitoring on our demo nodes

## Client Deployment Options
| Client Profile | Hardware | Setup Time | Our Fee | Monthly |
|----------------|----------|------------|---------|---------|
| **Regulated SMB** (fintech, health, legal) | 1x Mac Mini M4 Max (96GB) or Hetzner A100 | 2 weeks | $15-25K | $3-5K |
| **Mid-market** (100-500 people) | 2x A100 80GB (Hetzner/cloud) | 4 weeks | $35-60K | $5-8K |
| **Enterprise** (bank, telco, gov) | Customer bare metal (their DC) | 6-9 weeks | $75-150K | $8-15K |

## Pricing Model
| Component | Price | Notes |
|-----------|-------|-------|
| Discovery + Architecture | $5-10K | Week 1-2; refundable if proceed |
| Core Deployment (vLLM + RAG + SSO) | $15-50K | Based on GPU count + data volume |
| Corpus Ingestion + Eval | $5-15K | Per 1M chunks; includes eval harness |
| Compliance Mapping (SAMA/RBI/EU AI Act/DPDP) | $10-25K | Per regulation; reusable templates |
| Hypercare (30-45 days) | Included | Embedded engineer; then retainer |
| Ongoing Retainer | $3-15K/mo | Monitoring, tuning, corpus updates, model upgrades |

## Risk Mitigation
| Risk | Mitigation |
|------|------------|
| GPU availability | Hetzner A100 usually available; Mac Mini cluster alternative |
| Compliance complexity | Template library for SAMA, RBI, EU AI Act, DPDP, HIPAA |
| Client data access | Air-gap deployment; we never see data; eval on synthetic |
| Model performance | Eval harness included; 70B models match GPT-4 on enterprise tasks |
| Long sales cycle | Start with "Sovereign AI Readiness Assessment" ($5K, 1 week) |
| Operational burden | Automate deploy with skills; 30-day hypercare then retainer |

## Partnership Opportunities
- **Hetzner** — GPU hosting partner; referral fees
- **Mac Mini cluster** — Apple enterprise; reference architecture
- **Compliance consultants** — SAMA/RBI/EU AI Act specialists
- **SIEM vendors** — Splunk, Elastic, Datadog integration partners