import json
from datetime import datetime

# Log the attempted post with error
log_entry = f"""## X (Twitter) Post - {datetime.utcnow().isoformat()}Z [FAILED]
- Type: player-spotlight
- Player: Trent Cross-Arnold
- Rarity: legendary
- Error: 402 Payment Required - Account has no credits for write API access
- Tweet content (251 chars):
🏴‍☠️ LEGENDARY SPOTLIGHT: Trent Cross-Arnold (Trent Alexander-Arnold)

⚔️ DEF 91 | ATK 42 | HYPE 88
📏 1.80m | ⚖️ 75kg | 🎂 25 yrs
💎 Trait: The Rock
🏟️ Turin Zebra Grid

Own the future of football. GoalChain Presale LIVE 🔗

#GoalChain #Web3Football #GCH

"""

with open('/data/apps/GoalChain/scratch/marketing_log.md', 'a') as f:
    f.write(log_entry)

print("✅ Logged failed attempt to marketing_log.md")
