# Brief: Integrar Herramientas del Feed de X a la Memoria de GBrain
**Status:** ready
**Priority:** P1

## Objective
Programar de forma autónoma una herramienta para que Hermes pueda asimilar los reposts y links que Nico comparte en X (Twitter), y agregarlos directamente al grafo de conocimiento de GBrain. Esto permitirá que los agentes tengan acceso y aprendan autónomamente sobre nuevas tecnologías de IA que Nico reposteé.

## Context
Nico tiene integraciones y skills nativas en su Mac local como `setup-browser-cookies` en `/Users/NicoPez/.claude/skills/gstack/setup-browser-cookies/`. 
Grok-cli local detectó que la extensión `x-to-brain` (v0.8.1) requiere un Bearer Token (`X_BEARER_TOKEN`) de X (developer.x.com).

## Scope
1. Configurar la asimilación del feed usando el Bearer Token o, alternativamente, utilizar las cookies de sesión importadas a través de `setup-browser-cookies` de forma segura.
2. Hacer que los reposts de X fluyan automáticamente hacia la base de datos de GBrain en `~/.gbrain/brain.pglite` de forma indexada.
3. Crear un skill o comando que Hermes pueda llamar para buscar y profundizar en el funcionamiento de herramientas que Nico haya marcado en X.
