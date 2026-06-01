# Brief: Activar Puente Físico con Antigravity en Mac Local
**Status:** ready
**Priority:** P1

## Objective
Programar y conectar el bridge local en la Mac de Nico (`local-agent-bridge.sh`) con el despachador autónomo del VPS. Esto habilitará la delegación hands-free de tareas súper complejas de desarrollo al agente local master (Antigravity) de forma 100% automatizada.

## Context
El VPS tiene menor capacidad de GPU/RAM que la Mac y tiene tokens de Claude Code basados en NIMs, pero no cuenta con modelos de razonamiento local profundo como Antigravity en local.

## Scope
1. Configurar un túnel seguro o receptor de webhook local en la Mac de Nico que escuche peticiones JSON de tareas enviadas por el VPS.
2. Si Hermes determina que el owner de un intake es `antigravity`, el script `autonomic-dispatch.sh` debe mandar la orden y el brief formateado por HTTP/SSH a la Mac local.
3. El bridge de la Mac debe levantar a Antigravity en segundo plano, dejar que resuelva la tarea directamente en el repositorio local, compile, testee, y realice el push de vuelta a GitHub.
4. Una vez completado, el bridge local notificará al VPS para que marque el issue como completado.
