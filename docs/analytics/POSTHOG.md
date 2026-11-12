# PostHog analytics — play.goalworld.fun

EU Cloud, project **304954**. Code: `goalchain_webapp/src/analytics/`.

## Config
| Env var (Vercel) | Default | Notes |
|---|---|---|
| `VITE_POSTHOG_TOKEN` | project 304954 public key | Public `phc_` client key (ingest-only). Non-`phc_` values disable analytics. |
| `VITE_POSTHOG_HOST` | `https://eu.i.posthog.com` | Only `https://` hosts accepted; anything else falls back to EU. |
| `VITE_POSTHOG_DISABLED` | unset | `1` disables analytics (no SDK download, no requests). |

`?ph_debug=1` on any URL turns on SDK debug logging in the console.

## Loading
`posthog-js` is dynamic-imported on `requestIdleCallback` after `window.load` (separate chunk, not in first paint). Calls made earlier are queued (max 200) and flushed in order. A tiny pre-SDK `error` / `unhandledrejection` buffer keeps crashes that happen before the SDK loads.

## Events
| Event | When | Properties |
|---|---|---|
| `$pageview` / `$pageleave` | Initial load + every SPA route change (`history_change`) | PostHog defaults |
| `$autocapture` | Clicks / form submits / changes | PostHog defaults (text scrubbed) |
| `$exception` | Unhandled errors + promise rejections, plus pre-SDK buffer | `source` for buffered ones |
| `game_started` | Tactical match **Start** (`MatchSimulator`) or arcade game opened (`ModalRoot`) | `game` (`match_sim`/`penalty`/`pack`/`modifiers`), `mode` (`tactical`/`arcade`), `surface` (path), `entry_fee_gch` (tactical: 50) |
| `game_ended` | Match reaches FULLTIME, user presses **Stop**, restarts, or leaves mid-match; arcade modal closed by any path | `game`, `mode`, `result` (`win`/`draw`/`loss`/`abandoned`/`closed`), `duration_s` (wall clock, clamped 0–6 h), `surface`; tactical: `score_home`, `score_away`, `goal_diff`, `match_minute`; penalty: `goals`, `misses`; pack: `packs_opened`, `best_rarity` |
| `registration_completed` | `/crear-usuario` profile created | `method` (`wallet`), `role`, `avatar` (ids only) |
| `wallet_connected` / `wallet_disconnected` | Wallet adapter connection transition | `wallet_name` (e.g. Phantom), `network` (`devnet`) |

### Super properties (on every event)
- `app` = `play`, `app_env` = Vite mode.
- `first_touch_*` (stored once in `localStorage` `gc_ph_first_touch_v1`, never overwritten): `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `channel` (`x`/`search`/`owned`/`referral`/`direct`/raw utm_source), `x_account`, `referring_domain`, `landing_path`.
- `last_touch_*` — same keys, refreshed on each campaign visit (UTM, X or search).

### Links from X (@nicopez)
Use `?utm_source=x&utm_medium=social&utm_campaign=<campaign>&utm_content=nicopez`. `x_account=nicopez` is derived from `utm_content`/`utm_campaign`/`utm_term`/`ref`. Untagged X clicks still get `channel=x` from the `t.co` / `x.com` referrer.

## Privacy
- `person_profiles: 'identified_only'` and the app never calls `identify()` → no person profiles, no usernames/emails/wallets sent.
- `before_send` deep-scrubs Solana (base58, 32–44 chars with mixed case + digit) and EVM addresses → `[wallet]`, and emails → `[email]`, in all event properties incl. `$current_url` and autocapture text.
- Session replay: `maskAllInputs: true`; masked text for `.wallet-adapter-button`, `.wallet-adapter-dropdown(-list)`, `.wallet-connected-badge`, `.create-user-success code`, `.wallet-pill`, and any `[data-ph-mask]` element. Cross-origin iframes are not recorded. Replay only records if it is enabled in project settings.
- Disabled: surveys, product tours, conversations, web experiments, heatmaps, dead-click capture. No PostHog AI features.
- `respect_dnt` keeps the SDK default.

## Tests
`npm run test:analytics` (Node ≥ 22.18, native TS stripping) covers attribution, redaction, config resolution and event helpers. `npm run build` (tsc + vite) typechecks the wiring.
