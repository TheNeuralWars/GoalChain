# OA Proposal — Issue #374

## Title
[OPENCODE] [OPENCODE] Webapp: Premium visual overhaul - generate assets, backgrounds, animations, loading states

## Source
GitHub issue #374

## Objective
## Objective
## Objective
Generate all premium visual assets and apply them across the webapp for production-quality aesthetics.

## Scope
### Asset Generation (Image Generator prompts):
Execute image_generate for each asset, save to public/assets/generated/:

1. **hero-bg.png** (landscape) — "Dark futuristic soccer stadium at night, volumetric lighting, Solana green/cyan neon accent lines on turf, geometric holographic crowd silhouettes, 16:9 cinematic, unreal engine 5 render, 8k, premium game art style"
2. **portal-club-bg.png** (landscape) — "Glassmorphism UI background, dark mode, subtle grid lines, Solana green and purple gradient orbs floating, bokeh particles, 1920x400, premium dashboard aesthetic"
3. **portal-estadio-bg.png** (landscape) — Same style, stadium silhouette watermark
4. **portal-defi-bg.png** (landscape) — Same style, geometric charts/lines watermark
5. **card-frame-common.png** (square) — "Collectible card frame, slate border, soccer ball watermark center, transparent center for player art, 400x500"
6. **card-frame-rare.png** (square) — "Collectible card frame, blue glow border, rarity gem accents, soccer ball watermark, 400x500"
7. **card-frame-epic.png** (square) — "Collectible card frame, purple glow border, hexagonal pattern, 400x500"
8. **card-frame-legendary.png** (square) — "Collectible card frame, gold/amber glow border, ornate corners, 400x500"
9. **card-frame-mythic.png** (square) — "Collectible card frame, iridescent rainbow border, animated shimmer effect, 400x500"
10. **stadium-olympus.png** (landscape) — "Golden colosseum with light rings at top, mythic scale, smart turf, Solana green accents, isometric view, premium 3D render"
11. **stadium-kronos.png** (landscape) — "Carbon dome with quantum oracle rings, instant dividend distribution visual, cyan accents, isometric"
12. **stadium-titanium.png** (landscape) — "Cybernetic coliseum with titanium panels, cyan lights, high transfer volume visual, isometric"
13. **stadium-obsidian.png** (landscape) — "Obsidian arena with Solana Green LED contours, carbon turf, passive yield visual, isometric"
14. **stadium-aether.png** (landscape) — "Geodesic dome with electric cyan neon lights, high-speed oracle connectivity, isometric"
15. **avatar-eliza.png** (square, transparent) — "Futuristic female AI coach avatar, holographic tactical visor, soccer field hologram from eye, Solana green/cyan, confident, 512x512, transparent background"
16. **avatar-enzo.png** (square, transparent) — "Robot referee mascot, striped jersey, whistle antenna, glowing visor eyes, Solana green primary purple accent, friendly authoritative, 512x512, transparent background"
17. **icon-sentinel.png** (square, transparent) — "Shield with geometric hedge pattern, teal glow, minimal line art, 128x128"
18. **icon-arbitrageur.png** (square, transparent) — "Infinity scales balancing, purple glow, minimal line art, 128x128"
19. **icon-orchestrator.png** (square, transparent) — "Conductor baton with lightning, red glow, minimal line art, 128x128"
20. **empty-squad.png** (square, transparent) — "Soccer ball on grass, subtle shadow, 'Your squad awaits' mood, muted Solana colors, 300x300, transparent"
21. **empty-market.png** (square, transparent) — "Transfer document with soccer ball, 'Market loading' mood, 300x300"
22. **empty-bets.png** (square, transparent) — "Betting slip with soccer ball, 'No bets yet' mood, 300x300"
23. **empty-events.png** (square, transparent) — "Live feed icon, 'No live events' mood, 300x300"

### CSS Integration:
1. **src/styles/components/backgrounds.css** — Portal background classes using generated assets
2. **src/styles/components/empty-states.css** — Empty state classes with generated illustrations
3. **Update components** to use new assets:
   - Portal headers: background-image: url(/assets/generated/portal-*-bg.png)
   - NFTCard: rarity frame backgrounds
   - Stadium cards: stadium illustrations
   - AI Coach/Commentator: avatar images

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-374` and close draft PR.
