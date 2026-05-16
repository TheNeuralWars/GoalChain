# 🧪 SKILL: Data Alchemist & Rarity Balancer (v1.0)

## 🎯 Objective
Transform raw football data (Market Value, Real-world performance, Social Media presence) into balanced, high-utility game stats for the GoalChain Genesis Squad.

## 📏 Rarity Distribution (Hard Caps)
The 528 players MUST be distributed exactly according to these caps:
1. **Mythic (10)**: World Icons and >€150M MV players.
2. **Legendary (50)**: Elite stars and National Captains.
3. **Epic (150)**: Champions League regulars and >€40M MV players.
4. **Rare (318)**: Professional World Cup level players.

## ⚔️ Stats Logic (Atk, Def, Hype)

### 1. Positional Weighting
- **FWD (Forward)**: 
  - ATK: 80 - 99 (Based on goals/assists/SoFIFA Rating)
  - DEF: 10 - 40 (Low priority)
- **MID (Midfield)**:
  - ATK: 60 - 85
  - DEF: 60 - 85
- **DEF (Defender) / GK (Goalkeeper)**:
  - ATK: 10 - 45
  - DEF: 80 - 99

### 2. The Hype Metric (0 - 99)
Calculate HYPE based on:
- Social Media Presence (Instagram/X followers).
- Market Value (MV).
- "Star Power" (Real-world brand deals).

## 💰 Yield Calculation (Economic Layer)
Assign a `match_salary_gch` based on:
- **Mythic**: 5,000 $GCH
- **Legendary**: 1,000 $GCH
- **Epic**: 250 $GCH
- **Rare**: 50 $GCH

## 🔄 Audit Workflow
1. **Identify**: Fetch current player Position and real-world status.
2. **Categorize**: Assign Rarity based on the Hard Caps above.
3. **Forge**: Generate Atk/Def stats using Positional Weighting.
4. **Quantify**: Set HYPE based on fame and market value.
5. **Verify**: Ensure the total count is exactly 528 and rarity caps are NOT exceeded.

---
*Status: Active. Goal: Create the most balanced football economy on Solana.* 🏟️✨📈
