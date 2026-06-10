# Fork Spec: ai-automation-agency (Reference Only)

## Their Stack (Arsum / Typical AI Automation Agency)
- **Workflow Platform:** n8n, Make, Zapier, custom Python/Node
- **LLM:** OpenAI GPT-4o, Anthropic Claude, Gemini (API)
- **Vector DB:** Pinecone, Weaviate, pgvector (managed)
- **Orchestration:** Platform-native + custom code
- **Monitoring:** Platform logs + custom dashboards
- **Delivery:** Project-based + monthly retainer
- **Pricing:** $3-100K project + $500-8K/mo retainer

## Our Differentiated Stack (For Reference)
| Layer | Their Choice | Our Choice (Ollama-Hermes) | Our Advantage |
|-------|--------------|----------------------------|---------------|
| Workflow | n8n/Make (SaaS) | Hermes Skills (local, versioned) | Zero platform cost; GitOps; portable |
| LLM | Cloud API ($$) | Local Ollama + Grok free tier | $0 marginal cost; data sovereignty |
| Vector DB | Managed ($$) | Qdrant/pgvector local | $0 cost; air-gap capable |
| Orchestration | Platform UI | Skills + Cron + Webhooks | Code-defined; testable; multi-channel |
| Monitoring | Platform + custom | Superpowers MCP + custom | Unified with our stack |
| Updates | Platform pushes | GitOps (FCC → PR → deploy) | Auditable; rollback; zero-downtime |
| Channels | Web dashboard | Telegram + WhatsApp + Discord | Mobile-native; premium feel |

## Intelligence Extracted (For Our Agency)

### Pricing Benchmarks (2026)
| Scope | Project Fee | Monthly Retainer | Our Target |
|-------|-------------|------------------|------------|
| Single workflow | $3-10K | $500-1,500 | $2-5K setup + $2-4K/mo |
| Multi-system dept | $10-35K | $1,500-4,000 | $5-10K setup + $3-6K/mo |
| LLM-heavy/compliance | $35-100K+ | $3-8K+ | $8-25K setup + $5-10K/mo |

### Engagement Models to Adopt
1. **Hybrid** — Project fee to launch + retainer for ops (best for us)
2. **Value-based** — Only when baseline metrics exist (pilot proves it)
3. **Project-only** — For clear, bounded workflows (our pilot path)

### Proposal Quality Signals (From Arsum)
**Strong proposal includes:**
- Named workflow + systems + handoff points
- AI step separated from deterministic automation
- Human review + exception paths priced
- Support scope specific (hours, SLA, tuning cadence)
- Model/tool usage boundaries
- Acceptance criteria pre-build

**Weak proposal red flags:**
- "AI automation setup" — vague scope
- No workflow baseline metrics
- No exception plan
- No ownership model (credentials, prompts, logs)
- No adoption plan

### ROI Calculator (Adopt for Our Proposals)
```
Monthly Value = Volume × Min Saved × Hourly Cost × Automation Rate + Avoided Errors
First-Year Cost = Discovery + Build + 12×Retainer + Model Usage + Platform + Internal Time
Payback Months = Build Cost / (Monthly Value - Retainer - Usage)
```

## Verdict: Reference Only
- **Do not build** n8n/Make competitor
- **Do adopt** pricing, proposal structure, ROI framework
- **Do differentiate** on: free infra, local models, GitOps, multi-channel, sovereign option