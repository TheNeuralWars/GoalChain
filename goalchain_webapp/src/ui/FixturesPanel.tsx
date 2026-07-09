import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  claimFixturePayout,
  fetchFixtures,
  fetchUserBets,
  placeFixtureBet,
  refundFixtureBet,
  type FixtureView,
  type PredictionSide,
  type UserBetView,
} from '../lib/goalchainClient';
import { useTranslation } from '../i18n';
import type { TranslationKeys } from '../i18n/translations';
import { explorerTxUrl } from '../lib/explorerLinks';
import wcFixtureData from '../config/wc2026_fixture.json';

type Fixture = FixtureView;

/* ============================================================
   Tipos de datos del fixture local (marketing/ESPN-style)
   ============================================================ */
type LocalFixture = {
  id: number;
  phase:
    | 'group'
    | 'round_of_32'
    | 'round_of_16'
    | 'quarterfinal'
    | 'semifinal'
    | 'third_place'
    | 'final';
  group: string | null;
  date: string;
  home: string;
  away: string;
  scoreHome?: number;
  scoreAway?: number;
  status?: string;
  venue?: string;
  city?: string;
  qualifierNote?: string;
};

const LOCAL_FIXTURES = wcFixtureData as LocalFixture[];

type RoundKey =
  | 'round_of_32'
  | 'round_of_16'
  | 'quarterfinal'
  | 'semifinal'
  | 'final';

const ROUND_ORDER: RoundKey[] = [
  'round_of_32',
  'round_of_16',
  'quarterfinal',
  'semifinal',
  'final',
];

interface Toast {
  id: number;
  type: 'success' | 'error' | 'warn';
  message: string;
}

let toastCounter = 0;

export const FixturesPanel: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { t } = useTranslation();

  // Vista activa: listado on-chain vs cuadro de eliminación (bracket).
  const [view, setView] = useState<'list' | 'bracket'>('list');

  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [userBets, setUserBets] = useState<UserBetView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [betAmounts, setBetAmounts] = useState<Record<string, string>>({});
  const [submittingFor, setSubmittingFor] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast['type'], message: string) => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((tk) => tk.id !== id)), 6000);
  };

  const refresh = useCallback(async () => {
    try {
      const onchainFixtures = await fetchFixtures(connection);
      setFixtures(onchainFixtures);
      if (wallet.publicKey) {
        const bets = await fetchUserBets(connection, wallet.publicKey);
        setUserBets(bets);
      } else {
        setUserBets([]);
      }
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching fixtures:', err);
      setError('No se pudieron leer fixtures on-chain. Revisa RPC/programa.');
      setLoading(false);
    }
  }, [connection, wallet.publicKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const betForFixture = (fixturePubkey: string): UserBetView | undefined =>
    userBets.find((b) => b.fixture === fixturePubkey);

  const openExplorerLink = (signature: string) => {
    const url = explorerTxUrl(signature);
    window.open(url, '_blank', 'noopener,noreferrer');
    return url;
  };

  const handleBet = async (fixturePubkey: string, side: PredictionSide) => {
    if (!wallet.publicKey) {
      addToast('warn', '¡Conecta tu wallet primero!');
      return;
    }
    const amountUi = (betAmounts[fixturePubkey] ?? '').trim();
    if (!amountUi) {
      addToast('warn', 'Ingresa monto a apostar (token base del protocolo).');
      return;
    }
    try {
      setSubmittingFor(`${fixturePubkey}:${side}`);
      const signature = await placeFixtureBet({
        connection,
        wallet,
        fixture: new PublicKey(fixturePubkey),
        side,
        amountUi,
      });
      openExplorerLink(signature);
      addToast('success', `Apuesta enviada ✅ — Explorer abierto.`);
      await refresh();
    } catch (e: any) {
      console.error('placeBet failed', e);
      addToast('error', `No se pudo enviar la apuesta: ${e?.message ?? 'error desconocido'}`);
    } finally {
      setSubmittingFor(null);
    }
  };

  const handleClaim = async (fixturePubkey: string) => {
    if (!wallet.publicKey) {
      addToast('warn', '¡Conecta tu wallet primero!');
      return;
    }
    try {
      setSubmittingFor(`${fixturePubkey}:claim`);
      const signature = await claimFixturePayout({
        connection,
        wallet,
        fixture: new PublicKey(fixturePubkey),
      });
      openExplorerLink(signature);
      addToast('success', `Cobro enviado ✅ — Explorer abierto.`);
      await refresh();
    } catch (e: any) {
      console.error('claimBetPayout failed', e);
      addToast('error', `No se pudo cobrar: ${e?.message ?? 'error desconocido'}`);
    } finally {
      setSubmittingFor(null);
    }
  };

  const handleRefund = async (fixturePubkey: string) => {
    if (!wallet.publicKey) {
      addToast('warn', '¡Conecta tu wallet primero!');
      return;
    }
    try {
      setSubmittingFor(`${fixturePubkey}:refund`);
      const signature = await refundFixtureBet({
        connection,
        wallet,
        fixture: new PublicKey(fixturePubkey),
      });
      openExplorerLink(signature);
      addToast('success', `Reembolso enviado ✅ — Explorer abierto.`);
      await refresh();
    } catch (e: any) {
      console.error('refundBet failed', e);
      addToast('error', `No se pudo reembolsar: ${e?.message ?? 'error desconocido'}`);
    } finally {
      setSubmittingFor(null);
    }
  };

  return (
    <div className="gc-fixtures-root">
      {/* Toast container */}
      <div className="gc-toast-stack" aria-live="polite">
        {toasts.map((tk) => (
          <div key={tk.id} className={`gc-toast gc-toast--${tk.type}`}>
            {tk.message}
          </div>
        ))}
      </div>

      {/* Toolbar: switch List ↔ Knockout Bracket */}
      <div className="gc-fixtures-toolbar">
        <div className="gc-fixtures-viewswitch" role="tablist" aria-label="Fixture view">
          <button
            role="tab"
            aria-selected={view === 'list'}
            className={`gc-viewswitch-btn ${view === 'list' ? 'gc-viewswitch-btn--active' : ''}`}
            onClick={() => setView('list')}
          >
            <span aria-hidden>📋</span>
            {t('fix_view_list')}
          </button>
          <button
            role="tab"
            aria-selected={view === 'bracket'}
            className={`gc-viewswitch-btn ${view === 'bracket' ? 'gc-viewswitch-btn--active' : ''}`}
            onClick={() => setView('bracket')}
          >
            <span aria-hidden>🌳</span>
            {t('fix_view_bracket')}
          </button>
        </div>
        <div className="gc-fixtures-legend">
          <span className="gc-legend-chip gc-legend-chip--live">
            <span className="gc-live-dot" aria-hidden /> {t('fix_legend_live')}
          </span>
          <span className="gc-legend-chip gc-legend-chip--upcoming">
            <span className="gc-legend-dot gc-legend-dot--purple" aria-hidden /> {t('fix_legend_upcoming')}
          </span>
          <span className="gc-legend-chip gc-legend-chip--done">
            <span className="gc-legend-dot gc-legend-dot--grey" aria-hidden /> {t('fix_legend_done')}
          </span>
        </div>
      </div>

      {view === 'bracket' ? (
        <KnockoutBracket />
      ) : (
        <>
          {loading ? (
            <div className="gc-fixtures-loading">{t('fix_loading')}</div>
          ) : (
            <div className="fixtures-container gc-fixtures-list">
              <h2 className="gc-fixtures-heading">
                {t('fix_list_heading')}
              </h2>
              {error && <div className="gc-fixtures-error">{error}</div>}
              {fixtures.map((f) => {
                const mine = betForFixture(f.pubkey);
                const canBet = f.status === 'upcoming' || f.status === 'live';
                const canClaim = f.status === 'completed' && mine && !mine.claimed;
                const canRefund = f.status === 'cancelled' && mine && !mine.claimed;

                return (
                  <div
                    key={f.pubkey}
                    className={`gc-fixture-card glass-card gc-fixture-card--${f.status}`}
                  >
                    <div className="gc-fixture-teams">
                      <span className="gc-team">{f.teamA}</span>
                      <span className="gc-vs">VS</span>
                      <span className="gc-team">{f.teamB}</span>
                    </div>

                    <div className="gc-fixture-meta">
                      <span>ID: {f.matchId}</span>
                      <span>·</span>
                      <span className={`gc-status gc-status--${f.status}`}>{f.status}</span>
                      <span>·</span>
                      <span>Pool {(f.poolA + f.poolB + f.poolDraw).toLocaleString()} base</span>
                    </div>

                    {/* Marcador on-chain (si el oráculo ya publicó LiveMatchState) */}
                    {(f.scoreA !== undefined || f.scoreB !== undefined) && (
                      <div className="gc-fixture-score">
                        <span className="gc-score-num">{f.scoreA ?? 0}</span>
                        <span className="gc-score-sep">:</span>
                        <span className="gc-score-num">{f.scoreB ?? 0}</span>
                        {f.status === 'live' && f.minute !== undefined && (
                          <span className="gc-live-minute">
                            <span className="gc-live-dot" aria-hidden />
                            Min {f.minute}'
                          </span>
                        )}
                      </div>
                    )}

                    {mine && (
                      <div className="gc-fixture-mine">
                        Tu apuesta: {mine.amountBaseUnits} base units · predicción {mine.prediction}
                        {mine.claimed ? ' · cobrada' : ' · pendiente'}
                      </div>
                    )}

                    {canBet && (
                      <div className="gc-fixture-betinput">
                        <input
                          type="text"
                          placeholder="Monto (ej: 1.5)"
                          value={betAmounts[f.pubkey] ?? ''}
                          onChange={(e) => setBetAmounts((prev) => ({ ...prev, [f.pubkey]: e.target.value }))}
                        />
                      </div>
                    )}

                    <div className="bet-actions">
                      {canBet && (
                        <>
                          <button
                            className="gc-btn gc-btn--green"
                            disabled={submittingFor === `${f.pubkey}:A`}
                            onClick={() => handleBet(f.pubkey, 'A')}
                          >
                            {submittingFor === `${f.pubkey}:A` ? 'Enviando...' : `Gana ${f.teamA}`}
                          </button>
                          <button
                            className="gc-btn gc-btn--ghost"
                            disabled={submittingFor === `${f.pubkey}:Draw`}
                            onClick={() => handleBet(f.pubkey, 'Draw')}
                          >
                            {submittingFor === `${f.pubkey}:Draw` ? 'Enviando...' : 'Empate'}
                          </button>
                          <button
                            className="gc-btn gc-btn--green"
                            disabled={submittingFor === `${f.pubkey}:B`}
                            onClick={() => handleBet(f.pubkey, 'B')}
                          >
                            {submittingFor === `${f.pubkey}:B` ? 'Enviando...' : `Gana ${f.teamB}`}
                          </button>
                        </>
                      )}
                      {canClaim && (
                        <button
                          className="gc-btn gc-btn--purple"
                          disabled={submittingFor === `${f.pubkey}:claim`}
                          onClick={() => handleClaim(f.pubkey)}
                        >
                          {submittingFor === `${f.pubkey}:claim` ? 'Cobrando...' : 'Cobrar ganancia'}
                        </button>
                      )}
                      {canRefund && (
                        <button
                          className="gc-btn gc-btn--amber"
                          disabled={submittingFor === `${f.pubkey}:refund`}
                          onClick={() => handleRefund(f.pubkey)}
                        >
                          {submittingFor === `${f.pubkey}:refund` ? 'Reembolsando...' : 'Reembolsar apuesta'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ============================================================
   CUADRO DE DESARROLLO (Knockout Bracket)
   ------------------------------------------------------------
   Renderiza el árbol de eliminación directa usando los fixtures
   locales (wc2026_fixture.json). Las columnas representan las
   rondas: R32 → R16 → QF → SF → Final.
   ============================================================ */
const KnockoutBracket: React.FC = () => {
  const { t } = useTranslation();

  // Mapa tipado ronda → clave i18n (evita cast dinámico de string).
  const ROUND_LABEL_KEY: Record<RoundKey, keyof TranslationKeys> = {
    round_of_32: 'fix_round_round_of_32',
    round_of_16: 'fix_round_round_of_16',
    quarterfinal: 'fix_round_quarterfinal',
    semifinal: 'fix_round_semifinal',
    final: 'fix_round_final',
  };

  const rounds = useMemo(() => {
    return ROUND_ORDER.map((key) => ({
      key,
      label: t(ROUND_LABEL_KEY[key]),
      matches: LOCAL_FIXTURES.filter((fx) => fx.phase === key),
    }));
  }, [t, ROUND_LABEL_KEY]);

  return (
    <div className="gc-bracket-scroll">
      <div className="gc-bracket" role="tree" aria-label="World Cup 2026 knockout bracket">
        {rounds.map((round) => (
          <section key={round.key} className="gc-bracket-column" role="group">
            <h3 className="gc-bracket-column-title">{round.label}</h3>
            <div className="gc-bracket-matches">
              {round.matches.length === 0 ? (
                <div className="gc-bracket-empty">—</div>
              ) : (
                round.matches.map((m) => (
                  <BracketCard key={m.id} match={m} />
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

const BracketCard: React.FC<{ match: LocalFixture }> = ({ match }) => {
  const { t } = useTranslation();
  const status = match.status ?? 'upcoming';
  const homeIsTbd = /^TBD/i.test(match.home);
  const awayIsTbd = /^TBD/i.test(match.away);
  const isLive = status === 'live';
  const isDone = status === 'completed';

  // ¿Quién avanza? Solo si hay marcador y está completado.
  const homeWins = isDone && (match.scoreHome ?? 0) > (match.scoreAway ?? 0);
  const awayWins = isDone && (match.scoreAway ?? 0) > (match.scoreHome ?? 0);

  return (
    <article
      className={`gc-bcard glass-card gc-bcard--${status} ${isLive ? 'gc-bcard--live' : ''}`}
    >
      {isLive && <span className="gc-bcard-live-badge" aria-label="live"><span className="gc-live-dot" aria-hidden />LIVE</span>}

      <div className={`gc-bcard-row ${homeWins ? 'gc-bcard-row--winner' : ''}`}>
        <span className="gc-bcard-flag" aria-hidden>{flagFor(match.home)}</span>
        <span className="gc-bcard-name">{homeIsTbd ? t('fix_tbd') : match.home}</span>
        <span className={`gc-bcard-score ${homeWins ? 'gc-bcard-score--winner' : ''}`}>
          {isDone || isLive ? (match.scoreHome ?? 0) : '–'}
        </span>
      </div>

      <div className="gc-bcard-sep" aria-hidden>
        <span className="gc-bcard-vs">vs</span>
      </div>

      <div className={`gc-bcard-row ${awayWins ? 'gc-bcard-row--winner' : ''}`}>
        <span className="gc-bcard-flag" aria-hidden>{flagFor(match.away)}</span>
        <span className="gc-bcard-name">{awayIsTbd ? t('fix_tbd') : match.away}</span>
        <span className={`gc-bcard-score ${awayWins ? 'gc-bcard-score--winner' : ''}`}>
          {isDone || isLive ? (match.scoreAway ?? 0) : '–'}
        </span>
      </div>

      <div className="gc-bcard-foot">
        {isLive ? (
          <span className="gc-bcard-minute">
            <span className="gc-live-dot" aria-hidden /> {t('fix_live')}
          </span>
        ) : isDone ? (
          <span className="gc-bcard-foot-label">{t('fix_ft')}</span>
        ) : (
          <span className="gc-bcard-foot-label gc-bcard-foot-label--muted">
            {fmtDate(match.date)} · {match.city ?? ''}
          </span>
        )}
      </div>
    </article>
  );
};

/* ------------------------------------------------------------
   Helpers de presentación (banderas emoji + fechas)
   ------------------------------------------------------------ */
const FLAG_MAP: Record<string, string> = {
  'Argentina': '🇦🇷',
  'Brasil': '🇧🇷',
  'México': '🇲🇽',
  'Ee.uu.': '🇺🇸',
  'Canadá': '🇨🇦',
  'Francia': '🇫🇷',
  'Portugal': '🇵🇹',
  'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'España': '🇪🇸',
  'Italia': '🇮🇹',
  'Alemania': '🇩🇪',
  'Uruguay': '🇺🇾',
  'Colombia': '🇨🇴',
  'Japón': '🇯🇵',
};

function flagFor(team: string): string {
  if (/^TBD/i.test(team)) return '⬜';
  return FLAG_MAP[team] ?? '⚽';
}

function fmtDate(iso: string): string {
  try {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

/* ============================================================
   Estilos en línea compartidos (botones). El resto vive en
   index.css bajo el namespace `.gc-fixtures-*` / `.gc-bracket*`.
   ============================================================ */
export const btnStyle: React.CSSProperties = {
  background: '#14f195',
  color: '#000',
  border: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  fontWeight: 'bold',
  cursor: 'pointer',
};
