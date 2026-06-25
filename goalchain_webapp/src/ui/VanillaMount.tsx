/**
 * <VanillaMount> — Puente React ↔ scripts vanilla.
 *
 * Los minijuegos de docs/assets/js/ pintan directamente sobre el DOM.
 * Este componente monta un <div ref> propiedad de React, inyecta el juego
 * dentro de ese contenedor y garantiza su limpieza al desmontar.
 *
 * Estrategia de la Fase 1 (híbrida, sin reescribir los .js):
 *  - Modo "iframe": el juego se sirve desde docs/ en un <iframe sandbox>.
 *    Es el modo por defecto mientras no portemos los scripts a ES modules.
 *  - Modo "module" (futuro): el script expone init(container, ctx) y este
 *    componente lo invoca, recogiendo el cleanup retornado.
 */
import React, { useEffect, useRef } from 'react';
import { MARKETING_BASE } from '../config/playNav';
import { gameBus } from '../hooks/useGameBus';

/** Mensaje postMessage emitido por arcade_bridge.js. */
interface ArcadeBridgeMessage {
  source: 'gc-arcade';
  game: string;
  event: string;
  payload: Record<string, unknown>;
}

export type VanillaGameId = 'penalty' | 'pack' | 'modifiers';

export interface VanillaMountCtx {
  /** Idioma activo ('en' | 'es'). */
  language: 'en' | 'es';
  /** Tokens de tema (inyectados como CSS vars del contenedor). */
  theme?: Record<string, string>;
}

interface VanillaMountProps {
  /** Id del juego vanilla a montar. */
  gameId: VanillaGameId;
  /** Modo de integración. Por defecto 'iframe' (Fase 1). */
  mode?: 'iframe' | 'module';
  /** Ruta relativa del script en docs/ (modo module, futuro). */
  src?: string;
  /** Contexto inyectado al juego. */
  ctx?: VanillaMountCtx;
  /** Clase extra para el contenedor. */
  className?: string;
}

/**
 * Mapea cada juego a su página dedicada en docs/play/.
 * - penalty y pack: wrappers aislados en docs/play/ (autocontenidos).
 * - modifiers: por ahora apunta a la sección de la landing (#manager),
 *   ya que su UI requiere 37 IDs + dependencias (ai_agent.js).
 *   TODO: migrar a wrapper dedicado en Fase posterior.
 */
const IFRAME_ROUTES: Record<VanillaGameId, string> = {
  penalty: '/play/penalty.html',
  pack: '/play/pack.html',
  modifiers: '/#manager',
};

/**
 * <VanillaMount> montado sobre un <iframe sandbox> de la página de docs/.
 * Aísla por completo el DOM vanilla del árbol React: cero colisiones de
 * estilos y cero fugas de listeners. La comunicación va por postMessage
 * (los scripts de docs/ ya emiten eventos que podemos escuchar aquí).
 */
function VanillaMount({
  gameId,
  mode = 'iframe',
  src,
  ctx,
  className,
}: VanillaMountProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mode !== 'module' || !src) return;
    // Modo module (futuro): carga dinámica del ES module.
    let destroy: (() => void) | undefined;
    let cancelled = false;
    import(/* @vite-ignore */ src)
      .then((mod: { init?: (el: HTMLElement, c: VanillaMountCtx) => (() => void) | void }) => {
        if (cancelled || !containerRef.current || !mod.init) return;
        const cleanup = mod.init(containerRef.current, ctx ?? { language: 'en' });
        destroy = typeof cleanup === 'function' ? cleanup : undefined;
      })
      .catch((err) => console.error(`[VanillaMount] no se pudo cargar ${src}`, err));
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [mode, src, ctx]);

  if (mode === 'module') {
    return <div ref={containerRef} className={`gc-vanilla-host ${className ?? ''}`} />;
  }

  // Modo iframe (por defecto). Escucha postMessage del arcade_bridge.
  const url = `${MARKETING_BASE}${IFRAME_ROUTES[gameId]}`;

  return (
    <IframeGame gameId={gameId} url={url} className={className} />
  );
}

/**
 * Iframe del juego + listener postMessage.
 * Se aisla en su propio componente para que el useEffect de escucha
 * se monte/desmonte limpio con cada apertura de juego.
 */
function IframeGame({
  gameId,
  url,
  className,
}: {
  gameId: VanillaGameId;
  url: string;
  className?: string;
}) {
  // Listener postMessage: reenvía los eventos del bridge al gameBus de React.
  useEffect(() => {
    const onMessage = (e: MessageEvent<ArcadeBridgeMessage>) => {
      const data = e.data;
      // Filtro de namespace: ignora mensajes que no sean del puente.
      if (!data || data.source !== 'gc-arcade') return;
      if (data.game !== gameId) return;

      // Mapea eventos del bridge → eventos tipados del gameBus.
      switch (data.event) {
        case 'penalty:goal':
          gameBus.emit('penalty:goal', {
            scored: Number(data.payload?.scored ?? 1),
          });
          break;
        case 'penalty:miss':
          gameBus.emit('penalty:miss', { reason: String(data.payload?.reason ?? '') });
          break;
        case 'pack:opened':
          gameBus.emit('pack:opened', {
            rarity: String(data.payload?.rarity ?? 'unknown'),
            playerId: data.payload?.playerId != null ? String(data.payload.playerId) : undefined,
          });
          break;
        case 'modifier:change':
          gameBus.emit('modifier:change', {
            attribute: String(data.payload?.attribute ?? ''),
            value: Number(data.payload?.value ?? 0),
          });
          break;
        default:
          // Evento genérico para extender sin tocar el switch.
          gameBus.emit('game:event', {
            type: data.event,
            payload: data.payload,
          });
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [gameId]);

  return (
    <div className={`gc-vanilla-host gc-vanilla-host--iframe ${className ?? ''}`}>
      <iframe
        key={gameId}
        src={url}
        title={`GoalChain ${gameId} game`}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups"
        allow="clipboard-write"
        className="gc-vanilla-iframe"
      />
    </div>
  );
}

export default VanillaMount;
