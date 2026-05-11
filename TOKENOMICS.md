# 📊 GoalChain Genesis Squad: Tokenomics & Emission Plan

Este documento define la escasez y el valor de la colección NFT de 1,248 jugadores.

## 1. Estructura de Rarezas y Suministro (Supply)

| Categoría | Jugadores | Copias (Supply) | Total NFTs | Rol en el Ecosistema |
|---|---|---|---|---|
| **Mythic** | 5 | 1 (1/1) | 5 | Máximo valor, acceso a eventos VIP del Mundial. |
| **Legendary** | 45 | 10 | 450 | Capitanes de selección. Bonus en el staking de $GCH. |
| **Epic** | 200 | 100 | 20,000 | Estrellas de élite. Multiplicador de recompensas en apuestas. |
| **Rare** | 400 | 500 | 200,000 | Jugadores clave. Acceso a ligas cerradas. |
| **Common** | 598 | 1,000 | 598,000 | La base del ecosistema. Necesarios para completar el álbum. |

**TOTAL SUPPLY:** 818,455 NFTs.

## 2. El Modelo de Packs (Drop System)

Los usuarios no compran jugadores directamente, compran **"GoalChain Packs"**:

- **Basic Pack (100 $GCH):** 3 cromos (Garantiza 2 Common, 1 Rare). 1% probabilidad Epic.
- **Elite Pack (500 $GCH):** 5 cromos (Garantiza 2 Rare, 2 Epic). 5% probabilidad Legendary.
- **Legends Pack (2,500 $GCH):** 7 cromos (Garantiza 3 Epic, 3 Legendary). 1% probabilidad Mythic.

## 3. Sistema de Reveal (Apertura)

1. **Minting:** El usuario recibe un NFT con el `image_uri` apuntando a `assets/images/packs/closed_pack.png`.
2. **Action:** En el portal de colaboradores/usuarios, aparece el botón **"OPEN PACK"**.
3. **Smart Contract:** Al interactuar, se quema (burn) el "ticket" de sobre y se asignan los metadatos finales del jugador basados en la probabilidad del contrato.
4. **Visual:** Animación de rotura de sobre y revelación del cromo con sonido de estadio.

## 4. Utilidad del Cromo (Utility)
- **Staking:** Tener el álbum de una selección completo genera dividendos diarios en $GCH.
- **Betting Boost:** Apostar por un equipo teniendo su NFT Legendary aumenta el payout en un 5%.

## 5. Mecanismos Deflacionarios (Burn & Blend)

Para mantener el valor de la colección y evitar la inflación de cromos comunes, se implementan las siguientes mecánicas:

### A. The Fusion (Trade-Up)
Los usuarios pueden fusionar cromos de menor categoría para obtener recompensas superiores:
- **Common to Rare:** 5 cromos Common -> 1 "Silver Pack" (Garantiza 1 Rare).
- **Rare to Epic:** 10 cromos Rare -> 1 "Gold Card" (Garantiza 1 Epic).

### B. National Emblems (Set Completion)
Al completar el set de 26 jugadores comunes de una nación, el usuario puede optar por:
1. **Hold:** Recibir dividendos por el set completo.
2. **Burn:** Quemar los 26 cromos para obtener el **"National Golden Emblem"**, un NFT único que otorga un +10% de Revenue Share en las apuestas de esa selección durante todo el Mundial.

### C. Player Training (Stat Boost)
Los cromos comunes pueden ser "sacrificados" para mejorar a las estrellas:
- **Burn 1 Common:** +1 punto en una estadística (Atk/Def/Hype) de un jugador de mayor rareza, siempre que coincida en posición.

## 6. Professional Contract Clauses (Matchday Revenue)

GoalChain simula la estructura salarial real del fútbol profesional. El poseedor del NFT actúa como el Agente del Jugador, cobrando sus primas y salarios.

### A. Sueldo Fijo por Partido (Base Salary)
Se paga por cada partido oficial disputado (mínimo 1 minuto):
- **Tier S (Mythic):** 5,000 $GCH
- **Tier A (Legendary):** 1,000 $GCH
- **Tier B (Epic):** 250 $GCH
- **Tier C (Rare/Common):** 50 $GCH

### B. Primas por Desempeño (Variable Bonuses)
- **Goles y Asistencias (Non-Penalty):** 
    - Gol: +100 $GCH / Asistencia: +50 $GCH. 
    - *Cláusula Especial:* Los goles de penalti no computan para el bono de hito por cada 5 goles.
- **Titularidad y Minutos:**
    - **Bono Starter:** +25% del sueldo base si sale en el XI inicial.
    - **Milestone 5:** Al completar 5 partidos como titular, se otorga un bono único de 2,000 $GCH.

### C. Rendimiento Posicional (Clean Sheets)
Exclusivo para Porteros (GK) y Defensas (DEF):
- **Portería a Cero (Victoria):** +200 $GCH.
- **Portería a Cero (Empate):** +100 $GCH.
- *Nota:* Si el equipo pierde el partido, el bono de portería a cero se anula independientemente del desempeño individual.

### D. Gestión de Contrato
Las ganancias se acumulan en la "Billetera del Jugador" dentro de la web y pueden ser reclamadas (claim) al finalizar cada fase del Mundial.
