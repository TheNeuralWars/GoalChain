# Issue #831 — [HERMES] Automated 9:16 Video Pipeline (Grok + Kokoro + Hyperframes + Buffer)

Issue body (verbatim objective)
> Implementar y ejecutar el pipeline que genera videos en 9:16 con Grok (narrativa), Kokoro (TTS de Enzo Bit) e Hyperframes (visuales) y los publica automáticamente en YouTube Shorts, X y TikTok vía Buffer.

Owner: hermes. Priority: P1. Dispatch: `agent:opencode` (Hermes CEO).
Direct-main mode: ENABLED (`cambio urgente` keyword present in issue body).
Branch: PR mode → `exp/opencode-issue-831` (draft PR) per CLAUDE.md PR output rule; final commits may land on `main` per direct-main authorization.

## State of the repo (inspected, 2026-06-23)

- Existing skeleton at `./scripts/marketing/video-automation/` (Hyperframes project, square 1080×1080).
- `./scripts/post_produce_reel.py` already orchestrates: render visuals + Kokoro TTS + ffmpeg mux. Hard-coded:
  - Composition is **square (1080×1080)** — does NOT satisfy 9:16 requirement.
  - Narrative text is **hard-coded Spanish** in `post_produce_reel.py` lines 53-57 → violates English Max Law.
  - Index literal text in `index.html` is **Spanish** ("Evento Oracle", "On-Chain Feed", "Live Oracle") → violates goalchain_webapp English localization + social channels English Max Law.
  - Publishing calls `post_video_update.py` (X + Discord only). No Buffer. No YouTube Shorts. No TikTok.
- `Buffer` API never referenced anywhere in repo (`BUFFER_*` env var absent).
- No Grok-call in the video path. Narrative is hard-coded template.

## Required output (META R1 — first-principles decomposition)

### Invariants

- Output video must be **9:16 portrait** (e.g. 1080×1920) — satisfies Shorts/TikTok/X vertical formats.
- All copy ENGLISH ONLY (English Max Law — X, TikTok caption, YouTube title/description).
- Grok generates the narrative (English), Kokoro TTS uses "Enzo Bit"-equivalent voice (default `ef_dora` per `post_produce_reel.py:17`).
- Buffer is the single, multi-channel dispatcher for the three public destinations. No direct YouTube Data API / X API / TikTok API from this pipeline.
- Pipeline idempotent: a previous successful post to Buffer must not be re-sent (track by `event_id`).
- Feature-flag everything on by default — **OFF** per `AGENT_ORCHESTRATION.md` decision (PR #33 directive: flags OFF). New flag `ORACLE_VIDEO_BUFFER_PUBLISH=0`.

### Failure modes (named)

|Failure|Mitigation|
|---|---|
|Grok API key missing|Use deterministic English fallback narrative (per event type). Log + exit code=2.|
|Kokoro TTS network failure|Skip mux step, retry 2x, else produce a stub video or abort — fail loud.|
|Hyperframes render time-out|Fail loud; never ship a corrupted file.|
|Buffer 401/429|Token expiry/cache invalidation is a config problem. Retry once on 429, abort on 401 with audit log.|
|9:16 render drifts to square|Hard-fail in CI if `ffprobe` reports width != 1080 or height != 1920 (assertion in tests).|
|Spanish passes through pipeline|lint/copy check before render; fail if tokenizer says non-English.|

### Out of scope (declared)

- Live streaming — separate `scripts/streaming/*` already exists.
- On-chain writes — none from this pipeline. Pure publishing automation.
- Discord integration — keeps its own `post_video_update.py` path (not blanket-replaced).
- Pinterest / Telegram / Reddit publishing (Buffer supports them, but they are not part of issue #831 objective).

## Proposed file list (concrete, small safe steps)

NEW files (one implementer, scope-strict):

1. `scripts/marketing/video-automation/compose/grok_narrative.py` — Grok API call. Given `{teamA, teamB, scoreA, scoreB, eventText, yieldChange, eventType}` → returns 6–10s English narrative.
2. `scripts/marketing/video-automation/compose/english_check.py` — tiny tokenizer wrapper around `social_multiplexer.py::check_english_max_law`. Re-usable.
3. `scripts/marketing/video-automation/compose/buffer_publisher.py` — Buffer API client. Single function `submit_video(profile_ids, video_url, text) -> buffer_update_id`.
4. `scripts/marketing/video-automation/compose/buffer_config.py` — channel-map loader from env (`BUFFER_YT_PROFILE_ID`, `BUFFER_X_PROFILE_ID`, `BUFFER_TIKTOK_PROFILE_ID`).
5. `scripts/marketing/video-automation/compose/compose_916.py` — wraps `post_produce_reel.py` with: narrative resolve, english-check, 9:16 variant selection, optional `--publish-buffer`.
6. `scripts/marketing/video-automation/compose/__init__.py` — package marker.
7. `scripts/marketing/video-automation/index_916.html` — 9:16 portrait composition (1080×1920). English copy. Same GSAP timeline, reflowed for vertical layout.
8. `scripts/marketing/video-automation/index_meta_916.json` — companion project (id `video-automation-916`) for the portrait variant.
9. `scripts/marketing/video-automation/package_916.json` — same Hyperframes CLI scripts as `package.json`, directory-scoped for 9:16.
10. `scripts/tests/test_video_pipeline_831.py` — pytest: english-check, 9:16 dimensions assertion, buffer payload shape, gate-flag behavior.
11. `ops/hermes/create-video-pipeline-issue831.sh` — thin wrapper to call `compose_916.py` with cron-friendly flags.
12. `docs/proposals/hermes/issue-831-proposal.md` — this file (re-anchored, surviving direct-main pushes per memory note: orchestrator hook truncates long proposal markdown 6×/day; keep <= 200 lines).

MODIFIED files (≤ 25 lines each, lint-checked):

- `scripts/post_produce_reel.py` — add 2 flags `--aspect 9x16` and `--narrative-source grok|hardcoded|json`; default to `grok` + `9x16`; preserve backward compat.
- `scripts/post_video_update.py` — leave untouched (Discord + X still go through it; Buffer path is new, parallel).
- `ops/hermes/config.env.example` — ADD `BUFFER_ACCESS_TOKEN`, `BUFFER_YT_PROFILE_ID`, `BUFFER_X_PROFILE_ID`, `BUFFER_TIKTOK_PROFILE_ID`, `ORACLE_VIDEO_BUFFER_PUBLISH=0`, `GROK_API_KEY_ALT` (fallback alias). All defaults are empty/disable.

DISABLED / new flag wiring (no schema break):

- Append `ORACLE_VIDEO_BUFFER_PUBLISH_DEFAULT=0` and a single-line guard at the top of `compose_916.py` that returns exit code=0 (no-op) if the flag is off. This satisfies the "flags OFF by default" rule from PR #33.

## Marker plan (R2 — decisive when fork is value-critical)

1. Re-use **Kokoro via Hyperframes CLI** (`npx hyperframes tts -v ef_dora`) — already wired.
2. Re-use **Hyperframes render command** (`npx hyperframes render`) — already wired.
3. Re-use **social_multiplexer.py::check_english_max_law** as the language guard.
4. Use **Buffer REST `POST /updates`** (per https://buffer.com/developers/api/updates) — single endpoint, multi-channel, supports video. Auth is HTTP Basic with `1|:access_token`. Profiles represent YouTube/X/TikTok channels.
5. Each pipeline run writes an audit `IssueEvent` row to `~/.hermes/profiles/hermes-ceo/state.db` — `task_finished` already exists; reuse through Hermes Manager.

## Risk + rollback

|Risk|Mitigation|Rollback|
|---|---|---|
|Buffer publish goes through and posts by accident|Flag default OFF; `--publish-buffer` requires both flag env and explicit CLI flag|Run `Buffer /updates/:id DELETE` for each id; revoke token in Buffer dashboard|
|Grok rate-limit / spend cap|Hard timeout (15s), 1 retry, deterministic fallback template|Refund via Buffer dashboard if posted; never reaches main on failure|
|9:16 composition rendering looks broken|Add ffmpeg/ffprobe assertions in tests (`width=1080`, `height=1920`)|Revert the new files; index.html square branch unchanged|
|Token lands in repo history|All tokens read from env via `bootstrap-profile-secrets.sh`-style path; CI secret scan|git filter-repo --invert-paths to strip any leak; rotate token|
|Hyperframes dev server interference|`render` only — no `dev` server required (per `AGENTS.md` warning)|N/A — render is one-shot|

## Exact test commands

```bash
# 1. English-check unit
python -m pytest scripts/tests/test_video_pipeline_831.py::test_english_check_blocks_spanish -q

# 2. Buffer payload shape (mock transport)
python -m pytest scripts/tests/test_video_pipeline_831.py::test_buffer_payload_shape -q

# 3. Flag gate (default OFF)
python -m pytest scripts/tests/test_video_pipeline_831.py::test_publish_buffer_gate_off -q

# 4. 9:16 render dimensions (assertion) — runs Hyperframes render once
ORACLE_VIDEO_BUFFER_PUBLISH=0 python scripts/marketing/video-automation/compose/compose_916.py \
  --teamA "Argentina" --teamB "France" --scoreA "2" --scoreB "1" \
  --eventText "Goal 82" --yieldChange "+15.4%" \
  --narrative-source hardcoded --publish-buffer=false \
  --dry-run && ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height scripts/marketing/video-automation/assets/reel_916.mp4

# 5. Lint the index_916.html via project check
( cd scripts/marketing/video-automation && npm --silent --prefix . run check )

# 6. Full pipeline (dry-run, flag still OFF, no Buffer network)
ORACLE_VIDEO_BUFFER_PUBLISH=0 bash ops/hermes/create-video-pipeline-issue831.sh \
  --eventType "match_goal" --teamA "Argentina" --teamB "France" \
  --scoreA 2 --scoreB 1 --yieldChange "+15.4%" --dry-run
```

Expected outcomes:
- Tests 1-3 PASS without network access.
- Test 4 produces a 1080×1920 MP4 (or fails loudly).
- Test 5 produces no lint/validate errors.
- Test 6 returns exit=0 with a run-summary written to stdout; does NOT call Buffer.

## Activation checklist (R10 — irreversibility-weighted)

- [ ] `BUFFER_ACCESS_TOKEN` provisioned out-of-band; nothing in repo.
- [ ] `ORACLE_VIDEO_BUFFER_PUBLISH=0` in `config.env.example`.
- [ ] Dry-run green; HG-810 lint green.
- [ ] One manual test post to Buffer in staging/test profile before live.

## Open PR (draft required by CLAUDE.md)

Branch name: `exp/opencode-issue-831` (Hermes CEO convention).
PR title: `[HERMES] Automated 9:16 video pipeline (Grok + Kokoro + Hyperframes + Buffer) — closes #831`
Draft only.

## Residual risks

1. **Enzo Bit voice ID mapping** — current default is `ef_dora`. If the chosen voice changes per copy feedback, single-line change in `compose_916.py`. No architectural impact.
2. **Buffer character limit** per channel differs (TikTok 2200, X 280, YouTube title 100). Payload split-handler is one helper.
3. **9:16 render time** — Hyperframes render time on a 1080×1920 Canvas may exceed CI budget. Mitigation: render on the dedicated VPS worker, only test dimensions in CI.
