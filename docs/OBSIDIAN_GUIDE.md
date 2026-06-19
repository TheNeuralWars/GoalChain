# Guía de Integración: Obsidian + GBrain en GoalChain

Esta guía describe cómo utilizar **Obsidian** y **GBrain** de forma conjunta en tu entorno de desarrollo local (Mac / Windows Mini PC) para crear una base de conocimiento fluida y automatizada entre el desarrollador y los agentes de inteligencia artificial (Antigravity, Cursor y Hermes CEO).

---

## 1. Concepto: El Bucle de Conocimiento Unificado

Obsidian y GBrain comparten la misma raíz de datos: las carpetas [ai_context/](file:///Users/NicoPez/GoalChain/ai_context) y [docs/intake/](file:///Users/NicoPez/GoalChain/docs/intake).

```
   Nico (Humano)
        │
        ▼ (Edita notas visuales / diagramas / ideas)
 ┌──────────────┐
 │   Obsidian   │ ◄───┐ (Lectura en vivo de archivos Markdown)
 └──────┬───────┘     │
        │             │
        ▼             │
 ┌──────────────┐     │
 │  Repository  ├─────┼───► Agentes (Cursor / Antigravity)
 │ (Filesystem) │     │     (Leen código, crean intake y logs)
 └──────┬───────┘     │
        │             │
        ▼ (Indexa semánticamente con PGLite)
 ┌──────────────┐     │
 │    GBrain    ├─────┘
 │ (MCP Bridge) │ (Sirve embeddings a la IA)
 └──────────────┘
```

*   **Obsidian (Tu editor cerebral):** Editas los requerimientos, milestones, notas del mundial y bitácoras de voz de forma visual, usando backlinks y canvas.
*   **GBrain (El cerebro de las IAs):** Indexa esos mismos archivos Markdown mediante embeddings locales (`pglite` vectorial) y expone herramientas MCP para que las IAs en Cursor o Antigravity localicen información de diseño o contexto general instantáneamente.

---

## 2. Configuración Inicial del Vault

1.  Descarga e instala **Obsidian** en tu Mini PC / Mac desde [obsidian.md](https://obsidian.md/).
2.  Abre Obsidian y selecciona **"Open folder as vault"** (Abrir carpeta como bóveda).
3.  Elige la carpeta raíz del repositorio: `C:/Develop/GoalChain` (o `~/GoalChain` en tu Mac).
4.  Obsidian detectará automáticamente la configuración pre-cargada en la carpeta oculta `.obsidian/` (vistas, plugins sugeridos, carpetas de adjuntos y configuración de markdown).

---

## 3. Plugins Recomendados para Potenciar el Ecosistema

Para sacarle el máximo provecho, instala estos plugins comunitarios desde la configuración de Obsidian (`Ctrl + ,` o `Cmd + ,` -> Community Plugins):

### A. Git Sync (Sincronización automática de notas)
*   **Nombre:** *Obsidian Git*
*   **Para qué sirve:** Sincroniza y hace commit automático de tus notas en `docs/intake` a intervalos regulares (o al guardar). Esto asegura que los cambios que hagas en Obsidian se suban automáticamente y los agentes en el VPS (Hermes CEO) tengan la última información al hacer `git pull`.

### B. Dataview (Consultas de base de datos en tus notas)
*   **Nombre:** *Dataview*
*   **Para qué sirve:** Te permite generar listas dinámicas de tareas, issues abiertos o milestones directamente en tu dashboard principal de notas usando consultas tipo SQL.
*   *Ejemplo de Query en nota:*
    ```dataview
    LIST FROM "docs/intake"
    WHERE file.mday = date(today)
    ```

### C. Mermaid Previewer (Diagramas de Arquitectura)
*   **Nombre:** *Mermaid Previewer* o *Mermaid Charts*
*   **Para qué sirve:** Permite visualizar de forma interactiva y arrastrar bloques en los diagramas de arquitectura definidos en `ai_context/AGENT_ORCHESTRATION.md` o tus briefs.

---

## 4. El Workflow Diario (Paso a Paso)

1.  **Planificación Visual (Obsidian):** Creas una nota en `docs/intake/YYYY-MM-DD-nombre-tarea.md` detallando lo que quieres programar (ej: un dashboard para la economía de GoalChain).
2.  **Bucle de Sincronización:** Cuando guardas la nota en Obsidian, ejecutas en tu terminal local:
    ```bash
    gbrain import ai_context docs/intake
    gbrain embed --stale
    ```
    *(Nota: El script de setup de la Mini PC preconfigura este comando para facilitar la ejecución).*
3.  **Desarrollo Asistido (Cursor / Antigravity):** Le dices a tu agente en chat local: `"Revisa la última tarea de intake y propone el plan de código"`. El agente consumirá la base semántica y sabrá exactamente qué archivos tocar, alineado con las reglas de `ai_context`.
4.  **Consolidación:** El agente realiza el trabajo y genera las bitácoras o el `walkthrough.md` en el repositorio, que aparecerá automáticamente en tu gráfico/vault de Obsidian en tiempo real.
