# OA Proposal: Issue #83 — [OPENCODE] [P0] English Localization of Webapp UI — Full i18n Parity for Growth Campaigns

**Worker:** theta (partition 7)
**Owner:** opencode
**Priority:** P0
**Mode:** Normal mode: committed locally to branch, validated and merged locally by reviewer.

## Issue Body

### Objective
Full English localization of user-facing strings in `goalchain_webapp/` — blocks growth campaigns.

### Scope
- `goalchain_webapp/src/i18n/locales/en.json` — complete English locale (parity with es.json)
- `goalchain_webapp/src/i18n/locales/es.json` — audit for completeness
- `goalchain_webapp/src/i18n/translations.ts` — add new TranslationKeys
- Components with hardcoded Spanish strings → i18n keys via `t('key')`
- Files: SimulationBadge, PlayNav, DashboardHub, DeFiPortal, EconomyConfigBanner, TradingTerminal (i18n only), UserProfile (i18n only), goalchainClient

### Acceptance Criteria
1. `en.json` has 100% parity with `es.json` keys
2. Zero hardcoded Spanish strings in components (all via `t('key')`)
3. Language toggle works (LanguageSwitcher component)
4. `npm run build` && `npm run lint` pass
5. Manual QA: switch language → all UI updates

### Branch
`exp/opencode-issue-734-i18n-v2` (already pushed)

### Draft PR
#768 — OA draft: issue #734 i18n

### Verification
```bash
cd goalchain_webapp && npm run build && npm run lint
# Manual: open dev server, toggle language, verify all screens
```

### Priority
P0 — **Blocks paid acquisition campaigns**

---

## Implementation Plan

### Phase 1: Audit & Collect All Hardcoded Strings
Identify every hardcoded Spanish string in the target components.

### Phase 2: Add Translation Keys
- Update `translations.ts` with new `TranslationKeys`
- Update `en.json` with English translations
- Update `es.json` with Spanish translations (audit for completeness)

### Phase 3: Refactor Components
- SimulationBadge.tsx
- PlayNav.tsx (including playNav.ts config)
- DashboardHub.tsx
- DeFiPortal.tsx
- EconomyConfigBanner.tsx
- TradingTerminal.tsx
- UserProfile.tsx
- goalchainClient.tsx (error messages)

### Phase 4: Verify Build & Lint
Run `npm run build && npm run lint` in goalchain_webapp

### Phase 5: Manual QA
Test language toggle on dev server

---

## Strings Inventory (to be populated during Phase 1)

### SimulationBadge
- `label: 'SIMULACIÓN'`
- `title: 'Esta sección no ejecuta transacciones on-chain. Solo demostración visual.'`

### PlayNav / playNav.ts
- `aria-label: 'Navegación principal'`
- Brand: 'GoalChain Play'
- Group labels: 'Jugar', 'Explorar', 'Recursos', 'Cuenta'
- Dropdown button: 'Docs & guías ▾'
- User nav default: '✨ Crear cuenta'
- Nav items from PLAY_SECTIONS: 'Inicio', 'Estadio', 'DeFi Terminal', 'Mi Club', 'Manuales y Guías'
- Nav items from EXPLORE_SECTIONS: 'Sobre', 'Mini-Juego', 'Colección', 'Manager', 'Estadios', 'Fixture', 'Roadmap', 'Economía', 'Social'
- RESOURCE_LINKS: 'Pitch & Motivación', 'Mega Guía v2', 'Mega Guía v1', 'Colaboraciones', 'Legal'

### DashboardHub
- Hero title: 'GoalChain Alpha Dashboard'
- Hero subtitle: 'Protocolo SportsFi v2.0 — World Cup 2026. Cliente transaccional en devnet.'
- SECTION_BLURBS: 8 strings
- CTA: 'Abrir →'

### DeFiPortal
- Badge: 'DEFI PORTAL'
- Title: 'Terminal Financiera'
- Honesty note: 'Demostración visual — sin transacciones on-chain hasta post-Mundial 2026.'
- Subtitle: 'Maximiza el rendimiento de tu club con arbitraje inteligente, vaults autónomas y liquidez automatizada.'
- Tab labels: '💱 Vibe Swap & Trading', '🏦 Swarm Yield Vaults'
- Tab descriptions: 'Negocia tokens y activa vibe bots', 'Estrategias de liquidez con agentes autónomos'
- Loading: 'Cargando terminal...', 'Cargando vaults...'

### EconomyConfigBanner
- Title: 'Economía canónica'
- Version prefix: 'versión'
- Drift detected: '⚠️ Drift detectado vs on-chain'
- Aligned: '✓ Alineada con API'
- Error: 'No se pudo cargar la economía canónica desde la API.'
- Drift reasons (3 strings)

### TradingTerminal (major - many strings)
- Title: 'Drift Derivatives Terminal'
- Subtitle: 'Especula sobre el rendimiento de las selecciones con apalancamiento usando oráculos de Drift y AI Vibe trading.'
- Tabs: '🎮 Manual', '🤖 Vibe Bots'
- Manual tab: 'Seleccionar Par', 'Dirección de Posición', 'Long (Comprar)', 'Short (Vender)', 'Apalancamiento', 'Ejecutar Posición {position}'
- Chart: 'Rendimiento Real-Time', 'ORACLE INDICE', 'LIVELINK', 'MOCK FEED (SECURE DRIFT PIPELINE)'
- Vibe tab: 'Sentimiento del Mercado (Helius Feed)', 'HYPE', 'PÁNICO', 'NEUTRAL'
- Bot switches: '🐂 El Toro Sentimental', 'Opera LONG con Hype (>65%)', '🐻 El Oso Analítico', 'Opera SHORT con Pánico (<35%)'
- Status: 'Bal:', 'Profit:', 'LONG Activo', 'SHORT Activo', 'Idle'
- Ledger: '🤖 Ledger de Transacciones (Vibe-Bots)', 'Esperando señales de sentimiento en el mercado...'
- Pair options: 'Argentina (ARG-PERP)', 'Francia (FRA-PERP)', 'España (ESP-PERP)'
- Event messages (toast/dispatch): Various Spanish strings

### UserProfile (major - many strings)
- Hero: 'Desde {joinedDate}'
- Tabs: '📋 Overview', '🃏 NFTs', '⚡ Actividad', '🌍 Ecosistema'
- Overview cards: 'Balance actual', 'Performance', 'Operaciones'
- Stats bar: 'Balance', 'Win Rate', 'Total Bets', 'NFTs', 'Volume', 'Upgrades'
- NFT tab: 'Nivel {level}', 'Sin NFT'
- Activity: 'Cobradas', 'Abiertas'
- Ecosystem: 'Jugadores activos', 'Volumen total', 'Partidos jugados', 'Top Manager'
- Share note: '🔗 Compartí tu perfil:'
- Rank badges: 'Gold', 'Silver', 'Bronze', 'Platinum'
- Activity types: 'BET', 'NFT', 'UPGRADE'
- XP: 'XP:', 'Próximo nivel:'
- Wallet display format

### goalchainClient.ts (error messages)
- 'Read-only wallet cannot sign transactions.'
- 'No se pudo resolver el token mint desde GlobalConfig.'
- 'Wallet no disponible para firmar transacciones.'
- 'Monto inválido. Usa formato numérico, ej: 1.5'
- 'El monto debe ser mayor a 0.'

---

## Risk Assessment
- **Low risk**: Pure UI string replacement, no logic changes
- **Medium risk**: Large number of strings in TradingTerminal and UserProfile — careful mapping needed
- **Mitigation**: Incremental commits per component, build verification after each

---

## Test Strategy
1. `cd goalchain_webapp && npm run build` — compiles TypeScript
2. `cd goalchain_webapp && npm run lint` — type checking
3. Manual: `npm run dev`, open browser, toggle EN/ES, verify all screens

---

## Rollback
Git revert on branch `exp/opencode-issue-734-i18n-v2`