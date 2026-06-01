# Brief: Robustecer Loop de Auto-Corrección y QA en tmux
**Status:** ready
**Priority:** P1

## Objective
Desarrollar una capa de auto-corrección (Self-Healing Loop) en los scripts de ejecución de los agentes programadores (FCC/Claude Code) en el VPS. Si un agente escribe código que no compila, debe ser capaz de diagnosticar, reescribir y volver a compilar de manera 100% autónoma.

## Context
Actualmente el monorepo tiene comandos de chequeo estrictos:
- SDK: `npm run lint` (tsc --noEmit)
- Webapp: `npx tsc --noEmit`
- Program: `anchor build` / `anchor test --validator legacy`
- API: `npm run lint`

## Scope
1. Modificar `oa-run-code.sh` o el script despachador de tareas de FCC para que cuando ejecute la escritura de un branch, antes de confirmar la tarea, corra los lints/tests correspondientes del módulo modificado.
2. Si la consola de compilación o lint arroja código de error (>0), capturar las líneas de error, inyectárselas al agente (`fcc-claude`) y ordenarle corregir su propio archivo.
3. Repetir el loop de corrección de forma autónoma hasta un máximo de 5 iteraciones.
4. Solo proceder con el commit, push y creación de PR si el build es 100% exitoso y libre de warnings críticos.
