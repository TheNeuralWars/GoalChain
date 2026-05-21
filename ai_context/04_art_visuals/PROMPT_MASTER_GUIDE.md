# 📸 GoalChain: Master Image Generation Guide (L2 Player Layer)

Este documento explica la arquitectura del campo `prompt` que ya está pre-calculado en los archivos JSON de GoalChain. Grok **NO DEBE** intentar reconstruir estos prompts, solo debe ejecutarlos al pie de la letra.

## 🎯 Objetivo: Realismo Fotográfico y Aislamiento Absoluto
El estilo es **Fotografía Deportiva Profesional** de cuerpo completo, aislada perfectamente para fotomontaje en el Motor 3D de GoalChain.

## ⚠️ Regla de Oro: El Método de "Afirmación de Vacío" (Ya inyectado en el JSON)
Para aislar al jugador y evitar logos con derechos de autor, nuestros prompts pre-calculados utilizan afirmaciones de vacío absoluto:
1. **La Camiseta (Kit)**: *"wearing a completely blank, plain solid-colored athletic jersey. The chest of the jersey is smooth, solid, and completely plain, showing only pure, solid, clean fabric with zero markings, symbols, or graphics"*.
2. **El Fondo (Aislamiento)**: *"shot on a seamless, FLAT SOLID #FFFFFF WHITE BACKGROUND. The floor is a purely blank, solid white plane, perfectly uniform, seamless, and flat"*. 

## 🚫 Restricciones Críticas para la IA Generativa (FLUX/Grok)
- **CERO BÚSQUEDAS WEB**: La IA tiene PROHIBIDO buscar información de los jugadores en la web al momento de generar. Toda la biometría correcta ya está escrita en el prompt exacto del JSON. Buscar en la web causará la mezcla y alucinación de IDs.
- **PROHIBIDO MODIFICAR EL PROMPT**: La IA debe hacer *copy-paste literal* del campo `prompt` de los archivos JSON. Inventar o alterar descripciones faciales arruinará la fidelidad del jugador.
- **CERO CARICATURAS**: Estilo fotográfico real de alta velocidad sync (HSS).
