# Briefing bookmarks X → harness (19 sep 2026)

Fuente: 50 bookmarks más recientes de @nicopez vía X API. Créditos X restantes ~$18.27.
Prioridad GoalWorld: (1) growth goalworld.fun (2) film continuity/audio (3) Well/Lukoo.
Sin installs masivos en este turno.

## Descartados (cebo / ruido)

- Experiential Labs, TokenRouter, APINEX, UnoRouter: nombres de modelos inventados (GPT-6 Astra, Claude Fable, etc.).
- Hilos PnL milagroso / Polymarket “regalo” / “print money” sin repo auditado usable.
- Listas genéricas de remote jobs / “20 things missing on vibe sites” (checklist, no tool).

## Shortlist accionable

| # | Tool | Fit | Veredicto |
|---|------|-----|-----------|
| 1 | TypeSafe Jev | Harness routing / QC decisions | DO (piloto) |
| 2 | Monid | Tool marketplace pay-per-call | DEFER (piloto pequeño) |
| 3 | google/artemis | Android phone agent | DO (eval, no root phone) |
| 4 | microsoft/tgrep | Code search agentes | DO en box/VPS |
| 5 | OnlyTerp/toolrush | Latencia tool calls Hermes | DO si Hermes en Windows/MSYS; DEFER Linux |
| 6 | PostHog Startups $50k | Growth analytics goalworld.fun | DO aplicar |
| 7 | Microsoft for Startups | Azure credits | DO aplicar (tier bajo primero) |
| 8 | obra/superpowers + coreyhaines31/marketingskills | Skills Hermes/Cursor | DO selectivo |
| 9 | FFmpeg agent skill | Film cut/captions | DO (align Remotion/ffmpeg VPS) |
| 10 | DefiLeoo/YOINK | Second brain + claims | DEFER |
| 11 | JustVugg/colibri | Local MoE enorme | SKIP/DEFER (1.5TB SSD) |
| 12 | Design.md sites | UI goalworld.fun | DO como refs, no install |

## Estudios

### 1. TypeSafe Jev
- Qué: modelo System One que responde juicios tipados (Noul/Choice/Score) + confianza, no prosa. Lanzado ~15 sep 2026.
- URLs: https://typesafe.ai · skill https://github.com/typesafe-ai/skills · docs/API `POST /v1/systemone`
- Uso agentes: `npx skills add typesafe-ai/skills --skill typesafe-ai`. No escribe args de tools; clasifica/rutea. ~70–500ms, ~$0.042/M input tokens (claims vendor).
- Fit: ContinuityGuard/QC film (pass/fail shot), triage growth posts, gate de installs.
- Riesgos: waitlist/early access; marketing de “100x” en X es hype; no reemplaza LLM.
- Rec: DO piloto — skill + 1 flujo QC (shot approve/reject).

### 2. Monid
- Qué: “OpenRouter for agent tools”. Repo `monid-ai/monid` (~306★). Discover/inspect gratis; run metered. ~2000 tools / 72+ providers.
- URLs: https://monid.ai · https://docs.monid.ai · https://github.com/monid-ai/monid
- Fit: SEO/leads/search/gen para growth sin N suscripciones.
- Riesgos: young pre-seed; pay-per-call puede sorprender; superficie de seguridad amplia.
- Rec: DEFER — cuenta + discover-only primero; no cablear gen video (ya hay grok-imagine/ElevenLabs).

### 3. google/artemis
- Qué: NL → automatización Android. Apache-2.0. ~8090★ (sep 2026). Claims 99%+ AndroidWorld.
- URL: https://github.com/google/artemis
- Fit: interés de Nico en controlar Android; QA mobile GoalWorld.
- Riesgos: no es “Grok controla el teléfono” out of the box; requiere device/emulator + wiring MCP/CLI.
- Rec: DO evaluación en emulador; no root del teléfono personal.

### 4. microsoft/tgrep
- Qué: grep con índice de trigramas client/server. MIT. ~3250★. Usado en Copilot CLI.
- URL: https://github.com/microsoft/tgrep
- Fit: monorepos GoalChain/FILM; agentes buscan 50× más rápido vs ripgrep en repos grandes.
- Rec: DO instalar en VPS/box de código (`cargo install` o release).

### 5. OnlyTerp/toolrush
- Qué: capa de ejecución para Hermes que baja latencia de tool calls (reads/search/terminal). MIT. ~159★. Benchmarks internos agresivos (hasta 57× reads).
- URL: https://github.com/OnlyTerp/toolrush
- Nota: platform badge Windows/MSYS; verificar Linux antes de producción VPS.
- Rec: DEFER hasta confirmar OS del Hermes-ceo; si Windows lab → DO.

### 6. PostHog for Startups
- Qué: programa oficial $50,000 créditos PostHog / 12 meses (+ partner perks). Elegibilidad típica: <2 años, <$5M raised.
- URL: https://posthog.com/startups
- Fit: #1 ROI growth goalworld.fun (product analytics, funnels, session replay no-AI).
- Riesgos: créditos no cubren AI tools PostHog desde 14 sep 2026; review post-auto-approve.
- Rec: DO aplicar con email de dominio de empresa.

### 7. Microsoft for Startups
- Qué: créditos Azure (entrada baja $200–$5k sin investor; hasta ~$150k con path/verificación/investor).
- URL: https://www.microsoft.com/en-us/startups
- Fit: GPU/storage film, hosting.
- Rec: DO aplicar tier Founders; no asumir $150k inmediato.

### 8. Skills stack (superpowers / marketingskills / rtk)
- obra/superpowers: framework skills/metodología (~288k★ — viral; auditar qué skills concretas se usan).
- coreyhaines31/marketingskills (~50k★): CRO/SEO/copy para agentes → growth.
- rtk: CLI/token-saving utilities (varios forks; validar repo canónico antes).
- Rec: DO instalar selectivo marketingskills + 1–2 superpowers útiles; no “49 skills” de golpe.

### 9. FFmpeg skill (bookmark kebura_P)
- Qué: skill de agente para crop/zoom Ken Burns/rotate/captions vía FFmpeg.
- Fit: film Fractured Code + Remotion ya instalado; ffmpeg en VPS.
- Rec: DO adoptar skill en agentes de film; no reemplaza ContinuityGuard.

### 10. YOINK (DefiLeoo/YOINK)
- Qué: vault markdown + terminal; claims con fecha que se “settlean”. MIT. ~379★.
- Fit: research log / predicciones; no crítico path film.
- Rec: DEFER.

### 11. Colibrì (JustVugg/colibri)
- Qué: motor C para MoE enormes (p.ej. Kimi K3 2.8T) streameando experts desde SSD. ~36k★. Real, pero checkpoint ~1.5TB; ~0.5 tok/s en setups chicos.
- Rec: SKIP para harness ahora (costo disco/ops); OmniRoute free models cubre experimentación.

### 12. Design.md catalog
- typeui.sh, designmd.me, designmd.supply, styles.refero.design, getdesign.md, collectui.com
- Fit: refs de UI para goalworld.fun; no MCP.
- Rec: DO bookmark interno para Hermia/frontend; sin install.

## Estado connectors cine (update)

- Remotion: instalado (skills).
- ElevenLabs: **connected** (MCP tools vivos, p.ej. creative_generate_speech).
- Higgsfield: sigue **needsAuth**.

## Próximos pasos sugeridos (Jefe)

1. Aplicar PostHog Startups + Microsoft for Startups.
2. Piloto TypeSafe Jev en QC de shots.
3. tgrep en VPS GoalChain.
4. Artemis en emulador (no teléfono prod).
5. Completar auth Higgsfield si se quiere failover gen.
6. Auditar toolrush vs OS de Hermes-ceo.
