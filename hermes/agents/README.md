# Agents Directory Structure

This folder contains all tokenizable agents for GoalChain.

## Structure

```
/opt/hermes/agents/
├── hermes/                    # Hermes (OpenClaw) - Intake & Orchestration
│   ├── config.json
│   ├── prompt.md
│   ├── revenue-split.json
│   └── README.md
│
├── vault-sentinel/            # Vault monitoring & buyback agent
│   ├── config.json
│   ├── prompt.md
│   ├── revenue-split.json
│   └── README.md
│
├── devnet-oracle/             # Devnet data & betting simulation agent
│   ├── config.json
│   ├── prompt.md
│   ├── revenue-split.json
│   └── README.md
│
└── README.md                  # This file
```

## Each Agent Folder Contains

- `config.json` — Agent metadata and Virtuals.io configuration
- `prompt.md` — System prompt / behavior definition
- `revenue-split.json` — How revenue is distributed
- `README.md` — Specific documentation for that agent

## Deployment

When ready, copy this entire structure to:
`/opt/hermes/agents/` on the Oracle Cloud server.
