import React, { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  fetchFixtures,
  placeFixtureBet,
  type FixtureView,
  type PredictionSide,
} from '../../lib/goalchainClient';
import { useTranslation } from '../../i18n';
import { SimulationBadge } from '../../components/ui/SimulationBadge';

interface BetSelection {
  fixturePubkey: string;
  side: PredictionSide;
  amount: string;
  fixture: FixtureView;
}

interface Toast {
  id: number;
  type: 'success' | 'error' | 'warn';
  message: string;
}

let toastCounter = 0;

export const BetSlip: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { t } = useTranslation();
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [fixtures, setFixtures] = useState<FixtureView[]>([]);
  const [loading, setLoading] = useState(false);

  // Load fixtures on mount
  useEffect(() => {
    if (connection) {
      setLoading(true);
      fetchFixtures(connection)
        .then(setFixtures)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [connection]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('goalchain_betslip', JSON.stringify(selections));
  }, [selections]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('goalchain_betslip');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSelections(parsed);
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  const addToast = (type: Toast['type'], message: string) => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 6000);
  };

  const addSelection = (fixture: FixtureView, side: PredictionSide) => {
    setSelections((prev) => {
      const exists = prev.find((s) => s.fixturePubkey === fixture.pubkey && s.side === side);
      if (exists) return prev;
      return [...prev, { fixturePubkey: fixture.pubkey, side, amount: '', fixture }];
    });
    setOpen(true);
  };

  const removeSelection = (fixturePubkey: string, side: PredictionSide) => {
    setSelections((prev) => prev.filter((s) => !(s.fixturePubkey === fixturePubkey && s.side === side)));
  };

  const updateAmount = (fixturePubkey: string, side: PredictionSide, amount: string) => {
    setSelections((prev) =>
      prev.map((s) => (s.fixturePubkey === fixturePubkey && s.side === side ? { ...s, amount } : s))
    );
  };

  const clearAll = () => {
    setSelections([]);
    localStorage.removeItem('goalchain_betslip');
  };

  const totalStake = selections.reduce((sum, s) => sum + parseFloat(s.amount || '0'), 0);
  const canSubmit = selections.length > 0 && selections.every((s) => parseFloat(s.amount) > 0) && wallet.publicKey;

  const handleSubmit = async () => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      addToast('warn', t('claim_wallet_required') || '¡Conecta tu wallet primero!');
      return;
    }

    if (!connection) {
      addToast('error', 'No hay conexión RPC disponible');
      return;
    }

    try {
      setSubmitting('all');

      // Submit all selections sequentially
      for (const selection of selections) {
        const amount = parseFloat(selection.amount);
        if (amount <= 0) continue;

        try {
          const signature = await placeFixtureBet({
            connection,
            wallet,
            fixture: new PublicKey(selection.fixturePubkey),
            side: selection.side,
            amountUi: selection.amount,
          });

          const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
          window.open(explorerUrl, '_blank', 'noopener,noreferrer');

          addToast('success', `Apuesta en ${selection.fixture.teamA} vs ${selection.fixture.teamB} (${selection.side}) enviada ✅`);
        } catch (e: any) {
          console.error('Bet failed:', e);
          addToast('error', `Error en ${selection.fixture.teamA} vs ${selection.fixture.teamB}: ${e?.message ?? 'error desconocido'}`);
        }
      }

      clearAll();
      setOpen(false);
    } finally {
      setSubmitting(null);
    }
  };

  if (selections.length === 0 && !open) {
    return null;
  }

  return (
    <>
      {/* Floating trigger button */}
      {selections.length > 0 && !open && (
        <button
          className="betslip-trigger"
          onClick={() => setOpen(true)}
          aria-label={t('betslip_open') || 'Abrir hoja de apuestas'}
        >
          <span className="betslip-count">{selections.length}</span>
          <span className="betslip-label">{t('betslip_title') || 'Hoja de Apuestas'}</span>
          <span className="betslip-total">{totalStake.toFixed(2)} base units</span>
        </button>
      )}

      {/* Slide-over panel */}
      <div className={`betslip-panel ${open ? 'open' : ''}`} role="dialog" aria-modal="true">
        <div className="betslip-backdrop" onClick={() => setOpen(false)} />

        <div className="betslip-content">
          <div className="betslip-header">
            <h3>
              {t('betslip_title') || 'Hoja de Apuestas'}
              <SimulationBadge compact />
            </h3>
            <button
              className="betslip-close"
              onClick={() => setOpen(false)}
              aria-label={t('betslip_close') || 'Cerrar'}
            >
              ✕
            </button>
          </div>

          {selections.length === 0 ? (
            <div className="betslip-empty">
              <p>{t('betslip_empty') || 'No hay selecciones aún'}</p>
              <p className="hint">{t('betslip_empty_hint') || 'Ve al Estadio y añade apuestas a tu hoja'}</p>
              <button className="btn-secondary" onClick={() => setOpen(false)}>
                {t('betslip_continue') || 'Seguir explorando'}
              </button>
            </div>
          ) : (
            <>
              <div className="betslip-selections">
                {selections.map((sel) => (
                  <div key={`${sel.fixturePubkey}-${sel.side}`} className="betslip-selection">
                    <div className="selection-match">
                      <span className="team">{sel.fixture.teamA}</span>
                      <span className="vs">VS</span>
                      <span className="team">{sel.fixture.teamB}</span>
                    </div>
                    <div className="selection-side">
                      <span className={`side-badge side-${sel.side}`}>
                        {sel.side === 'A' ? sel.fixture.teamA : sel.side === 'B' ? sel.fixture.teamB : t('betslip_draw') || 'Empate'}
                      </span>
                    </div>
                    <div className="selection-amount">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Monto"
                        value={sel.amount}
                        onChange={(e) => updateAmount(sel.fixturePubkey, sel.side, e.target.value)}
                        className="amount-input"
                        aria-label={`${t('betslip_amount') || 'Monto'} para ${sel.fixture.teamA} vs ${sel.fixture.teamB} (${sel.side})`}
                      />
                    </div>
                    <button
                      className="selection-remove"
                      onClick={() => removeSelection(sel.fixturePubkey, sel.side)}
                      aria-label={t('betslip_remove') || 'Eliminar selección'}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {selections.length > 1 && (
                  <button className="betslip-clear-all" onClick={clearAll}>
                    {t('betslip_clear_all') || 'Limpiar todo'}
                  </button>
                )}
              </div>

              <div className="betslip-summary">
                <div className="summary-row">
                  <span>{t('betslip_total_stake') || 'Total a apostar'}</span>
                  <span className="total-amount">{totalStake.toFixed(2)} base units</span>
                </div>
                <div className="summary-row">
                  <span>{t('betslip_selections') || 'Selecciones'}</span>
                  <span>{selections.length}</span>
                </div>
              </div>

              <div className="betslip-actions">
                {!wallet.publicKey && (
                  <p className="wallet-warning">
                    {t('betslip_connect_wallet') || 'Conecta tu wallet para realizar apuestas'}
                  </p>
                )}
                <button
                  className="btn-place-bets"
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting !== null}
                >
                  {submitting
                    ? t('betslip_placing') || 'Realizando apuestas...'
                    : `${t('betslip_place') || 'Realizar'} ${selections.length} ${selections.length === 1 ? (t('betslip_bet_singular') || 'apuesta') : (t('betslip_bet_plural') || 'apuestas')}`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast container */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((tst) => (
          <div
            key={tst.id}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              maxWidth: '340px',
              pointerEvents: 'auto',
              background:
                tst.type === 'success'
                  ? 'rgba(20,241,149,0.12)'
                  : tst.type === 'error'
                  ? 'rgba(255,75,75,0.12)'
                  : 'rgba(234,179,8,0.12)',
              border:
                tst.type === 'success'
                  ? '1px solid rgba(20,241,149,0.35)'
                  : tst.type === 'error'
                  ? '1px solid rgba(255,75,75,0.35)'
                  : '1px solid rgba(234,179,8,0.35)',
              color:
                tst.type === 'success' ? '#14f195' : tst.type === 'error' ? '#ff9ea8' : '#fde047',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              animation: 'fadeInUp 0.25s ease',
            }}
          >
            {tst.message}
          </div>
        ))}
      </div>
    </>
  );
};

/**
 * Hook to add a bet to the bet slip from anywhere in the app.
 * Returns a function `addToBetSlip(fixture, side)` and the current selection count.
 */
export function useBetSlip() {
  const [selectionCount, setSelectionCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('goalchain_betslip');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSelectionCount(Array.isArray(parsed) ? parsed.length : 0);
      } catch {
        setSelectionCount(0);
      }
    }
  }, []);

  const addToBetSlip = useCallback((fixture: FixtureView, side: PredictionSide) => {
    const stored = localStorage.getItem('goalchain_betslip');
    let selections: BetSelection[] = [];
    if (stored) {
      try {
        selections = JSON.parse(stored);
      } catch {
        selections = [];
      }
    }

    const exists = selections.find((s) => s.fixturePubkey === fixture.pubkey && s.side === side);
    if (!exists) {
      selections.push({ fixturePubkey: fixture.pubkey, side, amount: '', fixture });
      localStorage.setItem('goalchain_betslip', JSON.stringify(selections));
      setSelectionCount(selections.length);
      // Trigger panel open via custom event
      window.dispatchEvent(new CustomEvent('betslip:open'));
    }
  }, []);

  return { addToBetSlip, selectionCount };
}