# GOALCHAIN - TOKENOMICS MASTER PLAN
**"El Equilibrio Perfecto entre Rendimiento y Deflación"**

Este documento define la estructura macroeconómica del token $GCH, garantizando su valor a largo plazo, protegiendo a los inversores de la hiperinflación y generando una presión de compra constante en los exchanges (DEX).

---

## PILAR 1: EL DILEMA DEL SUPPLY (OFERTA)
**Modelo Elegido:** Inflación Dinámica Continua (Supply Infinito) + Equilibrio de Quema.
*   **Suministro Máximo Absoluto:** `Sin Límite` (Infinite Supply).
*   **Razón:** Un token inflacionario garantiza que el juego siempre pueda recompensar a los jugadores a lo largo de los años. Si hubiera un límite, el juego moriría al agotarse. La clave matemática aquí es el **Equilibrio**: la emisión constante de salarios es contrarrestada y anulada por una quema constante y agresiva (Sinks) y la Recompra Continua (Buybacks), manteniendo el precio del token estable o al alza de forma orgánica.
*   **Emisión:** Los tokens no existen en el mercado el día 1. Solo "The Vault" tiene permiso para imprimirlos gradualmente *exclusivamente* cuando los jugadores reclaman el sueldo de sus NFTs, o cuando se destina el impuesto al Architect Pool.

---

## PILAR 2: SÚPER "TOKEN SINKS" (MECANISMOS DE QUEMA)
Para evitar que los usuarios simplemente acumulen y vendan (dumpeen) el token, hemos diseñado mecanismos donde gastar $GCH es la única forma de mantenerse competitivo. **El 100% del $GCH gastado dentro del juego se QUEMA (se destruye de la blockchain), reduciendo el Supply Total.**

1.  **Recuperación de Estamina (Low Battery):** Los jugadores pierden 30% de estamina por partido. Los Managers deben comprar "Días de Descanso" quemando $GCH para no sufrir la penalidad del -50% de sueldo.
2.  **Upgrades del Manager (Level Up):** Subir la Licencia de Manager del Nivel 1 al Nivel 2 (para obtener un mayor *Salary Boost*) requiere quemar cantidades masivas de $GCH.
3.  **Cajas de Estadios (Lootboxes):** Mintar un nuevo Estadio NFT aleatorio (para obtener multiplicadores) cuesta $GCH. 
4.  **La Forja (V2):** Quemar 5 NFTs comunes + una cuota de $GCH para intentar forjar un NFT Raro.

---

## PILAR 3: LIQUIDITY POOL (RAYDIUM) Y PRECIO PISO
Para que el $GCH tenga un valor real en dólares (USDC/SOL) y los jugadores puedan vender sus ganancias, necesitamos liquidez profunda.
*   **El Respaldo del Mint:** El 50% de TODO el SOL recaudado durante la venta inicial de los NFTs del "Genesis Squad" se destinará **directamente a crear la Liquidity Pool (SOL/GCH) en Raydium**.
*   **Anti-Rug Pull:** Los tokens LP (Liquidity Provider) recibidos tras crear la pool serán **Quemados**. Esto garantiza matemáticamente a los inversores que los desarrolladores jamás podrán retirar la liquidez. El precio piso está sellado para siempre.

---

## PILAR 4: EL TESORO INTELIGENTE (PHI PROTOCOL & HYRE AGENT SPLIT)
¿Qué hacemos con el otro 50% del SOL recaudado en la venta de NFTs y preventa? No se queda inactivo. Está gestionado de forma 100% autónoma por agentes de Inteligencia Artificial con un split de 50/50:

1.  **Hyre Agent (50%):**
    *   **Función:** Monitorea y optimiza la liquidez en pools CLMM de Raydium y Orca en tiempo real.
    *   **Estrategia:** Detecta shocks de oferta inminentes (causados por las quemas masivas de pociones a 250 $GCH y compra de Jerseys) y reposiciona dinámicamente los rangos de precios de liquidez para maximizar las comisiones recolectadas y minimizar el impermanent loss.
2.  **Phi Protocol AI (50%):**
    *   **Función:** Ejecución de estrategias de bucles reflexivos y cobertura de derivados apalancados (Perpetuos).
    *   **Estrategia Alcista (Drift Protocol):** Utiliza el yield generado para abrir posiciones largas apalancadas (long GCH/SOL) en Drift Protocol en momentos donde Hyre detecta un shock de oferta inminente por quemas de estamina, maximizando el rally del token.
    *   **Estrategia de Cobertura Bajista (FlashTrade):** En fases de alta volatilidad macro o caídas de SOL, abre posiciones cortas (short SOL/USD a 5x) en FlashTrade para proteger el valor en dólares de la tesorería (delta-hedging), asegurando que el colateral del vault no se devalúe. Las ganancias netas de ambas estrategias se destinan a la recompra y quema circular de $GCH.
3.  **Mecánica de Recompra (Buyback & Burn):** Las ganancias generadas tanto por comisiones CLMM de Hyre como por perps de Phi Protocol se convierten a SOL/USDC y se usan para comprar $GCH del pool de liquidez abierto de Raydium, quemando de forma destructiva el 100% de los tokens adquiridos para reducir el circulante.
4.  **El Mega-Jackpot del Mundial:** Un pequeño porcentaje del yield acumulado por ambos agentes se deriva al "Pozo Acumulado" para los usuarios de la selección campeona.
