# 📊 GoalChain Data Oracle Protocol

Define cómo se capturan, procesan y mapean las estadísticas del mundo real a los atributos del NFT.

## 📡 Fuentes de Datos
- **Primaria:** APIs de estadísticas deportivas (Opta, Sportradar o scraping de fuentes oficiales).
- **Frecuencia:** Actualización tras cada jornada de competición (Mundial 2026).

## 🔢 Mapeo de Atributos (12 Slots)
Cada carta tiene 12 contenedores de stats definidos en el Marco V14.0:
1. **PAC** (Pace)
2. **SHO** (Shooting)
3. **PAS** (Passing)
4. **DRI** (Dribbling)
5. **DEF** (Defending)
6. **PHY** (Physical)
7. **VIT** (Vision/Intelligence)
8. **TEC** (Technical Skill)
9. **MEN** (Mental Strength)
10. **POS** (Positioning)
11. **GKP** (Goalkeeping - if applicable)
12. **OVR** (Overall Rating)

## 🔄 Proceso de Actualización
1. El script `oracle_fetcher.py` extrae los datos.
2. Los valores se normalizan en una escala de 1-99.
3. Se genera un nuevo `metadata.json` para el cNFT en Solana.
4. La DApp refresca la vista del usuario.
