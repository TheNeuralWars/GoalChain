# 🧬 Skill: GoalChain Data Architect & Verifier (v1.0)

## 🎯 Objetivo
Transformar el archivo `players.json` de GoalChain en una base de datos de fútbol de élite, verificando y actualizando la información de los 528 jugadores con datos reales, certeros y verificables de fuentes oficiales (Transfermarkt, FIFA Index, Soccerway, etc.).

## 🛠️ Protocolo de Actuación "Non-Stop"

### 1. Preparación del Entorno
*   **Fuente de Verdad**: Antes de editar, busca el campo `real_name` de cada jugador.
*   **Integridad del JSON**: No debes alterar los campos `id`, `name` (parodia), `country`, `rarity` ni `bg_type`.
*   **Iteración Obligatoria**: Debes procesar a los jugadores en bloques de 50 para mantener la memoria del contexto, pero **NO puedes dar por terminada la tarea hasta llegar al jugador #528**.

### 2. Parámetros de Investigación (Por Jugador)
Para cada uno de los 528 registros, debes investigar y sobreescribir:
*   **`real_name`**: Asegurar que sea el nombre completo oficial (ej: "Emiliano Martínez" en lugar de "Dibu").
*   **`position`**: Verificar la posición actual (GK, DEF, MID, FWD).
*   **`physical.dob`**: Fecha de nacimiento exacta (Formato: AAAA-MM-DD).
*   **`physical.h`**: Altura real en formato "1.XXm".
*   **`physical.w`**: Peso real actualizado en formato "XXkg".
*   **`physical.t`**: Descripción física precisa (Color de pelo, tipo de barba, tono de piel, complexión).

### 3. Reglas de Formateo
*   Usa siempre **Title Case** para los nombres reales.
*   Mantén las estadísticas (`stats`) balanceadas según la rareza original del jugador.
*   Si un jugador está retirado (ej: Messi en 2026), usa sus últimos datos oficiales conocidos.

## 🚦 Activación de la Tarea (Prompt para Grok)
> "Grok, activa la Skill 'GoalChain Data Architect'. Lee el archivo `ai_context/players.json` y comienza la fase de verificación profunda. Investiga los datos reales de los 528 jugadores. No te detengas, no resumas y no pidas confirmación entre bloques. Tu objetivo es devolverme el archivo `players.json` completo y corregido con 100% de precisión en alturas, pesos, posiciones y rasgos físicos. COMIENZA AHORA CON EL ID #1."

---
**Nota para el Usuario**: Al cargar esta Skill en Grok, asegúrate de que tenga acceso al archivo `players.json` que acabamos de subir.
