/**
 * <ModalRoot> — Punto de anclaje único para los modales del puerto de mando.
 *
 * Vive dentro de <PlayLayout> y:
 *  1. Escucha el bus de eventos (arcade:open / arcade:close) para abrir
 *     juegos rápidos desde cualquier parte de la UI.
 *  2. Mantiene el estado del modal activo y lo delega a <GameModal>.
 *
 * Centralizarlo aquí evita que cada componente tenga su propia lógica de
 * modal y garantiza un único overlay a la vez.
 */
import React, { useCallback, useState } from 'react';
import GameModal from './GameModal';
import { useGameEvent } from '../hooks/useGameBus';
import type { VanillaGameId } from './VanillaMount';

export function ModalRoot() {
  const [activeGame, setActiveGame] = useState<VanillaGameId | null>(null);

  // Apertura solicitada desde cualquier componente vía bus.
  useGameEvent('arcade:open', ({ game }) => setActiveGame(game));
  useGameEvent('arcade:close', () => setActiveGame(null));

  const handleClose = useCallback(() => setActiveGame(null), []);

  return <GameModal gameId={activeGame} onClose={handleClose} />;
}

export default ModalRoot;
