# GOALCHAIN - DYNAMIC YIELD & REAL-WORLD ORACLE ENGINE

Este documento asienta oficialmente las mecánicas de composabilidad y economía viva del protocolo GoalChain, conectando el rendimiento del fútbol en la vida real (Mundial 2026) con la emisión del token $GCH en Solana.

## 1. FÓRMULA MAESTRA DE EMISIÓN DE THE VAULT
El contrato inteligente de Staking NO guarda el multiplicador en el jugador para proteger el mercado secundario. La emisión diaria se calcula dinámicamente:

`EMISIÓN_DIARIA_GCH = (Player_Base_Yield) × (Manager_Salary_Boost) × (Stadium_Multiplier)`

### Variables:
*   **Player_Base_Yield**: Sueldo variable del jugador (determinado por su rareza y alterado en vivo por el Oráculo Deportivo).
*   **Manager_Salary_Boost**: Atributo estático del NFT del Manager (ej: Level 12 "Infinity Elite" otorga 1.15x).
*   **Stadium_Multiplier**: Atributo estático del NFT del Estadio equipado (ej: Estadio "Mythic Lunar" otorga 1.10x).

---

## 2. LA TABLA DE PAGOS POR ACCIÓN (PAY-PER-ACTION TABLE)
El Oráculo (Pyth/Switchboard) alimenta al Smart Contract en vivo durante los partidos. Si sucede una acción, el contrato ejecuta **Airdrops Instantáneos (Bonos)** y modifica permanentemente el **Sueldo Base** del jugador.

| Acción en el Mundial 2026 | Impacto: Instant Airdrop (Bono) | Impacto: Sueldo Base (Yield) |
| :--- | :--- | :--- |
| ⚽ **Gol Marcado** | +50 $GCH | +10% Yield Rate |
| 🎯 **Asistencia** | +25 $GCH | +5% Yield Rate |
| 🧤 **Penal Atajado (Arqueros)** | +75 $GCH | +12% Yield Rate |
| 🛡️ **Valla Invicta (Clean Sheet)** | +20 $GCH | +5% Yield Rate |
| 🏆 **MVP del Partido** | +100 $GCH | +15% Yield Rate |

---

## 3. SISTEMA DE PENALIZACIONES (THE SLASHING SYSTEM)
La emoción del juego radica en el riesgo. El bajo rendimiento castiga el bolsillo del Manager, forzando un mercado secundario hiper-activo y emocional durante los partidos.

| Acción Negativa | Penalización en Vivo |
| :--- | :--- |
| 🟨 **Tarjeta Amarilla** | -2% Yield Rate |
| 🟥 **Tarjeta Roja** | **SLASH: -20% Yield Rate** + Stamina a 0 |
| 🤕 **Lesión Grave (Sustituido)** | **CONGELADO**: Emisión Pausada hasta recuperación. |
| ☠️ **ELIMINACIÓN DEL PAÍS** | **DEATH PLEDGE**: El sueldo cae a 0 $GCH. El NFT queda marcado como "Eliminado". Ya no produce tokens, se convierte solo en un coleccionable histórico. |

---

## 4. SISTEMA DE ESTAMINA Y ENERGÍA (LOW BATTERY)
Para evitar el "Staking y abandono" (Passive hold), los jugadores se cansan.
*   **Stamina Max**: 100
*   **Costo por Partido Real**: -30 Stamina
*   **Decadencia Diaria**: -5 Stamina
*   **Efecto "Low Energy"**: Si la Stamina cae por debajo de 30, el jugador entra en estado de fatiga. Su emisión de Yield se reduce un 50% y la **Capa Visual (layer-fx)** del NFT en la Galería 3D parpadea en rojo con un ícono de "Batería Baja".
*   **Recuperación**: El Manager DEBE gastar/quemar $GCH en pociones o "Días de Descanso" en The Academy para recargar la estamina al 100%. Esto crea la principal **fuerza deflacionaria (Token Sink)** del ecosistema.
