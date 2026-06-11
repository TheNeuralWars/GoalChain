# Autonomous Testing Report — Flash Trade MCP (Trading Suite Phase 1)

**Date:** 2026-06-02
**Agent:** Grok (autonomous test phase per user directive "Iniciemos la fase de testeo autónomo...")
**Env:** Mac /Users/NicoPez (current session)
**Scope:** Re-confirmation of docs + full code analysis of flash-trade-MCP + execution of all test scripts + live probes in isolated /tmp sandbox.
**Key inputs read:** structured_summary.json, 06_practical_testing_plan.md, 10_flash_trade_mcp_..._analysis.md, intake 2026-06-01-flash-trade-v2-beta.md (at /Users/NicoPez/GoalChain/docs/intake/)
**Risk note:** Read-only + preview only. No funds, no signing, no on-chain tx. Beta force-close respected.

## 1. Codebase Analysis (flash-trade-MCP) — Summary
(See full details in prior 10_ analysis + CLAUDE.md + READMEs in the repo.)

- **mcp/** (primary for agents): Bun + @modelcontextprotocol/sdk. 30 tools (health, markets/pools/custodies/prices/positions/orders/pool-data + account-summary + trading-overview + previews + open/close/collateral/reverse + trigger orders + sign-and-send).
- Client: REST wrapper to FLASH_API_URL (https://flashapi.trade). Transaction tools return preview data + unsigned base64 tx.
- Strong patterns: Zod validation, resilient composites (Promise.allSettled + warnings for partial data), detailed agent-oriented descriptions and gotchas in CLAUDE.md (min $11 collateral after fees for TP/SL, blockhash expiry, mainnet-only prices, etc.).
- **cli/**: Rust, uses private git flash-sdk (closed). Tests exist but unbuildable without access.
- **Key finding (confirmed live):** Some discovery endpoints (/markets, /pools, /custodies) now 404 on the live API. Tools and the static resource that call them fail. However, critical paths for trading (prices, pool-data, positions/owner/*, orders/owner/*, transaction-builder/*, previews) work perfectly. `get_trading_overview` and `get_account_summary` degrade gracefully with warnings and still provide high-value data (pools, prices, positions).

MCP is one of the best "agent-native" interfaces available: preview-first, typed, documented for LLMs.

## 2. Sandbox + Test Execution (Fresh in this session)
**Sandbox:** `/tmp/flash-trade-mcp-sandbox` (rsync of mcp/ source, clean bun install).

**Results (executed 2026-06-02):**

- **bun run test**
  - 79 passed | 9 skipped (integration files require RUN_INTEGRATION=1 + live)
  - All unit: tools.test (23), client.test (26), shared (22), sanitize (8). Clean, fast (~0.4s in this run).

- **./scripts/smoke-test.sh** (with FLASH_API_URL=https://flashapi.trade)
  - Server boots, MCP protocol handshake + tools/list + resources/list succeed.
  - Observed: **30 tools, 1 resource, 2 templates**.
  - Script exits non-zero only because its expectations are outdated (hardcoded 27 / "expected 23" in fail msg). Real registration is good.

- **Typecheck + build**
  - `tsc --noEmit`: clean.
  - `bun run build`: Bundled 347 modules → dist/index.js 2.32 MB. Ready for npm/binary.

- **Live MCP probes (stdio jsonrpc calls to running server against real prod API)**
  - health_check: "Status: ok" + live account counts (pools ~9, markets 63, positions 652+, etc.).
  - get_price SOL: Returns current Pyth price (e.g. ~$80+ range in runs).
  - get_pool_data: Full data for 9 pools (Crypto.1 dominant ~$4.1M AUM, Virtual.1 synthetics/forex/commodities ~$1M, Equity.1 stocks, Governance, Community, etc.). Includes custody stats, utilization, LP prices.
  - get_trading_overview: Delivers pool utilization table + prices where available. Explicit warning: "Markets unavailable: Flash API error [404] /markets: Resource not found". Still very usable.
  - Previews (e.g. preview_limit_order_fees): Return entry/fee/liquidation estimates successfully.
  - Confirmed: get_markets etc. → isError 404.

- Integration-style (RUN_INTEGRATION=1 against prod): mcp-protocol portion passes (lists 30 tools); direct API tests in live-api.test show the same 404s on legacy list paths but working tx/preview/price/pool paths.

**CLI tests:** Not run (cargo fails on private SDK git dep — expected, confirms research).

No /tmp/flash... from earlier wrong-path sessions persisted; fresh run here.

## 3. Current State vs Practical Testing Plan
This execution covers **interface validation + script execution** (core of Phase 1 "Light Agent Validation" for the MCP layer itself).

- APIs are responsive and return real data for the important parts.
- Preview quality looks solid (server-side calc of entry, liq, fees).
- Synthetics support visible in pool data.
- Main gaps for full autonomous suite: the discovery drift (workaround exists via overview + pool-data), lack of exposed simulation, websocket not in this MCP, and the beta force-close policy (still the #1 risk per all docs).

Success criteria from plan (reliable APIs, understanding limits): partially met for the MCP surface. We have clear data-driven picture of what's usable today.

## 4. Key Issues / Gotchas Documented
- API drift on list endpoints (biggest code-vs-reality finding from live testing).
- Stale test/script expectations (30 tools now).
- Resources that rely on /markets etc. will also surface errors.
- For real agent use: prefer `get_trading_overview` + `get_pool_data` + `get_prices` + owner-specific position/order tools + previews. Avoid or wrap the broken raw list tools.
- sign_and_send and full tx flow not exercised (by design — safety).

## 5. Recommendations / Status of the Phase
**Testing phase status: Started and core executed successfully.** Unit + protocol + live read/preview tools all functional where the current API supports them. Report produced.

**Immediate next (autonomous or human):**
- Use this MCP in a real hermes profile (add to mcpServers in config.yaml or .mcp.json for a trader/agent profile). Test via chat: ask for trading overview, prices, preview a small position.
- Update the smoke-test.sh (and any hard-coded counts in tests/docs) to expect 30 tools.
- Consider a small shim/wrapper in GoalChain skills or gbrain for "flash-trade" that prefers the working tools and handles the 404s.
- Proceed to builder outreach (lead with MCP + the exact issues found) and/or tiny-size real testing only after beta clarification.
- Feed the full package (this report + 05 prompt + 06/07/08/10) into hermes-ceo Step 3.7 Flash if not yet done.
- Decision gate remains post-stable V2.

**Report location (authoritative):**  
/Users/NicoPez/GoalChain/research/x-deep/x-2061499002269696172/11_mcp_autonomous_test_report.md

All commands and probes above are reproducible in the /tmp/sandbox.

---

*Phase initiated and first autonomous execution round complete. "Como va": va sólido en lo que es testable sin fondos (79/79 unit + protocol + live data paths), con un issue claro de drift en la API que hay que trackear con el equipo de Flash. Listo para siguiente paso (integración real en agente + outreach).*

*¿Quieres que continúe? (configurar MCP en un profile, generar harness de agente, actualizar scripts, correr outreach draft, o lanzar sub-agent para más testing)?*