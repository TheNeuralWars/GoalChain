import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { claimFixturePayout, type FixtureView, type UserBetView } from '../../lib/goalchainClient';
import { useClaimableMarkets } from '../../hooks/oracle/useClaimableMarkets';
import { useTranslation } from '../../i18n';
import { SimulationBadge } from '../../components/ui/SimulationBadge';

interface Toast {
  id: number;
  type: 'success' | 'error' | 'warn';
  message: string;
}

let toastCounter = 0;

export const ClaimDashboard: React.FC = () => {
  const navigate = useNavigate();
  const wallet = useWallet();
  const { t } = useTranslation();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [claimingFor, setClaimingFor] = useState<string | null>(null);
  const [expandedFixture, setExpandedFixture] = useState<string | null>(null);

  const {
    claimableMarkets,
    allUserMarkets,
    loading,
    error,
    refetch,
  } = useClaimableMarkets();

  const addToast = (type: Toast['type'], message: string) => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 6000);
  };

  const handleClaim = async (fixturePubkey: string, fixture: FixtureView) => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      addToast('warn', t('claim_wallet_required') || '¡Conecta tu wallet primero!');
      return;
    }

    try {
      setClaimingFor(fixturePubkey);
      const signature = await claimFixturePayout({
        connection: (window as any).solanaConnection, // Will need proper connection
        wallet,
        fixture: new PublicKey(fixturePubkey),
      });

      const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
      window.open(explorerUrl, '_blank', 'noopener,noreferrer');

      addToast('success', t('claim_success') || 'Cobro enviado ✅ — Explorer abierto.');
      await refetch();
    } catch (e: any) {
      console.error('claim failed:', e);
      addToast('error', `${t('claim_error') || 'No se pudo cobrar'}: ${e?.message ?? 'error desconocido'}`);
    } finally {
      setClaimingFor(null);
    }
  };

  // Update connection from wallet context
  useEffect(() => {
    if (wallet.adapter && wallet.adapter.connection) {
      (window as any).solanaConnection = wallet.adapter.connection;
    }
  }, [wallet.adapter]);

  if (loading) {
    return (
      <div className="claim-dashboard">
        <div className="claim-dashboard-loading">Cargando mercados reclamables...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="claim-dashboard">
        <div className="claim-dashboard-error">
          <p>Error: {error}</p>
          <button onClick={refetch} className="btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!wallet.publicKey) {
    return (
      <div className="claim-dashboard">
        <div className="claim-dashboard-empty">
          <h2>{t('claim_connect_wallet') || 'Conecta tu wallet para ver tus cobros disponibles'}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="claim-dashboard">
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

      <div className="claim-dashboard-header">
        <h1>{t('claim_title') || 'Mis Cobros Disponibles'}</h1>
        <p className="claim-dashboard-subtitle">
          {t('claim_subtitle') || 'Partidos finalizados con apuestas ganadoras por cobrar'}
        </p>
        {claimableMarkets.length > 0 && (
          <SimulationBadge showNetwork compact />
        )}
      </div>

      {claimableMarkets.length === 0 && allUserMarkets.length === 0 ? (
        <div className="claim-dashboard-empty">
          <div className="empty-icon">🏆</div>
          <h3>{t('claim_no_bets') || 'No tienes apuestas activas'}</h3>
          <p>{t('claim_no_bets_desc') || 'Ve al Estadio y haz tu primera apuesta en un partido del Mundial'}</p>
          <Link to="/estadio" className="btn-neon-green">
            Ir al Estadio →
          </Link>
        </div>
      ) : claimableMarkets.length === 0 ? (
        <div className="claim-dashboard-empty">
          <div className="empty-icon">⏳</div>
          <h3>{t('claim_none_ready') || 'No hay cobros disponibles ahora'}</h3>
          <p>{t('claim_none_ready_desc') || 'Tus apuestas están en partidos que aún no han finalizado o ya fueron cobradas'}</p>
          <button onClick={refetch} className="btn-secondary">
            Actualizar
          </button>
        </div>
      ) : (
        <div className="claim-dashboard-grid">
          {claimableMarkets.map(({ fixture, userBet, estimatedClaimAmount }) => (
            <div
              key={fixture.pubkey}
              className={`claim-card ${expandedFixture === fixture.pubkey ? 'expanded' : ''}`}
              onClick={() => setExpandedFixture(expandedFixture === fixture.pubkey ? null : fixture.pubkey)}
            >
              <div className="claim-card-header">
                <div className="claim-match">
                  <span className="team">{fixture.teamA}</span>
                  <span className="vs">VS</span>
                  <span className="team">{fixture.teamB}</span>
                </div>
                <div className="claim-status">
                  <span className={`status-badge status-${fixture.status}`}>
                    {fixture.status === 'completed' ? (t('fix_completed') || 'Finalizado') : fixture.status}
                  </span>
                  <SimulationBadge compact />
                </div>
              </div>

              <div className="claim-card-body">
                <div className="claim-bet-info">
                  <div className="bet-detail">
                    <span className="label">{t('claim_your_bet') || 'Tu apuesta'}</span>
                    <span className="value">{userBet.amountBaseUnits} base units · {userBet.prediction}</span>
                  </div>
                  <div className="bet-detail highlight">
                    <span className="label">{t('claim_estimated') || 'Estimado a cobrar'}</span>
                    <span className="value amount">{estimatedClaimAmount} base units</span>
                  </div>
                </div>

                <div className="claim-match-meta">
                  <span>🏆 {fixture.group || '—'}</span>
                  {fixture.matchDate && (
                    <span>📅 {new Date(fixture.matchDate * 1000).toLocaleString()}</span>
                  )}
                </div>

                <button
                  className={`btn-claim ${claimingFor === fixture.pubkey ? 'claiming' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClaim(fixture.pubkey, fixture);
                  }}
                  disabled={claimingFor === fixture.pubkey}
                >
                  {claimingFor === fixture.pubkey
                    ? t('claim_claiming') || 'Cobrando...'
                    : t('claim_action') || 'Cobrar Ganancia'}
                </button>
              </div>

              {expandedFixture === fixture.pubkey && (
                <div className="claim-card-expanded">
                  <div className="expanded-detail">
                    <h4>{t('claim_match_details') || 'Detalles del Partido'}</h4>
                    <div className="detail-grid">
                      <div><span>Match ID:</span> {fixture.matchId}</div>
                      <div><span>Group:</span> {fixture.group || '—'}</div>
                      <div><span>Round:</span> {fixture.round || '—'}</div>
                      <div><span>Venue:</span> {fixture.venue || '—'}</div>
                      <div><span>Date:</span> {fixture.matchDate ? new Date(fixture.matchDate * 1000).toLocaleString() : '—'}</div>
                      <div><span>Pool A:</span> {fixture.poolA}</div>
                      <div><span>Pool B:</span> {fixture.poolB}</div>
                      <div><span>Pool Draw:</span> {fixture.poolDraw}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Other user markets (not claimable yet) */}
      {allUserMarkets.length > claimableMarkets.length && (
        <div className="claim-dashboard-section">
          <h3>{t('claim_other_bets') || 'Otras apuestas activas'}</h3>
          <div className="claim-dashboard-list">
            {allUserMarkets
              .filter((m) => m.fixture.status !== 'completed' || m.userBet.claimed)
              .map(({ fixture, userBet }) => (
                <div key={fixture.pubkey} className="claim-list-item">
                  <div className="list-match">
                    <span>{fixture.teamA} vs {fixture.teamB}</span>
                  </div>
                  <div className="list-bet">
                    <span className={`status status-${fixture.status}`}>{fixture.status}</span>
                    <span>{userBet.amountBaseUnits} base units · {userBet.prediction}</span>
                    {userBet.claimed && <span className="claimed-badge">{t('fix_claimed') || 'Cobrado'}</span>}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};