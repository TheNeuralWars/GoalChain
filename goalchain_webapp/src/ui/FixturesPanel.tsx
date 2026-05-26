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

type Fixture = FixtureView;

export const FixturesPanel: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [userBets, setUserBets] = useState<UserBetView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [betAmounts, setBetAmounts] = useState<Record<string, string>>({});
  const [submittingFor, setSubmittingFor] = useState<string | null>(null);

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
      alert('¡Conecta tu wallet primero!');
      return;
    }
    const amountUi = (betAmounts[fixturePubkey] ?? '').trim();
    if (!amountUi) {
      alert('Ingresa monto a apostar (token base del protocolo).');
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
      alert(`Apuesta enviada ✅\nExplorer: ${openExplorer(signature)}`);
      await refresh();
    } catch (e: any) {
      console.error('placeBet failed', e);
      alert(`No se pudo enviar la apuesta: ${e?.message ?? 'error desconocido'}`);
    } finally {
      setSubmittingFor(null);
    }
  };

  const handleClaim = async (fixturePubkey: string) => {
    if (!wallet.publicKey) {
      alert('¡Conecta tu wallet primero!');
      return;
    }
    try {
      setSubmittingFor(`${fixturePubkey}:claim`);
      const signature = await claimFixturePayout({
        connection,
        wallet,
        fixture: new PublicKey(fixturePubkey),
      });
      alert(`Cobro enviado ✅\nExplorer: ${openExplorer(signature)}`);
      await refresh();
    } catch (e: any) {
      console.error('claimBetPayout failed', e);
      alert(`No se pudo cobrar: ${e?.message ?? 'error desconocido'}`);
    } finally {
      setSubmittingFor(null);
    }
  };

  const handleRefund = async (fixturePubkey: string) => {
    if (!wallet.publicKey) {
      alert('¡Conecta tu wallet primero!');
      return;
    }
    try {
      setSubmittingFor(`${fixturePubkey}:refund`);
      const signature = await refundFixtureBet({
        connection,
        wallet,
        fixture: new PublicKey(fixturePubkey),
      });
      alert(`Reembolso enviado ✅\nExplorer: ${openExplorer(signature)}`);
      await refresh();
    } catch (e: any) {
      console.error('refundBet failed', e);
      alert(`No se pudo reembolsar: ${e?.message ?? 'error desconocido'}`);
    } finally {
      setSubmittingFor(null);
    }
  };

  if (loading) return <div>Cargando partidos del Mundial...</div>;

  return (
    <div className="fixtures-container" style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
      <h2 style={{ color: '#14f195' }}>Próximos Partidos (devnet on-chain)</h2>
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
      {fixtures.map((f) => {
        const mine = betForFixture(f.pubkey);
        const canBet = f.status === 'upcoming' || f.status === 'live';
        const canClaim = f.status === 'completed' && mine && !mine.claimed;
        const canRefund = f.status === 'cancelled' && mine && !mine.claimed;

        return (
          <div
            key={f.pubkey}
            style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid #333',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', gap: '2rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
              <span>{f.teamA}</span>
              <span style={{ color: '#9945ff' }}>VS</span>
              <span>{f.teamB}</span>
            </div>

            <div style={{ margin: '1rem 0', fontSize: '0.9rem', opacity: 0.7 }}>
              ID: {f.matchId} | Estado: {f.status} | Pool Total: {f.poolA + f.poolB + f.poolDraw} base units
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
        );
      })}
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  background: '#14f195',
  color: '#000',
  border: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  fontWeight: 'bold',
  cursor: 'pointer',
};
