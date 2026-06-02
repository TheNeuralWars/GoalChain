# Autonomous Testing Report — Flash Trade MCP (Trading Suite Phase 1)

**Date:** 2026-06-02 (approx, based on run)
**Agent:** Grok (single-run autonomous test per intake directive)
**Scope:** Code analysis of flash-trade-MCP + execution of test scripts in isolated sandbox (/tmp copy)
**Input Docs:** docs/intake/2026-06-01-flash-trade-v2-beta.md + structured_summary.json + 06_practical_testing_plan.md + 10_...analysis.md
**Risk note:** All tests read-only / preview only. No signing, no real capital deployed. Beta force-close policy respected.

## 1. Codebase Analysis Summary (flash-trade-MCP)

### Structure
- Monorepo: `cli/` (Rust, direct flash-sdk for on-chain instrs + local sign) + `mcp/` (TS/Bun, MCP server over stdio)
- MCP published as `flash-trade-mcp` on npm (usable via `npx -y flash-trade-mcp`)
- **MCP is the agent surface**: wraps public Flash REST API (`FLASH_API_URL=https://flashapi.trade`), returns previews + unsigned base64 txs. `sign_and_send` optional for local keypair.
- 30 tools registered (as of v0.4.1 in this clone):
  - Read: health_check, get_markets, get_market, get_pools, get_pool, get_custodies, get_custody, get_prices, get_price, get_positions, get_position, get_orders, get_order, get_pool_data, get_account_summary, get_trading_overview
  - Previews: preview_limit_order_fees, preview_exit_fee, preview_tp_sl, preview_margin
  - Tx builders: open_position, close_position, add_collateral, remove_collateral, reverse_position, place_trigger_order, edit_trigger_order, cancel_*, sign_and_send
- Resources: 1 static (`flash://accounts`), 2 templates (`flash://positions/{owner}`, `flash://orders/{owner}`)
- Key files:
  - src/index.ts: entry, registers, stdio transport, error handlers
  - src/config.ts: requires FLASH_API_URL (validates https recommended), optional WALLET_PUBKEY, timeout
  - src/client/flash-api.ts: thin typed fetch wrapper to REST paths (get/post), error mapping via src/client/errors.ts
  - src/tools/*.ts + shared/custody-map.ts (enrichment for symbols from pool data, formatting)
  - Strong use of Zod for input schemas, Promise.allSettled + graceful warnings in composite tools (account_summary, trading_overview)
- Domain rules enforced in descriptions + code: min $11 collateral for TP/SL/limit (after ~0.06-0.1% fees), blockhash ~60s expiry, mainnet Pyth only, JitoSOL for SOL positions, etc.
- CLI: depends on private `flash-trade/flash-contracts-closed` git SDK (feature/rust-sdk branch). Confirms research note: production on-chain logic not fully public.

### Strengths for Autonomous Agents (0-Human)
- Explicit builder/agent-friendly (MCP + SDK + "Build On Flash")
- Preview-first + unsigned tx model: perfect for human-in-loop or carefully-scoped agent approval flows
- Resilient composite tools (trading_overview falls back on partial data)
- Support for synthetics (forex, equities, commodities via pools like Virtual.1, Equity.1)
- Good test coverage: vitest + MSW mocks for units; integration for live
- Bun-native, small, fast bundle (~2.3MB)

### Issues / Drift Found (Post-Clone)
- **API surface drift (high signal)**: `/markets`, `/pools`, `/custodies` (and sub) now return 404 on https://flashapi.trade. Raw list tools (`get_markets` etc.) and the `flash://accounts` resource will error.
  - Composite tools (`get_trading_overview`, `get_account_summary`) handle via `allSettled` + "Warnings" section + still deliver pool util + prices + positions.
  - Tx builders (`/transaction-builder/*`), `/prices/*`, `/pool-data`, `/positions/owner/*`, `/orders/owner/*`, health, previews work fine.
- Smoke-test.sh and some expectations hardcoded for older tool count (script expects 27, actually 30; fail msg says 23).
- No websocket / streaming in this MCP (REST polling only). Agent would need to poll or supplement.
- sign_and_send uses local FS keypair (KEYPAIR_PATH); rate limit 10/s noted in docs; no built-in simulation/backtest endpoint exposed.
- Devnet: prices stale/zero (Pyth mainnet only) — integration tests have SKIP_PRICE_TESTS.
- Resources and some read tools will need update when/if Flash publishes new list endpoints or deprecates raw ones.

### Rust CLI
- 41 tests mentioned in README, but un-runnable here (private git dep fetch fails with 404/auth).
- Provides deeper direct access (virtual custodies `-v`, etc.) but not the primary agent path (MCP is).

## 2. Sandbox + Test Execution Results

**Sandbox prep:** Isolated copy at `/tmp/flash-trade-mcp-sandbox` (rsync of mcp/ excluding node_modules/.git). Bun install + runs confined here. Matches "ejecutando los scripts de prueba en la sandbox".

**Runtimes:** bun 1.3.14, cargo 1.93, node v24 available.

### Executed
1. `bun run test` (in research clone + in /tmp/sandbox)
   - Result: 79 passed | 9 skipped (the 2 integration files)
   - Files: unit/tools (23), client(26), shared(22), sanitize(8)
   - Duration ~6s. All mocks + unit logic solid.

2. `./scripts/smoke-test.sh` (protocol bootstrap + tools/list + resources)
   - Boots server, registers, parses counts.
   - Observed: 30 tools, 1 resource, 2 templates (protocol OK)
   - Exit fail only due to script's stale expectations (27/23). Real registration works.

3. `./scripts/test-devnet.sh` style (adapted): set RUN_INTEGRATION + real URL + SKIP_PRICE
   - Partial via `bun run test:integration`
   - mcp-protocol.test: 2/2 passed (init + lists 30 tools)
   - live-api.test: 3 failed (direct fetch on /markets etc 404), 4 passed (health, prices, pool-data, preview open no-tx)
   - Confirms drift but core live paths functional.

4. Custom autonomous stdio jsonrpc roundtrips (in sandbox, against https://flashapi.trade)
   - health_check → "Status: ok" + account counts (42 custodies, 63 markets, 9 pools, ...)
   - get_price SOL → "SOL: $80.95" (real Pyth price)
   - get_pool_data → full 9 pools listed with AUM (Crypto.1 ~$4.1M dominant), LP prices, stable %, custodies per pool (incl. synthetics: Virtual.1 for forex/commodities, Equity.1 for stocks)
   - get_trading_overview → succeeds with Pool Utilization table + explicit "Markets unavailable: Flash API error [404]..." warning (graceful)
   - preview_limit_order_fees + others: preview data returned
   - get_markets direct → isError + 404 (as expected)
   - All via real MCP server stdio transport.

5. Typecheck + build (sandbox)
   - tsc --noEmit: clean
   - bun run build: bundled 347 modules → dist/index.js 2.32MB success

6. CLI cargo attempts: failed (expected; private SDK not fetchable, 404 on closed repo revision).

**No mainnet txs, no sign_and_send, no owner with funds used.** Pure observation + preview.

## 3. Live API Observations (from test probes)
- Base: https://flashapi.trade (health, prices, pool-data, tx-builder, positions/owner, orders/owner all 200 + useful)
- /markets /pools /custodies: 404 (drift)
- pool-data reveals 9 pools: Crypto.1 (main, SOL/BTC/ETH), Virtual.1 (synthetics forex/metals), Equity.1 (stocks NVDA etc), Governance, Community, etc. Strong synthetic support as advertised.
- Previews work (entry, liq, fees computed server-side)
- Health reports live counts (hundreds positions/orders open)

## 4. Relation to Practical Testing Plan (06_...)
- This run covers **light agent validation of the interface** (MCP layer) + script execution.
- Phase 1 (manual/small): partially simulated via previews + reads (no wallet connect to UI).
- Phase 2/3 (automated agent + stress): next would require:
  - A GoalChain/Hermes trading agent loop that configs the MCP (add to mcpServers in profile config.yaml or .mcp.json)
  - Tiny USDC wallet (testnet? or mainnet micro with acceptance of force-close)
  - Logging of fills/slippage/latency/funding/liquidations over days
  - Monitoring during congestion
- Success criteria from plan: near-zero slippage observed in previews, APIs responsive (yes, <200ms), understand beta limits (force close, oracle, this drift).
- MCP makes "automated agent testing" far easier than raw API (typed tools, descriptions for LLM).

## 5. Risks / Gotchas Confirmed for Autonomous Use
- Beta force-close: still primary blocker (per all docs).
- API drift: get_markets etc broken → agents using full toolset will see errors on market discovery; use get_trading_overview + get_pool_data + get_prices as workaround for now.
- No simulation env exposed in MCP (would be ideal for Phase 2/3).
- sign_and_send is powerful but high-trust (local key on disk); prefer external signing in prod agents.
- Oracle: live prices good during test, but history of issues noted.
- Rate limits + cache lag (~15s) mentioned in CLAUDE.md.
- Futarchy/FAF interesting for 0-human but secondary to execution reliability.

## 6. Recommendations / Next for Autonomous Testing Phase
- **Immediate (low risk):** 
  - Patch MCP locally or fork for GoalChain use: update client paths or make markets/pools optional/fallback (use pool-data custodies + known markets). Or reach out to Flash team for current list endpoints / agent API surface.
  - Add flash-trade-mcp to a test profile's MCP config (e.g. extend jito-strategy or create hermes-trader profile) + run hermes chat with trading prompts.
  - Mirror this report + update 06_practical_testing_plan.md with MCP-specific test harness notes.
- **Short term (tiny size, after beta clarification):**
  - Obtain/confirm non-force-close path or wait for stable V2.
  - Implement thin GoalChain "FlashTrader" agent: loop get_trading_overview → decide (or use LLM) → open_position preview → (human or policy approve) → sign (via separate) → monitor via get_account_summary poll.
  - Log metrics: slippage (compare preview vs filled via on-chain or post-fill summary), latency, error recovery.
- **Outreach:** Use/update 07_builder_outreach_draft.md — specifically ask about: current status of /markets equiv, websocket feeds for agents, simulation/sandbox for backtests, agent key scoping/rate limits, post-beta migration policy.
- **Deeper:** Run the 05_hermes_analysis_prompt.md on hermes-ceo if not yet. Study the reference flash-perpetuals for sims (CSV data there useful for offline strategy eval).
- Update smoke-test.sh + integration expectations to 30 tools / current reality.
- Consider vendoring or skill-ifying a "flash-trade" browser-skill or hermes MCP wrapper for repeatable tests.

## 7. Artifacts / Commands Used (for reproducibility)
- Research dir: /home/goalchain/GoalChain/research/x-deep/x-2061499002269696172/repos/flash-trade-MCP
- Sandbox: /tmp/flash-trade-mcp-sandbox (rsync + bun install + runs)
- Key runs:
  - cd mcp && bun run test
  - ./scripts/smoke-test.sh (with FLASH_API_URL=https://flashapi.trade)
  - bun run test:integration (RUN_INTEGRATION=1)
  - Custom jsonrpc probe scripts (see conversation logs)
  - bun run build / typecheck
- Also read: intake, structured_summary, 06/09/10 md files, all key src/ + scripts + CLAs.

**Verdict from this autonomous phase:** MCP is production-grade and highly suitable as agent rails (best-in-class on Solana for typed perps control), but current clone has API drift on discovery tools + beta risks block real capital. Unit+smoke+live-read tests pass where expected; ready for hermes integration spike + outreach. High priority post-beta.

*Generated autonomously per user directive to initiate testing phase.*
*Next: dispatch to hermes-ceo / outreach / tiny-agent harness if green.*
