# OA Proposal: Local Issue #10 — [OPENCODE] [DRAFT] World Cup 2026 — Confirmed Starting XI + Full Player Data Overhaul

**Worker:** phi (partition 2)
**Owner:** opencode
**Priority:** P0
**Mode:** Normal mode: changes stay local until merge trigger.

## Issue Body
## Objective
# FCC Task: World Cup 2026 — Confirmed Starting XI + Full Player Data Overhaul

**Priority: P0** — Massive research + data restructuring task. Follow `gstack plan-eng-review` before coding. Apply `frontend-design` skill for any UI touchpoints.

---

## Objective

Replace the current `docs/assets/data/players.json` (528 players across 48 countries × 11) with **verified, confirmed 2026 World Cup starting XIs** — 11 starters per qualified nation — with **complete physical attributes, real market values, trait assignments, parody clubs, and GoalChain lore narratives**.

**Source of truth:** Official FIFA 2026 World Cup squad announcements + confirmed starting lineups from opening matches / official team sheets.

---

## Scope

| Metric | Current | Target |
|--------|---------|--------|
| Countries | 48 | 48 (only qualified nations) |
| Players per country | 11 | 11 (confirmed starters only) |
| Total players | 528 | 528 |
| Physical attributes | Partial / inconsistent | 100% complete per schema |
| `match_salary_gch` | Placeholder | Real market value (€) → GCH mapping |
| `traits` | Sparse | Full taxonomy assignment |
| `meta.parody_club` | Inconsistent | Consistent per real club |
| `meta.narrative` | Generic | GoalChain lore + player lore blend |

---

## Research Methodology (MANDATORY — do not hallucinate)

### 1. Confirm Qualified Nations (48)
Use **FIFA.com**, **official confederation sites** (UEFA, CONMEBOL, CONCACAF, CAF, AFC, OFC) to list the exact 48 qualified teams.  
**Do not assume** — verify each.

### 2. For Each Nation: Identify the 11 Confirmed Starters
- **Primary source:** Official FIFA squad list (26-man) + matchday lineups from World Cup 2026 openers
- **Secondary:** Reputable beat reporters (Fabrizio Romano, The Athletic, Marca, Olé, L'Équipe, ESPN, Globo Esporte)
- **Tertiary:** Club official sites / national federation announcements
- **Formation:** Use the coach's **preferred formation** (4-3-3, 4-2-3-1, 3-5-2, etc.) — pick the 11 most likely starters based on:
  - Recent qualifiers / friendlies
  - Coach's trusted core
  - Injury status (exclude injured players)
  - Tactical fit

### 3. Physical Attributes — Deep Research Per Player
For **every single player**, fill **ALL** fields in `physical` — no empty arrays, no "unknown":

| Field | Research Method |
|-------|-----------------|
| `dob` | Wikipedia / Transfermarkt / FBref |
| `h` / `w` | Official FIFA profile / club site |
| `hair_color`, `hairstyle` | Recent match photos (Getty, Reuters, club media) — describe precisely: "mid-skin burst fade with textured fringe", "shoulder-length loose curls", "clean shaven buzz cut" |
| `facial_hair` | "clean shaven", "light stubble", "full beard with gray at chin", "goatee" — be specific |
| `face_structure` | "oval face, high cheekbones, straight nose", "square jaw, heavy brow", "round face, soft jawline" |
| `skin_tone` | Use **Fitzpatrick-adjacent descriptors**: "fair with cool undertones", "light olive, tans easily", "medium brown with warm undertones", "deep brown", "fair with freckles" |
| `eye_color` | "dark brown", "light brown/hazel", "blue", "green" — verify via close-up photos |
| `tattoos` | **Exhaustive list** — search "[player] tattoos" + recent shirtless/short-sleeve photos. Format: `"left forearm: lion", "right sleeve: geometric", "chest: family script"` — if none: `["none visible"]` |
| `distinctive_features` | 3-5 unique identifiers: "gap in front teeth", "perpetual intense gaze", "wears headband", "celebration: finger to temple", "knee brace on right leg" |
| `build_type` | Concise: "lean muscular, 1.70m, low center of gravity", "tall goalkeeper frame, 1.95m, broad shoulders", "compact strong, 1.75m, explosive acceleration" |
| `t` (composite text) | Single descriptive paragraph combining all above — used for visual generation |

### 4. Market Value → `match_salary_gch` Mapping
**Source:** Transfermarkt (current market value in €) as of **June 2026**.  
**Formula:** `match_salary_gch = floor(market_value_eur / 10000)` with caps:

| Market Value (€) | `match_salary_gch` | Rarity Hint |
|------------------|--------------------|-------------|
| ≥ 100M | 10,000 | mythic |
| 80-99M | 8,000-9,999 | mythic/legendary |
| 60-79M | 6,000-7,999 | legendary |
| 40-59M | 4,000-5,999 | legendary/epic |
| 25-39M | 2,500-3,999 | epic |
| 15-24M | 1,500-2,499 | epic/rare |
| 8-14M | 800-1,499 | rare |
| 4-7M | 400-799 | rare |
| < 4M | 100-399 | rare/common |

**Hard caps:** Max 10,000 (Messi/Ronaldo tier), Min 50 (lowest). Round to nearest 50.

### 5. Trait Taxonomy — Assign 1-4 Per Player
**Mandatory traits pool** (expand only if justified):

**Attacking:**
- `GOAT Aura` (reserved: Messi, Ronaldo, maybe 1-2 others)
- `Playmaker Maestro` / `Playmaker` / `Visionary`
- `Dribbling God` / `Elite Dribbler`
- `Goal Hunter` / `Clinical Finisher` / `Poacher`
- `Aerial Threat` / `Target Man`
- `Long-Range Sniper`
- `Pressing Machine` / `High-Press Trigger`

**Midfield:**
- `Box-to-Box Engine`
- `Deep-Lying Architect` / `Regista`
- `Interceptions King` / `Ball Winner`
- `Technical Maestro` / `Silky Touch`
- `Transition Trigger`

**Defensive:**
- `Iron Wall` / `Physical Powerhouse`
- `Recovery Pace` / `Speed Demon`
- `Anticipation Master` / `Reading the Game`
- `Set-Piece General`
- `Tackling Artist`

**Goalkeeper:**
- `Penalty Specialist` / `Shootout King`
- `Shot Stopper` / `Reflex Cat`
- `Sweeper Keeper` / `Ball-Playing GK`
- `Commanding Presence` / `Aerial Dominance`
- `Mind Games Master`

**Meta/Intangible:**
- `Leader` / `Captain Material`
- `Big Game Player` / `Clutch Gene`
- `Mentality Monster`
- `Versatility` (plays 3+ positions)

**Assignment rules:**
- Starters get 2-4 traits; superstars get 3-4
- No duplicate traits on same player
- Traits must match position + playstyle (verify via FBref/StatsBomb playstyle tags)

### 6. Parody Club System — **Consistency is Critical**

**Rule:** Every real club → **ONE unique parody name** used by ALL players from that club.

**Naming convention:** `[City/Region] [Mascot/Color] [Web3 Suffix]`

| Real Club | Parody Club | Suffix Pool |
|-----------|-------------|-------------|
| Real Madrid | Madrid Mattress DAO | DAO, Nodes, Core, Logic, Hive, Kop, Devils, Logic |
| FC Barcelona | Barcelona Blaugrana Chain | Chain, Nodes, DAO, Protocol |
| Manchester City | Manchester Sky Blocks | Blocks, Nodes, Core, DAO |
| Manchester United | Manchester Red Devils DAO | Devils DAO, Red Core, United Nodes |
| Liverpool | Liverpool Crimson Kop | Kop, Chain, Nodes |
| Arsenal | London Cannon Core | Core, Nodes, DAO |
| Chelsea | London Blue Nodes | Blue Nodes, Core, Blocks |
| Tottenham | London Cockerel Nodes | Cockerel Nodes, Spurs DAO |
| Bayern Munich | Munich Bavarian Blocks | Blocks, Core, DAO |
| Borussia Dortmund | Dortmund Yellow Hive | Hive, Nodes, DAO |
| PSG | Paris Neon Protocol | Protocol, Nodes, Core |
| Inter Milan | Milan Nerazzurri Logic | Logic, Nodes, DAO |
| AC Milan | Milan Rossoneri Chain | Chain, Nodes, DAO |
| Juventus | Turin Zebra Nodes | Zebra Nodes, Core, DAO |
| Napoli | Naples Partenopei DAO | DAO, Nodes, Core |
| Atlético Madrid | Madrid Colchoneros Logic | Logic, Nodes, DAO |
| Bayer Leverkusen | Leverkusen Werkself Core | Core, Nodes, DAO |
| RB Leipzig | Leipzig Red Bull Nodes | Nodes, Core, DAO |
| Aston Villa | Birmingham Lion Core | Lion Core, Nodes, DAO |
| Newcastle | Newcastle Magpie DAO | Magpie DAO, Nodes, Core |
| Brighton | Brighton Seagull Protocol | Protocol, Nodes, Core |
| West Ham | London Hammer Nodes | Hammer Nodes, Core, DAO |
| (Add all other clubs represented in WC squads) | | |

**Process:**
1. Build a **lookup table**: `real_club → parody_club`
2. Apply consistently — if 3 Argentina players play for Real Madrid, all 3 get `"Madrid Mattress DAO"`
3. National team players without current club (free agents) → `"Free Agent Nomads"`

### 7. `meta` Object — Required Fields

```json
"meta": {
  "parody_club": "<from lookup table>",
  "visual_effect": "<rarity-based + player-specific>",
  "narrative": "<2-3 sentences blending player lore + GoalChain lore>"
}
```

**Visual effects by rarity:**
- `mythic`: `"Cosmic Aura & Golden Supernova"`, `"Quantum Rift & Ethereal Gold"`
- `legendary`: `"Holographic Glitch & Silver Spark"`, `"Neon Prism & Plasma Trails"`
- `epic`: `"Electric Neon Pulse"`, `"Cyber Arc & Voltage Flare"`
- `rare`: `"Subtle Cyber Outline"`, `"Digital Shimmer & Grid Lines"`

**Narrative template:**
> "A world-class {POS} verified as a {RARITY} asset. Known globally for being a {TRAIT_1}, {TRAIT_2}, this player {player-specific lore hook} — making them a {GoalChain role} in the ecosystem."

**Example (Enzo Ether):**
> "A world-class MID verified as a legendary asset. Known globally for being a Playmaker, Visionary, this player orchestrates the midfield like a decentralized consensus protocol — distributing value across the pitch with surgical precision, making them a cornerstone of the GoalChain ecosystem."

---

## Technical Requirements

### Input File
`docs/assets/data/players.json` — **read-only reference** for schema only.

### Output File
**Overwrite** `docs/assets/data/players.json` with new array of 528 objects.

### ID Assignment
- Keep sequential `id: 1..528`
- Group by country (alphabetical by country name in English)
- Within country: starters in formation order (GK → DEF → MID → FWD)

### Country Names — English Standard
Use FIFA English names: `Argentina`, `France`, `England`, `Brazil`, `Spain`, `Germany`, `Portugal`, `Netherlands`, `United States`, `Mexico`, `Canada`, `Morocco`, `Japan`, `Senegal`, `South Korea`, `Australia`, `Saudi Arabia`, `Denmark`, `Switzerland`, `Serbia`, `Poland`, `Ukraine`, `Turkey`, `Scotland`, `Hungary`, `Austria`, `Colombia`, `Ecuador`, `Paraguay`, `Venezuela`, `Chile`, `Peru`, `Algeria`, `Ghana`, `Nigeria`, `Cameroon`, `Ivory Coast`, `Tunisia`, `Costa Rica`, `Panama`, `Iran`, `Iraq`, `Qatar`, `New Zealand`, `Egypt`, `South Africa`, `Mali`, `Burkina Faso`

### Rarity Assignment (by market value + status)
| Tier | Criteria | Count Target |
|------|----------|--------------|
| `mythic` | Global icons, >100M value, GOAT-tier | 10 (2 per confederation max) |
| `legendary` | World-class starters, 50-100M | 50 |
| `epic` | Confirmed starters, 20-50M | 150 |
| `rare` | Starters <20M, role players | 318 |

### Position Codes
`GK`, `DEF`, `MID`, `FWD` — match formation slots.

### `bg_type` Mapping
`mythic` → `BG-MYT`, `legendary` → `BG-LEG`, `epic` → `BG-EPI`, `rare` → `BG-RAR`

### `stats` Calibration (0-100)
| Position | ATK Range | DEF Range | HYPE Range |
|----------|-----------|-----------|------------|
| GK | 20-45 | 70-95 | 60-95 |
| DEF | 10-50 | 55-90 | 50-85 |
| MID | 45-95 | 45-95 | 60-95 |
| FWD | 55-98 | 10-45 | 65-99 |

Calibrate to player's actual profile (FBref percentiles).

---

## Verification Commands (RUN BEFORE SUBMITTING)

```bash
# 1. Count validation
python3 -c "
import json
with open('docs/assets/data/players.json') as f: d=json.load(f)
print(f'Total: {len(d)}')
from collections import Counter
c=Counter(p['country'] for p in d)
print('Countries:', len(c))
for k,v in sorted(c.items()): print(f'  {k}: {v}')
assert all(v==11 for v in c.values()), 'Not all 11!'
assert len(d)==528, 'Not 528!'
print('✅ Counts OK')
"

# 2. Schema validation
python3 -c "
import json
with open('docs/assets/data/players.json') as f: d=json.load(f)
required = ['id','name','country','rarity','bg_type','position','stats','real_name','physical','match_salary_gch','traits','meta']
phys_req = ['dob','h','w','t','hair_color','hairstyle','facial_hair','face_structure','skin_tone','eye_color','tattoos','distinctive_features','build_type']
meta_req = ['parody_club','visual_effect','narrative']
for i,p in enumerate(d):
    for r in required:
        assert r in p, f'Player {i} missing {r}'
    for pr in phys_req:
        assert pr in p['physical'], f'Player {i} physical missing {pr}'
    for mr in meta_req:
        assert mr in p['meta'], f'Player {i} meta missing {mr}'
    assert len(p['traits']) >= 1, f'Player {i} no traits'
    assert p['tattoos'] != [], f'Player {i} empty tattoos'
    assert p['distinctive_features'] != [], f'Player {i} empty distinctive_features'
print('✅ Schema OK')
"

# 3. Parody club consistency
python3 -c "
import json
with open('docs/assets/data/players.json') as f: d=json.load(f)
from collections import defaultdict
club_map = defaultdict(set)
for p in d:
    club_map[p['meta']['parody_club']].add(p['real_name'])
print('Parody clubs:', len(club_map))
for club, players in sorted(club_map.items()):
    if len(players) > 1:
        print(f'  {club}: {len(players)} players - {sorted(players)[:3]}...')
# Check no real club has multiple parody names
# (requires reverse mapping - add if you have real_club field)
print('✅ Parody check done')
"

# 4. ID continuity
python3 -c "
import json
with open('docs/assets/data/players.json') as f: d=json.load(f)
ids = [p['id'] for p in d]
assert ids == list(range(1, 529)), f'IDs broken: {ids[:10]}...{ids[-10:]}'
print('✅ IDs sequential 1-528')
"

# 5. Market value sanity
python3 -c "
import json
with open('docs/assets/data/players.json') as f: d=json.load(f)
salaries = [p['match_salary_gch'] for p in d]
print(f'Salary range: {min(salaries)} - {max(salaries)}')
print(f'Avg: {sum(salaries)/len(salaries):.0f}')
# Check no zeros
assert all(s >= 50 for s in salaries), 'Salary too low'
assert all(s <= 10000 for s in salaries), 'Salary too high'
print('✅ Salaries OK')
"
```

---

## Deliverables

1. **Updated `docs/assets/data/players.json`** — 528 complete, verified players
2. **Research log** — `docs/intake/wc2026-research-log.md` listing:
   - Source URL per country (official squad announcement)
   - Formation used + starter selection rationale
   - Market value source (Transfermarkt URL + date)
   - Physical attribute photo sources (Getty/Reuters/club media URLs)
3. **Parody club registry** — `docs/intake/parody-club-registry.json`:
   ```json
   {
     "Real Madrid": "Madrid Mattress DAO",
     "FC Barcelona": "Barcelona Blaugrana Chain",
     ...
   }
   ```

---

## Skill Hints

- **Research:** Use `web_search` + `web_extract` for official sources
- **Data processing:** Write Python scripts for validation/transform
- **Frontend-design skill** if any UI preview needed
- **Follow `gstack plan-eng-review`** — present plan before coding

---

## Estimated Effort

| Phase | Hours |
|-------|-------|
| Research (48 nations × sources) | 15-20 |
| Physical attribute deep-dive (528 × ~10 fields) | 20-30 |
| Market value mapping + salary calc | 3-5 |
| Trait assignment + narrative writing | 8-12 |
| Parody club registry + consistency pass | 3-5 |
| Validation + JSON assembly | 2-3 |
| **Total** | **50-75** |

**Assign to:** FCC `opencode` with `nvidia_nim/nvidia/nemotron-3-super-120b-a12b` (P0 tier)

---

## Acceptance Criteria

- [ ] All 528 players have **complete physical attributes** (no empty arrays, no "unknown")
- [ ] All 48 countries have **exactly 11 confirmed starters** (verified vs official FIFA squads)
- [ ] `match_salary_gch` reflects **real Transfermarkt June 2026 values** via formula
- [ ] Every player has **2-4 relevant traits** from taxonomy
- [ ] **Parody clubs consistent** — same real club = same parody name
- [ ] `meta.narrative` blends **player lore + GoalChain lore** (2-3 sentences)
- [ ] All **verification commands pass** without errors
- [ ] Research log + parody registry **saved to `docs/intake/`**

---

*P0 Task — No shortcuts. Research must be traceable to official sources. Hallucinated data = rejection.*

## Owner
opencode

## Priority
P0

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

## Workflow (Producer-Critic Pattern)
1. **Implementer** (opencode) creates PR on branch `exp/opencode-issue-XXX`
2. **Critic Agent** reviews PR automatically (read-only, no code changes)
3. Critic posts structured review: PASS/FAIL + findings
4. If FAIL: Implementer addresses findings, pushes updates
5. If PASS: Label `status:critic_pass` → Antigravity/Nico human review
6. Merge after human approval

## Required Output (Implementer)
- Proposed file list
- Risks/regressions + rollback
- Exact test commands
- **Structured plan JSON** as FIRST output (see below)

## Required First Output: Plan JSON
Before any code changes, output this JSON to stdout:
```json
{
  "goal": "Brief description of the objective",
  "issue_number": 123,
  "branch": "exp/opencode-issue-123",
  "steps": [
    {"action": "create vector/ dir", "files": ["src/vector/turbovec_store.py"], "depends_on": []},
    {"action": "implement player index", "files": ["src/vector/player_index.py"], "depends_on": ["create vector/ dir"]}
  ],
  "dependencies": ["turbovec pip package"],
  "risks": ["turbovec API changes", "embedding dim mismatch"],
  "verification": ["pip install turbovec", "python -m pytest tests/vector/", "index build <2s", "RAM <50MB"]
}
```

## Workflow
- One implementer only
- Branch naming:
  - cursor: `feat/*` or `fix/*`
  - antigravity: `exp/antigravity-*`
  - opencode: `exp/opencode-*`
  - grok: `exp/grok-*`
- Draft PR for Antigravity/Nico review — no direct merge to `main` unless `cambio urgente`
