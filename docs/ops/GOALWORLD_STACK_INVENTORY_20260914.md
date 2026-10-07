# GoalWorld / GoalChain — Stack Inventory

**Host:** Goalchain (`ubuntu@100.101.211.44`)  
**Captured:** 2026-09-14 15:02 UTC (17:02 Europe/Rome)  
**Arch:** aarch64 · **Cores:** 4 · **Uptime:** ~18d 12h  
**Author:** Jefe de gabinete inventory pass (read-only; no gateway restarts)

---

## 1) Public sites (HTTP)

Origin path: Docker `twenty-caddy` binds `:80`/`:443`, Caddyfile `/data/apps/twenty/Caddyfile`.  
Public site tree: `/data/apps/GoalChain/_site_public` → container `/srv/goalworld`.  
Well landing: `/data/apps/Lucas/apps/well-landing` → `/srv/well`.  
Tunnel: user unit `cloudflared-well` (token `/home/ubuntu/.cloudflared/goalworld-well.token`) for Well + LukooFit.

| Site | Public curl | Local / notes |
|------|-------------|---------------|
| `https://goalworld.fun` | **200** (TLS OK) | Host→Caddy 308→HTTPS; served from `_site_public` |
| `https://www.goalworld.fun` | **200** | OK |
| `https://goalchain.fun` | **526** | Caddy has `tls internal` — Cloudflare Full cannot validate origin |
| `https://www.goalchain.fun` | **404** | No useful public page |
| `https://well.goalworld.fun` | **200** | Local via tunnel/Caddy; `tls internal` on origin |
| `https://fit.goalworld.fun` | **200** | 302 redirect → well (Caddy) |
| `https://lukoo.goalworld.fun` | **200** | reverse_proxy → host `:8877` (lukoofit-web) |
| `https://postiz.goalworld.fun` | **200**/307 | Local `:4007` → 307; healthy |
| `https://postiz.goalchain.fun` | **307** | Same Postiz backend |
| `https://crm.goalworld.fun` | **200** (TLS OK) | Twenty CRM + `/goalworld-api/*` strip → goalworld-api |
| `https://crm.goalchain.fun` | **200** | Twenty + `/goalchain-api/*` |
| `https://api.goalchain.fun` | **404** on `/` | API alive: `/health` → OK inside Docker net; no DNS for `api.goalworld.fun` |
| `https://api.goalworld.fun` | **DNS fail** | Caddy block exists (`tls internal`) but no public DNS |
| Mattermost | **no public DNS** (`mm.` / `mattermost.` NX) | Local **200** on `:8065` |
| Twenty direct | `twenty.goalworld.fun` DNS fail | App **200** on localhost `:3000` |
| `lukoofit.com` | **DNS fail** | App via `lukoo.goalworld.fun` only |
| Temporal UI | not public-checked | Local **200** on `:8080` |

### Localhost probe summary

| Port | Status | Likely service |
|------|--------|----------------|
| 80 | 301 | twenty-caddy ACME/redir |
| 443 | 400 (bare IP) | expects SNI/Host |
| 3000 | 200 | twenty-app |
| 3001 | `/` 404; `/health` OK | goalworld-api (Docker-internal; no host publish) |
| 4007 | 307 | postiz |
| 8065 | 200 | mattermost-app |
| 8080 | 200 | temporal-ui |
| 8877 | 200 | lukoofit-web |

---

## 2) Repos under `/data/apps`

| Path | Branch | Remote | Last commit (UTC-ish) | Dirty? |
|------|--------|--------|----------------------|--------|
| `/data/apps/GoalChain` | `main` | `https://github.com/TheNeuralWars/GoalChain.git` | 2026-09-14 12:13 `9ab7faeb` (weekly trading sim report) | **yes** (5: trading-sim + untracked `docs/ops/` etc.) |
| `/data/apps/GoalWorld` | `feat/env-migration` | `https://github.com/TheNeuralWars/GoalWorld.git` | 2026-08-10 `c57c00e` | **heavily dirty (125)** — docs drift; public origin now lives in GoalChain |
| `/data/apps/Lucas` | `main` | `https://github.com/TheNeuralWars/Lucas.git` | 2026-09-02 `27385a4` | dirty **2** |
| ↳ `Lucas/apps/lukoofit` | (no nested git) | openGym image `registry.gitlab.com/duartesantos8/opengym/web:latest` | — | compose under Lucas |
| ↳ `Lucas/apps/well-landing` | — | static HTML | — | mounted as `/srv/well` |
| `/data/apps/VoiceStudio` | `main` | `https://github.com/debpalash/VoiceStudio.git` | 2026-09-10 `eaf8bb9` | clean |
| `/data/apps/OmniVoice-Studio` | symlink → VoiceStudio | — | — | — |
| `/data/apps/Agent-Reach` | `main` | Panniantong/Agent-Reach | 2026-06-23 | dirty 1 |
| `/data/apps/CloakBrowser` | `main` | CloakHQ/CloakBrowser | 2026-06-28 | dirty 1 |
| `/data/apps/codebase-memory-mcp` | `main` | DeusData/… | 2026-06-25 | dirty 1 |
| `/data/apps/hermes-plugins` | `main` | 42-evey/hermes-plugins | 2026-06-18 | clean |
| `/data/apps/postiz` | no git root | compose only | — | — |
| `/data/apps/twenty` | no git root | compose + Caddyfile | — | — |
| `/data/apps/hermes` | no git at listed root | runtime/workspace | — | — |

Also present (non-primary): `GoalChain-faceless`, `GoalChain.git.backup`, `GoalChain-oracle`, `dot-hermes.archive`, `hermes-orchestrator`, `tools`, `rustup`.

---

## 3) Key services

### Docker (running)

| Name | Status | Ports / role |
|------|--------|--------------|
| `twenty-caddy` | Up 3d | **80/443** — public edge |
| `twenty-app` | Up 6d | 3000 — CRM |
| `twenty-db` / `twenty-redis` | healthy | — |
| `goalworld-api` | Up 6d | internal only; `/health` OK |
| `postiz` + postgres/redis | healthy | 4007→5000 |
| `mattermost-app` + db | Up 6d | 8065 |
| `lukoofit-web-1` / `lukoofit-api-1` | healthy | 8877 |
| `temporal` + ui/admin/pg/es | healthy | 7233, UI 8080 |
| `omniroute` | healthy | `diegosouzapw/omniroute:latest` |

### systemd — Hermes gateways (names + status only; **not restarted**)

| Unit | Scope | Active |
|------|-------|--------|
| `hermes-gateway-hermes-ceo` | user | **active** |
| `hermes-gateway-social` | user | **active** |
| `hermes-gateway-trader` | user | **active** |
| `hermes-gateway` (system) | system | inactive/disabled |
| `hermes-mmwebhook` | system | **active** |
| `hermes-discord-gw-watchdog` | user | inactive (timer/static) |

### Other notable units

| Unit | Active |
|------|--------|
| `cloudflared-well` (user) | **active** — Well + LukooFit tunnel |
| `goalworld-api` (user) | **active** (alongside Docker container of same name — verify which is authoritative) |
| `lukoo-well-landing` (user) | **active** |
| `goalworld-origin-deploy.timer` (user) | **active (waiting)** — every 5 min |
| `pm2-ubuntu` | active |
| Root process `caddy` (`/etc/caddy/Caddyfile`) | process up but **ports owned by docker twenty-caddy**; Caddyfile empty/unused — dual-Caddy smell |

No system unit named plain `cloudflared`; tunnel is `cloudflared-well`.

---

## 4) Disk & load

| Metric | Value |
|--------|-------|
| `/` | 45G total · **30G used · 15G free (68%)** |
| `/data` | 196G total · **96G used · ~90–91G free (52%)** |
| Load avg | **2.56 / 1.72 / 1.60** (later sample ~2.88 / 2.14 / 1.77) on 4 cores |
| RAM | 23 Gi total · ~8.5 Gi used · ~14 Gi available |
| Inodes | `/` 7% · `/data` 17% — OK |

---

## 5) Known broken (explicit, unchanged)

1. **YouTube Postiz OAuth** — known broken (social publish path).  
2. **SuperGrok weekly limit** — known capacity/rate limit.  
3. **VoiceStudio ML on aarch64** — host is **aarch64**; ML path known broken / not portable here.

---

## 6) Top 5 infra risks (factual)

1. **`goalchain.fun` returns Cloudflare 526** — origin uses `tls internal`; public apex for GoalChain brand is effectively down.  
2. **Root disk 68% on 45G** — little headroom for Docker layers, logs (`/var/log` ~644M), `/tmp` (~972M); fill risk before `/data`.  
3. **Dual Caddy** — leftover root `caddy` process + `twenty-caddy` owning 80/443; future restart confusion / config drift.  
4. **`GoalWorld` repo 125 dirty on stale branch** while live public tree is GoalChain `_site_public` — split-brain for docs/ownership.  
5. **Mattermost & API not cleanly public** — MM only on `:8065`; `api.goalworld.fun` no DNS; `goalworld-api` not published to host ports (OK if intentional, brittle for ops curls).

## Top 5 growth levers (page + products, factual)

1. **goalworld.fun origin pipeline works** — `deploy_origin.sh` + 5‑min timer restaging clean public tree (last restage **2026-09-14 15:00:21 UTC**, commit `9ab7faeb`); fastest surface for page/product marketing.  
2. **Well → LukooFit funnel already live** — `well`/`fit`/`lukoo.goalworld.fun` all **200**; productize pass/sign-up on LukooFit (openGym) behind existing subdomain.  
3. **CRM + API colocated** — `crm.goalworld.fun` **200** with `/goalworld-api/*` proxy; use for waitlists, B2B, and GoalWorld program (`programId` reported healthy).  
4. **Postiz up** — scheduling surface ready once YouTube OAuth fixed; other networks may already work.  
5. **Temporal + omniroute healthy** — workflow/orchestration capacity for product automation without new infra.

---

## 7) Deploy hygiene — `scripts/pages/deploy_origin.sh`

| Check | Result |
|-------|--------|
| Script path | `/data/apps/GoalChain/scripts/pages/deploy_origin.sh` **exists** |
| systemd timer | **`goalworld-origin-deploy.timer` exists**, enabled, every **5 min** |
| Service | `goalworld-origin-deploy.service` → ExecStart that script |
| Last restage | **2026-09-14 15:00:21 UTC** — `restaged 9ab7faeb` (guard OK, 0 internal leaks) |
| Served dir mtime | `_site_public` modified **2026-09-14 15:01 UTC** |
| Behavior | fetch/pull `main` if `docs`/`scripts/pages` changed → stage → guard → rsync into bind-mount (does not replace mount inode) |

**Verdict:** deploy hygiene **healthy**; timer present and recently successful.

---

## Quick OK / FAIL list

**OK:** goalworld.fun, www, well, fit, lukoo, postiz, crm.goalworld, crm.goalchain, local MM/Twenty/Temporal/Lukoo/Postiz, goalworld-api `/health`, origin-deploy timer.  

**FAIL / degraded:** goalchain.fun **526**, www.goalchain.fun **404**, api.goalworld.fun **no DNS**, api.goalchain.fun `/` **404**, lukoofit.com **no DNS**, Mattermost **no public hostname**, known: Postiz YT OAuth, SuperGrok weekly, VoiceStudio ML aarch64.
