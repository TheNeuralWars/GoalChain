# [opencode] P1: Build comprehensive Jito/MEV observability dashboard and alerting

## Objective
Implement comprehensive Jito/MEV observability: bundle success rates, tip efficiency, MEV capture metrics, ShredStream latency, and economy health correlation — all feeding into existing `/api/economy/health` and Hermes cron alerts.

## Context
- **Current state:** Basic economy health endpoint exists (`goalchain_api/src/index.ts:buildEconomyHealthPayload`); no Jito-specific metrics
- **Hermes cron:** `goalchain-alpha-watch.sh` runs every 30m, posts to WhatsApp; `oa-x-scout` posts to Discord
- **Gap:** No visibility into bundle landing rates, tip overpayment, MEV protection effectiveness
- **Target:** Devnet (primary), mainnet-ready patterns

## Acceptance Criteria
- PR opened with implementation on `exp/opencode-issue-476`
- All tests pass (anchor, unit, integration as applicable)
- No regression on devnet economy health endpoint
- Dashboard accessible and rendered
- Cron script executes without errors

## Metrics to Track (from proposal)

| Category | Metric | Target | Alert Threshold |
|----------|--------|--------|-----------------|
| **Bundle Health** | `bundle_success_rate_24h` | > 95% | < 90% → PagerDuty |
| | `bundle_landed_slot_accuracy` | > 90% | < 80% → Warning |
| | `avg_bundle_confirmation_ms` | < 2000ms | > 5000ms → Warning |
| **Tip Efficiency** | `avg_tip_lamports_per_bundle` | ~5000 | > 2× floor → Warning |
| | `tip_overpayment_ratio` | < 1.5× | > 3× → Optimization needed |
| | `tip_account_distribution` | Even across 8 | Skew > 60% to 1 → Warning |
| **MEV Protection** | `dontfront_usage_rate` | > 80% of user txs | < 50% → Warning |
| | `settlement_front_run_attempts` | 0 | > 0 → Investigation |
| | `sandwich_attack_prevented` | Count | — |
| **ShredStream** | `shredstream_uptime_24h` | > 99.9% | < 99% → Critical |
| | `shredstream_to_bundle_ms` | < 100ms | > 200ms → Warning |
| | `slot_sync_drift_ms` | < 50ms | > 200ms → Warning |
| **Economy Correlation** | `vault_buyback_coverage` | > 0.25 | < 0.15 → Critical |
| | `jitosol_yield_sol_30d` | > 0 | = 0 for 7d → Warning |
| | `protocol_revenue_sol_7d` | Trending up | Flat/declining 14d → Warning |

## Implementation Files (per proposal)

| File | Purpose |
|------|---------|
| `goalchain_oracle/src/monitoring/jito_metrics.ts` | Collect Jito metrics from Block Engine API + on-chain |
| `goalchain_oracle/src/monitoring/economy_correlation.ts` | Correlate Jito metrics with `/api/economy/health` |
| `goalchain_api/src/routes/health.ts` | Extend `/api/economy/health` with Jito section (NEW route file) |
| `~/hermes/scripts/jito-health-check.sh` | Cron script: runs every 15m, posts to Hermes/WhatsApp |
| `~/hermes/scripts/jito-dashboard.py` | Generates HTML dashboard (served via nginx or standalone) |

## Block Engine API Endpoints to Poll
```bash
# Bundle statuses (last 100)
curl https://testnet.block-engine.jito.wtf/api/v1/bundles

# Tip accounts
curl https://testnet.block-engine.jito.wtf/api/v1/tip-accounts

# ShredStream health (if available)
# On-chain: Jito stake pool, MEV tip accounts, bundle transactions
```

## Technical Constraints & Patterns

### 1. goalchain_oracle package (NEW monitoring module)
- Create `goalchain_oracle/src/monitoring/` directory
- Use TypeScript with strict mode
- Follow existing oracle patterns (see `goalchain_oracle/package.json`, `tsconfig.json`)
- Export async functions returning typed interfaces
- Handle API failures gracefully with caching/fallback

### 2. goalchain_api routes (NEW routes/health.ts)
- Move health logic from `index.ts` to `src/routes/health.ts`
- Keep `buildEconomyHealthPayload` as core, add `buildJitoHealthPayload`
- Extend `EconomyHealthPayload` with `jito` section
- Register route in `index.ts` with `app.use("/api", healthRoutes)`
- Maintain backward compatibility

### 3. Hermes cron script (`~/hermes/scripts/jito-health-check.sh`)
- Bash + Python embedded (like `goalchain-alpha-watch.sh`)
- Runs every 15 minutes via systemd timer
- Fetches `/api/economy/health` + new Jito section
- Stateful alerting (only alert on state change)
- Outputs to WhatsApp via Hermes cron `--no-agent`
- Uses `HERMES_HOME` and sources `config.env`

### 4. HTML Dashboard (`~/hermes/scripts/jito-dashboard.py`)
- Python script generating standalone HTML
- Fetches from API, renders with Chart.js (CDN) or static tables
- Color-coded by threshold (green/yellow/red)
- Auto-refresh meta tag (300s)
- Saved to `/tmp/jito-dashboard.html` or served via nginx

### 5. Webapp Integration (optional, P1 scope)
- New component `JitoMetricsPanel.tsx` in `goalchain_webapp/src/ui/`
- Follow `OpsStatusPanel.tsx` pattern (fetch client + typed interfaces + auto-refresh)
- Add to `DashboardGrid.tsx` collapsible ops section
- i18n keys in `goalchain_webapp/src/i18n/en.json`

## Interfaces to Define

```typescript
// goalchain_oracle/src/monitoring/jito_metrics.ts
interface JitoBundleMetrics {
  bundle_success_rate_24h: number;
  bundle_landed_slot_accuracy: number;
  avg_bundle_confirmation_ms: number;
  total_bundles_24h: number;
  landed_bundles_24h: number;
  failed_bundles_24h: number;
}

interface JitoTipMetrics {
  avg_tip_lamports_per_bundle: number;
  tip_overpayment_ratio: number;
  tip_account_distribution: Record<string, number>; // tipAccount -> count
  floor_tip_lamports: number;
}

interface JitoMevMetrics {
  dontfront_usage_rate: number;
  settlement_front_run_attempts: number;
  sandwich_attack_prevented: number;
  user_txs_total: number;
  user_txs_with_dontfront: number;
}

interface JitoShredStreamMetrics {
  shredstream_uptime_24h: number;
  shredstream_to_bundle_ms: number;
  slot_sync_drift_ms: number;
}

interface JitoEconomyCorrelation {
  vault_buyback_coverage: number;
  jitosol_yield_sol_30d: number;
  protocol_revenue_sol_7d: number;
}

interface JitoHealthPayload {
  timestamp_iso: string;
  bundle: JitoBundleMetrics;
  tips: JitoTipMetrics;
  mev: JitoMevMetrics;
  shredstream: JitoShredStreamMetrics;
  economy: JitoEconomyCorrelation;
  status: 'healthy' | 'warning' | 'critical';
  failing_checks: string[];
}
```

## Skill Hints
- **Follow gstack plan-eng-review before coding** — Write plan to `.hermes/plans/issue-476-plan.md` first
- **Apply frontend-design skill** for webapp dashboard components
- **Nemotron 3 Ultra Free** for all tiers (P0/P1/P2) per user config
- **FCC server endpoint:** `/v1/messages` (Anthropic format), model IDs use provider prefix

## Verification Commands
```bash
# 1. Build oracle
cd /home/ubuntu/hermes/workspace/GoalChain/goalchain_oracle && npm run build

# 2. Build API
cd /home/ubuntu/hermes/workspace/GoalChain/goalchain_api && npm run build

# 3. Run API tests
cd /home/ubuntu/hermes/workspace/GoalChain/goalchain_api && npm test

# 4. Test cron script (dry run)
HERMES_HOME=/home/ubuntu/hermes bash ~/hermes/scripts/jito-health-check.sh

# 5. Generate dashboard
python3 ~/hermes/scripts/jito-dashboard.py && head -50 /tmp/jito-dashboard.html

# 6. Build webapp (if UI component added)
cd /home/ubuntu/hermes/workspace/GoalChain/goalchain_webapp && npm run build
```

## Risk / Rollback
- Risk: scope drift or unstable Block Engine API dependencies
- Rollback: revert branch `exp/opencode-issue-476`
- Block Engine API is testnet only — handle 404/500 gracefully with cached fallback

## Dependencies
- Requires `docs/ECONOMIC_CANONICAL_CONFIG.json` thresholds for economy correlation
- Jito Block Engine testnet endpoints (may have rate limits)
- Hermes cron infrastructure already in place

## Owner
opencode (FCC)

## Priority
P1

## Labels
agent:opencode, priority:P1, area:monitoring, observability, devnet, hermes, jito, mev, yield, settlement, dontfront, jitosol, latency, shredstream, source:manager, status:ready

## Plan Output Requirement
First output MUST be structured Plan JSON per FCC protocol:
```json
{
  "goal": "Build Jito/MEV observability dashboard and alerting",
  "issue_number": 476,
  "branch": "exp/opencode-issue-476",
  "steps": [
    {"action": "create oracle monitoring module", "files": ["goalchain_oracle/src/monitoring/jito_metrics.ts", "goalchain_oracle/src/monitoring/economy_correlation.ts"], "depends_on": []},
    {"action": "create API health routes", "files": ["goalchain_api/src/routes/health.ts"], "depends_on": ["oracle monitoring module"]},
    {"action": "extend economy health endpoint with Jito section", "files": ["goalchain_api/src/index.ts"], "depends_on": ["API health routes"]},
    {"action": "create Hermes cron script", "files": ["~/hermes/scripts/jito-health-check.sh"], "depends_on": ["API health endpoint"]},
    {"action": "create HTML dashboard generator", "files": ["~/hermes/scripts/jito-dashboard.py"], "depends_on": ["API health endpoint"]},
    {"action": "add webapp JitoMetricsPanel component", "files": ["goalchain_webapp/src/ui/JitoMetricsPanel.tsx", "goalchain_webapp/src/lib/jitoClient.ts"], "depends_on": ["API health endpoint"]}
  ],
  "dependencies": ["@solana/web3.js", "chart.js (CDN)"],
  "risks": ["Block Engine API rate limits", "testnet endpoint instability", "Hermes cron env sourcing"],
  "verification": ["npm run build (oracle, api, webapp)", "npm test (api)", "cron dry-run", "dashboard generation"]
}
```