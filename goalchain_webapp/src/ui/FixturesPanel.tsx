import React, { useCallback, useEffect, useState } from 'react';
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

type Fixture = FixtureView;

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
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [userBets, setUserBets] = useState<UserBetView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [betAmounts, setBetAmounts] = useState<Record<string, string>>({});
  const [submittingFor, setSubmittingFor] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [expandedFixture, setExpandedFixture] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>(t('fix_all') || 'All');

  const addToast = (type: Toast['type'], message: string) => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 6000);
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

  const openExplorer = (signature: string) => {
    const explorer = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
    window.open(explorer, '_blank', 'noopener,noreferrer');
    return explorer;
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
      openExplorer(signature);
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
      openExplorer(signature);
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
      openExplorer(signature);
      addToast('success', `Reembolso enviado ✅ — Explorer abierto.`);
      await refresh();
    } catch (e: any) {
      console.error('refundBet failed', e);
      addToast('error', `No se pudo reembolsar: ${e?.message ?? 'error desconocido'}`);
    } finally {
      setSubmittingFor(null);
    }
  };

  if (loading) return <div>Cargando partidos del Mundial...</div>;

  const groups = ['All', 'Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F', 'Group G', 'Group H', 'Group I', 'Group J', 'Group K', 'Group L'];

  const filteredFixtures = activeFilter === (t('fix_all') || 'All')
    ? fixtures
    : fixtures.filter(f => f.group === activeFilter);

  return (
    <div style={{ position: 'relative' }}>
      {/* Toast container */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
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

      <div className="fixtures-container" style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <h2 style={{ color: '#14f195', margin: 0 }}>{t('fix_title') || 'Fixture — World Cup 2026'}</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['All', 'Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F', 'Group G', 'Group H', 'Group I', 'Group J', 'Group K', 'Group L'].map(group => (
              <button
                key={group}
                onClick={() => setActiveFilter(group)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: activeFilter === group ? 'var(--primary-neon)' : 'rgba(255,255,255,0.03)',
                  color: activeFilter === group ? '#000' : '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(255,75,75,0.1)',
              border: '1px solid rgba(255,75,75,0.35)',
              color: '#ff9ea8',
              borderRadius: '8px',
              padding: '10px',
              textAlign: 'left',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        {filteredFixtures.map((f) => {
          const mine = betForFixture(f.pubkey);
          const canBet = f.status === 'upcoming' || f.status === 'live';
          const canClaim = f.status === 'completed' && mine && !mine.claimed;
          const canRefund = f.status === 'cancelled' && mine && !mine.claimed;
          const isExpanded = expandedFixture === f.pubkey;

          return (
            <div
              key={f.pubkey}
              style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #333',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                onClick={() => setExpandedFixture(isExpanded ? null : f.pubkey)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '0.5rem 0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {f.teamA}
                  </span>
                  <span style={{ color: '#9945ff', fontWeight: 'bold', fontSize: '1.2rem' }}>VS</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {f.teamB}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#888' }}>
                  <span>{f.matchId}</span>
                  <span style={{ color: f.status === 'live' ? 'var(--primary-neon)' : f.status === 'completed' ? '#888' : 'var(--secondary-neon)' }}>
                    {f.status}
                  </span>
                  {f.group && <span>🏆 {f.group}</span>}
                  {f.venue && <span>📍 {f.venue}</span>}
                  {f.matchDate && <span>📅 {new Date(f.matchDate * 1000).toLocaleString()}</span>}
                </div>
                <span style={{ color: isExpanded ? 'var(--primary-neon)' : '#666', fontSize: '1.2rem', transition: 'transform 0.3s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
              </div>

              {isExpanded && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #333', animation: 'slideDown 0.3s ease' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <DetailCard label="Match" value={`${f.teamA} vs ${f.teamB}`} />
                    <DetailCard label="Match ID" value={f.matchId} />
                    <DetailCard label="Group" value={f.group || '—'} />
                    <DetailCard label="Round" value={f.round || '—'} />
                    <DetailCard label="Venue" value={f.venue || '—'} />
                    <DetailCard label="Date/Time" value={f.matchDate ? new Date(f.matchDate * 1000).toLocaleString() : '—'} />
                    <DetailCard label="Status" value={f.status} />
                    <DetailCard label="Pool Total" value={`${f.poolA + f.poolB + f.poolDraw} base units`} />
                  </div>

                  {mine && (
                    <div style={{ fontSize: '0.85rem', marginBottom: '0.8rem', color: '#9fd4ff' }}>
                      Tu apuesta: {mine.amountBaseUnits} base units · predicción {mine.prediction}
                      {mine.claimed ? ' · cobrada' : ' · pendiente'}
                    </div>
                  )}

                  {canBet && (
                    <div style={{ width: '100%', maxWidth: 380, marginBottom: '0.8rem' }}>
                      <input
                        type="text"
                        placeholder="Monto (ej: 1.5)"
                        value={betAmounts[f.pubkey] ?? ''}
                        onChange={(e) => setBetAmounts((prev) => ({ ...prev, [f.pubkey]: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: '1px solid #334',
                          background: '#0f1220',
                          color: '#e8edf7',
                        }}
                      />
                    </div>
                  )}

                  <div className="bet-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {canBet && (
                      <>
                        <button
                          disabled={submittingFor === `${f.pubkey}:A`}
                          onClick={() => handleBet(f.pubkey, 'A')}
                          style={btnStyle}
                        >
                          {submittingFor === `${f.pubkey}:A` ? 'Enviando...' : `Gana ${f.teamA}`}
                        </button>
                        <button
                          disabled={submittingFor === `${f.pubkey}:Draw`}
                          onClick={() => handleBet(f.pubkey, 'Draw')}
                          style={btnStyle}
                        >
                          {submittingFor === `${f.pubkey}:Draw` ? 'Enviando...' : 'Empate'}
                        </button>
                        <button
                          disabled={submittingFor === `${f.pubkey}:B`}
                          onClick={() => handleBet(f.pubkey, 'B')}
                          style={btnStyle}
                        >
                          {submittingFor === `${f.pubkey}:B` ? 'Enviando...' : `Gana ${f.teamB}`}
                        </button>
                      </>
                    )}
                    {canClaim && (
                      <button
                        disabled={submittingFor === `${f.pubkey}:claim`}
                        onClick={() => handleClaim(f.pubkey)}
                        style={{ ...btnStyle, background: '#9945ff', color: '#fff' }}
                      >
                        {submittingFor === `${f.pubkey}:claim` ? 'Cobrando...' : 'Cobrar ganancia'}
                      </button>
                    )}
                    {canRefund && (
                      <button
                        disabled={submittingFor === `${f.pubkey}:refund`}
                        onClick={() => handleRefund(f.pubkey)}
                        style={{ ...btnStyle, background: '#f5a623', color: '#000' }}
                      >
                        {submittingFor === `${f.pubkey}:refund` ? 'Reembolsando...' : 'Reembolsar apuesta'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const betForFixture = (fixturePubkey: string): UserBetView | undefined =>
  userBets.find((b) => b.fixture === fixturePubkey);

const DetailCard = ({ label, value }: { label: string; value: string }) => (
  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid #333' }}>
    <div style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
      {label}
    </div>
    <div style={{ fontWeight: 600, color: '#fff', wordBreak: 'break-word' }}>{value}</div>
  </div>
);

const btnStyle: React.CSSProperties = {
  background: '#14f195',
  color: '#000',
  border: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  fontWeight: 'bold',
  cursor: 'pointer',
};