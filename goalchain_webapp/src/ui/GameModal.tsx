/**
 * <GameModal> — Modal flotante con glassmorphism premium para juegos
 * rápidos del ARCADE (penalty, pack opener, modifiers).
 *
 * Se abre SIN cambiar la ruta principal → experiencia pop-in/pop-out
 * que no rompe la sesión del Dashboard.
 *
 * El contenido se renderiza a través de <VanillaMount> (iframe en Fase 1).
 */
import React, { useEffect } from 'react';
import VanillaMount, { type VanillaGameId } from './VanillaMount';
import { useTranslation } from '../i18n';
import { useGameEvent } from '../hooks/useGameBus';

export interface GameModalProps {
  /** Juego activo. Si es null, el modal está cerrado. */
  gameId: VanillaGameId | null;
  /** Cierra el modal. */
  onClose: () => void;
}

const TITLES: Record<VanillaGameId, { en: string; es: string }> = {
  penalty: { en: 'Penalty Shootout', es: 'Tiros de Penal' },
  pack: { en: 'Pack Opener', es: 'Apertura de Sobres' },
  modifiers: { en: 'Modifiers Lab', es: 'Lab de Atributos' },
};

const ICONS: Record<VanillaGameId, string> = {
  penalty: '🥅',
  pack: '🎁',
  modifiers: '⚗️',
};

export function GameModal({ gameId, onClose }: GameModalProps) {
  const { language } = useTranslation();
  const open = gameId !== null;

  // Cerrar con tecla Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    // Bloquear scroll del body mientras el modal está abierto.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // Escucha petición de cierre desde el bus (botones internos del juego).
  useGameEvent('arcade:close', () => onClose());

  if (!open || !gameId) return null;

  const meta = TITLES[gameId];
  const title = meta[language];

  return (
    <div
      className="gc-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        // Cerrar al click fuera del panel.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="gc-modal gc-modal--game glass-strong">
        <header className="gc-modal-head">
          <h2 className="gc-modal-title">
            <span className="gc-modal-icon" aria-hidden>{ICONS[gameId]}</span>
            {title}
          </h2>
          <button
            type="button"
            className="gc-modal-close"
            aria-label={language === 'es' ? 'Cerrar' : 'Close'}
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <div className="gc-modal-body">
          <VanillaMount gameId={gameId} ctx={{ language }} />
        </div>
      </div>
    </div>
  );
}

export default GameModal;
