/**
 * GoalChain Game Bus — Pub/Sub ligero para conectar los minijuegos
 * vanilla (docs/assets/js/*) con el estado global de React.
 *
 * Estrategia:
 *  - Un único bus en memoria (singleton) que emite/recibe eventos tipados.
 *  - Los juegos vanilla llaman a window.gcBus.emit(...) desde su ctx.
 *  - Los componentes React se suscriben vía useGameEvent.
 *
 * En la Fase 1 se usa para que eventos como un penal anotado o un sobre
 * abierto puedan refrescar el wallet pill, burn tracker o Enzo Bit sin
 * acoplamiento directo entre componentes.
 */

import { useEffect, useRef } from 'react';

export type GameEventMap = {
  /** Un penal fue anotado. payload: goles acumulados del jugador. */
  'penalty:goal': { scored: number };
  /** Un penal fue fallado. */
  'penalty:miss': { reason?: string };
  /** Un sobre NFT fue abierto. payload: rareza e id del jugador. */
  'pack:opened': { rarity: string; playerId?: string };
  /** Un atributo de jugador fue modificado en el simulador. */
  'modifier:change': { attribute: string; value: number };
  /** Evento genérico de juego para extender sin tocar el tipo. */
  'game:event': { type: string; payload?: unknown };
  /** Solicita abrir un juego rápido en modal (desde cualquier componente). */
  'arcade:open': { game: 'penalty' | 'pack' | 'modifiers' };
  /** Solicita cerrar el modal de arcade activo. */
  'arcade:close': void;
};

export type GameEventType = keyof GameEventMap;

type Listener<T extends GameEventType> = (payload: GameEventMap[T]) => void;

class GameBus {
  private listeners: {
    [K in GameEventType]?: Set<Listener<K>>;
  } = {};

  /** Suscribe un listener a un tipo de evento. Devuelve función de desuscripción. */
  on<T extends GameEventType>(type: T, listener: Listener<T>): () => void {
    if (!this.listeners[type]) {
      this.listeners[type] = new Set() as (typeof this.listeners)[T];
    }
    (this.listeners[type] as Set<Listener<T>>).add(listener);
    return () => this.off(type, listener);
  }

  /** Desuscribe un listener. */
  off<T extends GameEventType>(type: T, listener: Listener<T>): void {
    (this.listeners[type] as Set<Listener<T>> | undefined)?.delete(listener);
  }

  /** Emite un evento a todos los suscriptores. */
  emit<T extends GameEventType>(type: T, payload: GameEventMap[T]): void {
    const set = this.listeners[type] as Set<Listener<T>> | undefined;
    if (!set) return;
    set.forEach((fn) => {
      try {
        fn(payload);
      } catch (err) {
        console.error(`[gcBus] listener error for "${type}"`, err);
      }
    });
  }
}

/** Singleton compartido por toda la app. */
export const gameBus = new GameBus();

/**
 * Expone el bus en window para que los scripts vanilla (que no pueden
 * importar el módulo de React) puedan emitir eventos:
 *   window.gcBus?.emit('penalty:goal', { scored: 1 })
 */
declare global {
  interface Window {
    gcBus?: GameBus;
  }
}
if (typeof window !== 'undefined' && !window.gcBus) {
  window.gcBus = gameBus;
}

/**
 * Hook de React para suscribirse a un evento del bus con cleanup automático.
 * @example
 * useGameEvent('penalty:goal', ({ scored }) => refreshWallet(scored));
 */
export function useGameEvent<T extends GameEventType>(
  type: T,
  handler: Listener<T>
): void {
  // Suscripción estable: el handler se re-vincula solo si cambia.
  const ref = useRefHandler(handler);
  useEffect(() => {
    return gameBus.on(type, (payload) => ref.current(payload));
  }, [type, ref]);
}

function useRefHandler<T>(handler: T): React.MutableRefObject<T> {
  const ref = useRef<T>(handler);
  ref.current = handler;
  return ref;
}
