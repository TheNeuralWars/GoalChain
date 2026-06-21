# Proceso de Unificación de Jerseys y Composición de Logos (Piloto v5)

Este documento resume las tareas realizadas, las pruebas técnicas ejecutadas con la API de Grok, los resultados obtenidos y la ruta para el objetivo final del proyecto.

---

## 🛠️ Resumen de Tareas Realizadas

1. **Restauración del Likeness Original (v4)**:
   - Se restauró la galería de pilotos de Argentina (IDs 1-11) en [docs/assets/img/pilot_v5/](file:///Users/NicoPez/GoalChain/docs/assets/img/pilot_v5/) a su estado original v4 para asegurar que los retratos de los personajes (rostros, expresiones y caricatura de Messi) mantengan su fidelidad perfecta y no se alteren en la web.
   
2. **Localización de Recursos en el Repositorio**:
   - Confirmamos que todas las referencias necesarias están descargadas localmente en el VPS y subidas al repositorio de GitHub:
     - **Jugadores Base**: [scratch/grok_batches/batch_01/refs/](file:///Users/NicoPez/GoalChain/scratch/grok_batches/batch_01/refs/) (ej. `001.jpg` para Messi).
     - **Camisetas Oficiales sin Logos**: [scratch/refs/jerseys/Argentina.png](file:///Users/NicoPez/GoalChain/scratch/refs/jerseys/Argentina.png) (Footy Headlines).
     - **Logo GoalChain**: [docs/assets/img/logo_3d_clean.png](file:///Users/NicoPez/GoalChain/docs/assets/img/logo_3d_clean.png).
     - **Logo Solana**: [docs/assets/img/solana_logo.png](file:///Users/NicoPez/GoalChain/docs/assets/img/solana_logo.png).

3. **Pruebas Técnicas con Grok (xAI API)**:
   - **Grok Directo (Edit/Generation)**: Se probó pasar las 4 imágenes de referencia descargadas como archivos (Base v4, Camiseta, Logo GCH y Logo SOL) en una sola llamada usando la API oficial.
     - *Resultado*: Grok cambia la cara del jugador (haciéndola una caricatura anime genérica) y deforma/distorsiona los logos al redibujarlos (efecto común en modelos de difusión).
   - **Flujo Híbrido Avanzado (Grok + Face Swap + PIL)**: Se programó una composición combinando el cambio de camiseta por IA y re-proyectando la cara/logos reales.
     - *Resultado*: Generó inconsistencias en la integración de sombras y bordes del rostro.
   - **Composición 2D Directa (Blending)**: Se estructuró un método para mezclar la camiseta generada por Grok sobre el retrato original de Messi v4 en 2D y estampar los logos vectoriales encima.

---

## 🎯 Objetivo Final del Proyecto

El objetivo es aplicar de manera unificada a los **528 jugadores** del juego un procesamiento automatizado que logre las siguientes metas estéticas y legales:

1. **Camisetas Sincronizadas y Limpias**:
   - Cada selección debe vestir su camiseta correspondiente al Mundial 2026 (siguiendo el diseño de Footy Headlines como referencia), **sin marcas comerciales ni logos de federaciones (ej. remover el escudo de la AFA)** para evitar infracciones de copyright o propiedad intelectual.
   
2. **Identidad e Integridad del Personaje**:
   - Conservar al 100% las caras, peinados, expresiones y poses originales (caricaturas v4) de los 528 jugadores generados.
   
3. **Logos Oficiales y Números**:
   - Estampar de manera limpia, transparente y alineada el sponsor de **GoalChain** en el pecho, el logo de **Solana** en la manga izquierda y el **número oficial de camiseta** del jugador.

---

## 🚀 Próximos Pasos (Pendientes para la Siguiente Sesión)

* Diseñar una técnica de máscara de precisión para aislar la camiseta antes de enviarla a Grok, evitando que la IA reciba la cara del jugador y previniendo cualquier alteración del rostro.
* Integrar la camiseta limpia generada por Grok con el logo de GoalChain (transparente, sin caja negra) y el logo de Solana oficial directamente sobre la base v4 intacta.
* Escalar el pipeline probado a los 528 jugadores utilizando automatización por lotes (batches).
