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
class GameBus {
    listeners = {};
    /** Suscribe un listener a un tipo de evento. Devuelve función de desuscripción. */
    on(type, listener) {
        if (!this.listeners[type]) {
            this.listeners[type] = new Set();
        }
        this.listeners[type].add(listener);
        return () => this.off(type, listener);
    }
    /** Desuscribe un listener. */
    off(type, listener) {
        this.listeners[type]?.delete(listener);
    }
    /** Emite un evento a todos los suscriptores. */
    emit(type, payload) {
        const set = this.listeners[type];
        if (!set)
            return;
        set.forEach((fn) => {
            try {
                fn(payload);
            }
            catch (err) {
                console.error(`[gcBus] listener error for "${type}"`, err);
            }
        });
    }
}
/** Singleton compartido por toda la app. */
export const gameBus = new GameBus();
if (typeof window !== 'undefined' && !window.gcBus) {
    window.gcBus = gameBus;
}
/**
 * Hook de React para suscribirse a un evento del bus con cleanup automático.
 * @example
 * useGameEvent('penalty:goal', ({ scored }) => refreshWallet(scored));
 */
export function useGameEvent(type, handler) {
    // Suscripción estable: el handler se re-vincula solo si cambia.
    const ref = useRefHandler(handler);
    useEffect(() => {
        return gameBus.on(type, (payload) => ref.current(payload));
    }, [type, ref]);
}
function useRefHandler(handler) {
    const ref = useRef(handler);
    ref.current = handler;
    return ref;
}
