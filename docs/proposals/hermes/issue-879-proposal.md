# OA Proposal — Issue #879 (refined)

## Title
[DRAFT] Reader polish: pricing/CTA copy, repo-relative generator, 70KB -> <60KB

## Source
GitHub issue #879 (labels: `priority:P2`, `status:ready`, `agent:hermes`, `source:manager`)
Branch (kept): `exp/hermes-issue-879` — draft PR only, no merge to `main`.

## Context files read (in the order requested)
1. `CLAUDE.md` — OK. Loaded skills by intent: **frontend-design** (webapp/UI), **gstack
   /review**, **gstack /investigate**, **gstack /plan-eng-review**. Deliberately NOT used:
   `/ship`, `/land-and-deploy`, browser `/qa` (headless VPS; Antigravity merges).
2. `ai_context/META_CHARTER.md` — **DOES NOT EXIST** in this repo.
3. `.cursor/rules/meta-principal.mdc` — **DOES NOT EXIST** (`.cursor/` is absent entirely).
4. `ai_context/AGENT_ORCHESTRATION.md` — OK (label contract; owner of merge = Antigravity).

Fallback principle sources used instead of the two missing files: `CLAUDE.md`
(scope + META constraints), `ai_context/AGENT_ORCHESTRATION.md` (status/done contract),
and the META constraints written inside issue #877's body (`#877` is this issue's parent).

## Repo constraints in force (from CLAUDE.md + #877 META block)
- Static HTML only. No new dependencies, no framework, no build step beyond the existing generator.
- Single source of truth = `scripts/build_static_reader.py`. Never hand-edit the two HTML files.
- Do NOT touch `contracts/`, `goalchain_api/`, `goalchain_webapp/`, `api/`, `webapp/`, or any
  manuscript file under `docs/publishing/the_neural_wars_trilogy/**`.
- No secrets read or committed.
- Public copy: English-first for page metadata (English Max Law); the in-page ES/EN toggle stays.
- Never claim "hard sci-fi" (`kdp_manifest.json` -> `bisac_excluded`).
- Draft PR; no direct merge to `main`.

## Task checklist (plain text on purpose — `todowrite` is forbidden for Nemotron-3)
- [x] T1 Recon: locate repo, read installed skills, confirm branch `exp/hermes-issue-879`.
- [x] T2 Read the four context files; record that two are missing.
- [x] T3 Reproduce all three defects from issue #879 with real evidence.
- [x] T4 Establish the root cause of the copy defect (findings below).
- [ ] T5 Refine this proposal.
- [ ] T6 Implement in the generator: repo-relative paths.
- [ ] T7 Implement in the generator: restore the reader DOM (blocking regression).
- [ ] T8 Implement in the generator: ES+EN pricing/CTA copy from the manifest.
- [ ] T9 Implement in the generator: compress the payload to reach < 60 KB.
- [ ] T10 Regenerate `docs/reader.html` + `docs/go/reader/index.html`.
- [ ] T11 Run static tests (size, markers, no hard sci-fi, no Amazon link).
- [ ] T12 Run browser tests (headless Chromium DOM: sample actually renders).
- [ ] T13 Run off-VPS reproducibility test (repo-relative proof).
- [ ] T14 Open draft PR + paste real test output + risks + rollback.

## Findings (measured, not assumed)

### F1 — P0 REGRESSION, not listed in the issue: the sample never renders at all
`docs/go/reader/index.html` (live artifact of #877) has **no `#reader-body` element and no
`<article>` open tag**, but a stray `</article>`. `renderChapter()` starts with
`document.getElementById('chapter-meta-tag').textContent = ...` -> `null` -> TypeError, so
`renderChapter()` aborts before writing any chapter text. Proof (headless Chromium,
`--dump-dom` of the served page):

```
reader-body element: None
article elements: 0
chapter-meta-tag: None
toc items: 0
total visible body text: 506 chars
h2 text: ['The Neural Wars: Fractured Code']
P: Este libro tiene ¡<0.99 USD! Dispondible en 2.99 USD para Kindle
P: Solo se entrega el Prólogo y Capítulo 1. Resto del libro para compradores.
```

The whole reader renders **only the pricing block** — the prologue + chapter 1 sample is
absent from the DOM. Cause: commit `bdb5090b` (#877) replaced the chapter containers with the
pricing section:

```
-    <article>
-      <div class="chapter-header">
-        <div id="chapter-meta-tag" class="chapter-tag"></div>
-        <div id="chapter-meta-time" ...></div>
-      </div>
-      <div id="reader-body" class="reader-body"></div>
+  <!-- PRICING & EMAIL CAPTURE SECTION (sample + buy gate) -->
+  <div class="pricing-section" ...>
...
-  <script src="../../assets/js/gw-shell.js"></script>
```

#877's acceptance tests were raw-`grep` on the HTML, so they passed while the DOM was broken.
This is in scope: item 3 says trim "without dropping the prologue + chapter 1 sample", and the
sample is currently dropped (it is only inert JSON inside `<script>`).

### F2 — Broken Spanish copy, and the ES/EN toggle cannot fix it
`<p>Este libro tiene \u00a1<0.99 USD! Dispondible en 2.99 USD para Kindle</p>` is a
**static ES-only string** baked into the template: `\u00a1` is an escaped `¡` that leaked
through as placeholder text, the `<0.99` literal is the raw manifest value never interpolated,
and "Dispondible" is a misspelling of "Disponible". Because the paragraph is static markup, the
existing ES/EN toggle (`changeLang`) never touches it -> EN is missing entirely. So ES and EN
are out of sync by construction (constraint violation).

### F3 — Broken CTA handler
The CTA button is `onclick="goToPlay('/go/reader/')"`, but `goToPlay` is defined in
`docs/assets/js/play_url.js`, which the reader page **never loads** (`grep -c play_url` = 0;
the `gw-shell.js` include was dropped by #877). Clicking the "email capture" CTA throws
`ReferenceError: goToPlay is not defined`. There is also no `<input type="email">` anywhere on
the page, so nothing is captured. No production lead backend exists in this repo
(`docs/assets/js/solana_integration.js` posts to `http://localhost:3001/api/whitelist` — a
presale wallet endpoint, unreachable from static GitHub Pages).

### F4 — Absolute paths
`base_trilogy = r"/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy"`, the manifest
path and both output paths are absolute -> unreproducible off-VPS.

### F5 — Size
`docs/reader.html` = `docs/go/reader/index.html` = **70,127 bytes** (byte-identical, `diff` = 0).
Breakdown: shell 28,713 B (CSS 6,779 + JS logic ~14,172 + markup) + plain JSON payload 41,414 B.
Raw chapter text alone is 40,277 B. **Even with a zero-byte shell the plain-text payload cannot
fit under 60 KB**, so compression is required (deflate+base64 = 23,788 B).

## Plan (single file edited; all artifacts regenerated from it)
Only `scripts/build_static_reader.py` is edited by hand. `docs/reader.html`,
`docs/go/reader/index.html` and `docs/assets/data/neural-wars-sample.json` are
**generated** (never hand-edited), preserving the single-source-of-truth constraint.

1. **Repo-relative resolution (item 2).** Add `from pathlib import Path`;
   `REPO_ROOT = Path(__file__).resolve().parents[1]`; derive `base_trilogy`,
   the manifest path and both output paths from it. No absolute path may remain.
2. **Restore the reader DOM (F1).** Re-add `article` + `.chapter-header` +
   `#chapter-meta-tag` + `#chapter-meta-time` + `#reader-body` inside `<main>`, with the
   pricing block as the first child of `<article>`. This is what makes the sample render.
3. **Pricing/CTA copy ES+EN (item 1, F2, F3).** Replace the corrupted static paragraph with a
   real two-language block: `data-copy-es`/`data-copy-en` attributes + a tiny
   `applyPricingCopy(lang)` called from `init()` and `changeLang()` — so ES and EN can never
   drift (single array of strings, one render path). Prices interpolated from
   `kdp_manifest.json` (`preorder_usd`, `regular_usd`, `kindle_unlimited`); no literal
   `<0.99` placeholder survives.
4. **Honest CTA (constraint).** Replace the dead `goToPlay` button with a real email-capture
   `<form>` (`type="email"`, `required`). No Amazon URL is emitted anywhere while
   `asin_status` is a placeholder (asserted by a test). Because this repo has no production
   lead backend, the handler posts to a generator-configured endpoint if one ever exists,
   otherwise it keeps the captured address locally and says so plainly in both languages —
   no invented "we will email you" promise and no fake success from a non-existent API.
5. **Payload compression (item 3, F5).** The generator emits
   `const BOOKS_DATA_B64 = "<deflate+base64>"`, inflated in the browser with
   `DecompressionStream('deflate')` (~23.8 KB vs 41.4 KB, ~17.6 KB saved). A
   `docs/assets/data/neural-wars-sample.json` twin is written as a fallback for engines
   without `DecompressionStream`, so the sample can never be empty. Prologue + chapter 1
   (ES and EN) are preserved byte-for-byte inside the payload.
6. **Metadata honesty.** Page `<title>`/`<meta description>` become English and accurate
   (sample + Kindle edition, not "gratis"/"audiolibro gratuito"), no "hard sci-fi" claim.
   The in-page ES/EN toggle is kept; `<html lang>` now follows the active language.

## Copy deck (approved wording, ES + EN must stay in sync)

Pricing line
- ES: `Novella fundacional de ciencia ficción cyberpunk. Precio de lanzamiento: $0.99 USD ·
  Precio regular: $2.99 USD · Incluido en Kindle Unlimited.`
- EN: `A cyberpunk sci-fi foundational novella. Launch price: $0.99 USD · Regular price:
  $2.99 USD · Included in Kindle Unlimited.`

Availability note (avoids both the fake Amazon link and the fake "available now" claim)
- ES: `La edición Kindle aún no está publicada. Lee gratis el prólogo y el capítulo 1 aquí abajo.`
- EN: `The Kindle edition is not published yet. Read the prologue and chapter 1 free below.`

Waitlist CTA (email capture, kept)
- ES: `Avisadme cuando salga` — label: `Avisadme cuando salga`
- EN: `Notify me at launch` — label: `Notify me at launch`

Sample scope note
- ES: `Solo se incluyen el Prólogo y el Capítulo 1. El resto del libro, para quien lo compra.`
- EN: `Only the Prologue and Chapter 1 are included. The rest is for readers who buy the book.`

## Tests to run (real output pasted in the PR)
1. `python3 -m py_compile scripts/build_static_reader.py`
2. Size + markers: byte size of both HTML files < 60000; `CAPÍTULO 15` / `CHAPTER 15` absent;
   `CAPÍTULO 1:` / `CHAPTER 1:` present in `docs/assets/data/neural-wars-sample.json`.
3. `grep -ic "hard sci-fi" scripts/build_static_reader.py` == 0, and no `amazon.com` /
   `B0DXNEURAL1` link in either generated page.
4. Headless Chromium DOM test on a local HTTP server: `.reader-body p` count > 0,
   prologue + chapter 1 text present, ES copy present with `?lang=es`, EN copy with
   `?lang=en`, price strings present, TOC populated (proves F1 is fixed).
5. Off-VPS reproducibility: copy the repo subset to `/tmp/...`, run the generator from a
   different CWD, and confirm byte-identical output (proves F4 is fixed).
6. `git diff --stat` to confirm no manuscript/api/webapp file was touched.

## Risks / regressions
- **Medium** — `DecompressionStream` is required (Chrome/Edge 80+, Safari 16.4+, Firefox 113+);
  mitigated by the JSON fallback artifact (tested by forcibly deleting `DecompressionStream`).
- **Medium** — re-adding the `<article>` block changes the page layout; mitigated by rendering
  the pricing block as the first child of `<article>` and by the headless-DOM test below.
- **Medium — page budget is now tight:** the page lands at **59,750 bytes vs the 60,000 limit
  (~250 bytes of headroom)**, down from 70,127. Prose already compresses to 23,700 B; the
  remaining fat is the pretty-printed CSS/JS shell. The generator now *asserts* the budget, so a
  future change fails the build instead of silently regressing. Any further feature must
  minify the shell or move the payload out of the page first.
- **Low** — the CTA has no server-side capture; documented, not hidden.

## Rollback
`git revert` the single implementation commit on `exp/hermes-issue-879`, or restore
`scripts/build_static_reader.py` from `cd5419fe` and re-run it (it regenerates both HTML files
plus the JSON twin deterministically). No on-chain, economy, API or manuscript file is touched,
so rollback carries no data risk.

## Out of scope (left untouched, reported for the reviewer)
- `★ VIP PASS ACTIVO` badge in the header is misleading now that the page is a sample gate; not
  requested by #879, so not changed (flagged, not silently "fixed").
- `docs/goalworld.html` links `reader.html?book=the-neural-wars-book-2`; Book 2 has no sample
  payload anymore (#877 removed it), so that deep link silently falls back to Book 1.
- Queue contract: the `.done` marker was created (`.done/hermes/issue-879.done`) and the issue's
  `status:ready` label was replaced with `status:done`, per the `oa-worker.sh` success path
  (remove ready/in_progress → add status:done → touch .done). Reconcile will find evidence via
  branch `exp/hermes-issue-879` and draft PR #880, so the marker is not stale. Merge remains with
  Antigravity — a `status:done` label means "implemented", not "merged".

## Implementation log (what actually shipped)

Files written by hand: **`scripts/build_static_reader.py` only.**
Files regenerated by that script: `docs/reader.html`, `docs/go/reader/index.html`,
`docs/assets/data/neural-wars-sample.json` (new).
Not touched: `contracts/`, `goalchain_api/`, `goalchain_webapp/`, `api/`, `webapp/`, every
manuscript file, any `.env`/secret.

Beyond items 1–3, two adjacent defects were fixed because they were directly in the blast radius
of restoring the sample (both are called out here rather than folded in silently):
1. **Markdown split (F1 collateral).** With the DOM restored, the prologue's `<h1>` swallowed the
   following `## The Neural Wars: Fractured Code` line, rendering raw `## ` text as the first
   thing a reader sees. `renderChapter()` now splits on blank lines *and* immediately before a
   heading line (`/\n{2,}|(?=\n#{1,3} )/`), so the heading becomes a real `<h2>`. Verified: 0
   raw-markdown leaks in all four rendered views (below).
2. **Dead payload fields.** `subtitle`, per-chapter `id` and `index` were embedded but never read
   by the page (grepped: 0 usages). Removing them is exactly the "trim the embedded payload"
   remedy in item 3 and bought back ~50 bytes of budget.
3. **Dead pricing duplication.** The `PRICING` const and the `booksWithPricing` loop inherited
   from #877 wrote `book.pricing` that nothing ever read — a second, drifting copy of the price.
   Removed; the static markup interpolated from `kdp_manifest.json` is the only rendered source.

## Final test results (real output)

Generator (asserts payload round-trip + page budget, so it fails loudly on regression):
```
[i] payload: json=41234B -> deflate+b64=23700B
[i] page size: 59750 bytes (budget 60000)
[+] Wrote docs/reader.html (59750 bytes)
[+] Wrote docs/go/reader/index.html (59750 bytes)
[+] Wrote docs/assets/data/neural-wars-sample.json (41580 bytes)
```
- `python3 -m py_compile` and `python3 -W error::SyntaxWarning` → clean, no warnings.
- `70,127 → 59,750` bytes for **both** twins (they were byte-identical before and still are).
- `grep -ic "hard sci-fi" scripts/build_static_reader.py` → **0**; `grep -ic amazon` on the page → **0**;
  `B0DXNEURAL` → **0**; broken copy (`Dispondible`, `\u00a1`, `<0.99`) → **0**.

Headless Chromium (`--virtual-time-budget`, real DOM after JS):
```
ES  : lang=es h1=['PRÓLOGO CÓSMICO']            blocks=36 p=24 toc=2 leaks=0 sample=6624 chars
EN  : lang=en h1=['COSMIC PROLOGUE']            blocks=36 p=24 toc=2 leaks=0 sample=6272 chars
ES+ch1: h1=['CAPÍTULO 1: EL UMBRAL DE LA FRACTURA']  blocks=66 p=60 toc=2 leaks=0 sample=13691 chars
EN+ch1: h1=['CHAPTER 1: THE THRESHOLD OF THE FRACTURE'] blocks=66 p=60 toc=2 leaks=0 sample=12810 chars
CAPÍTULO 15 / CHAPTER 15 in rendered text: absent in all four
```
ES/EN sync via CDP `Runtime.evaluate` on the live page:
```
INITIAL : copy=Novella fundacional… Precio de lanzamiento: $0.99 USD · Precio regular: $2.99 USD… cta=Avisadme cuando salga
AFTER EN: copy=A cyberpunk sci-fi foundational novella. Launch price: $0.99 USD · Regular price: $2.99 USD… cta=Notify me at launch
BACK ES : identical to INITIAL  (no drift after a round trip)
```
Email capture (no backend): `bad-email` → "Introduce un email válido."; valid → stored in
`localStorage` `gw_reader_leads` with the honest "no notification service connected yet" notice.
No uncaught JS errors on load; the dead `goToPlay` handler is gone (`typeof window.goToPlay` →
`undefined`, and nothing calls it).

Off-VPS reproducibility (F4): the repo subset copied to `/tmp/repro`, generator executed from
`cd /` — all three artifacts **byte-identical** to the VPS-generated ones
(`cmp` → IDENTICAL ×3). No absolute path remains in the script or the page.

## Known pre-existing issue NOT fixed (flagged)
Inline `*italic*` markers still render literally (`<p>*En el principio era la red...*</p>`) — the
renderer never supported inline markdown. Out of the three items and outside the byte budget
(no headroom for new JS), so it is reported rather than fixed.


