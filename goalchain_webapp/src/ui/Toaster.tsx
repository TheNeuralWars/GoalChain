/**
 * <Toaster> — Notificaciones flotantes que reaccionan a los eventos del
 * gameBus (goles, sobres abiertos, etc.).
 *
 * Vive en <PlayLayout> y muestra toasts efímeros con glassmorphism.
 * Cada evento del arcade genera un toast con su icono y color semántico.
 */
import React, { useCallback, useState } from 'react';
import { useGameEvent } from '../hooks/useGameBus';
import { useTranslation } from '../i18n';

type ToastVariant = 'success' | 'info' | 'premium';

interface Toast {
  id: number;
  icon: string;
  text: string;
  variant: ToastVariant;
}

const RARITY_ICONS: Record<string, string> = {
  mythic: '🌟',
  legendary: '🏅',
  epic: '💜',
  rare: '🔵',
  common: '⚪',
  unknown: '🎁',
};

let toastSeq = 0;

export function Toaster() {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((icon: string, text: string, variant: ToastVariant = 'success') => {
    const id = ++toastSeq;
    setToasts((cur) => [...cur, { id, icon, text, variant }]);
    // Auto-descarte a los 3.2s.
    setTimeout(() => {
      setToasts((cur) => cur.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  // Reacciones a los eventos del arcade.
  useGameEvent('penalty:goal', ({ scored }) => {
    push('⚽', `¡${t('toast_goal' as never) || 'GOAL'}! +${scored}`, 'success');
  });

  useGameEvent('penalty:miss', () => {
    push('🧤', t('toast_save' as never) || 'Saved!', 'info');
  });

  useGameEvent('pack:opened', ({ rarity }) => {
    const icon = RARITY_ICONS[rarity] ?? '🎁';
    const label = rarity !== 'unknown' ? rarity.toUpperCase() : '';
    push(icon, `${t('toast_pack' as never) || 'New card'}${label ? ': ' + label : ''}`, 'premium');
  });

  return (
    <div className="gc-toaster" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`gc-toast gc-toast--${toast.variant} glass-strong`}
        >
          <span className="gc-toast-icon" aria-hidden>{toast.icon}</span>
          <span className="gc-toast-text">{toast.text}</span>
        </div>
      ))}
    </div>
  );
}

export default Toaster;
