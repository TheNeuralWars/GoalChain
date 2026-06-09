import React, { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { fetchFixtures } from '../lib/goalchainClient';
import { useTranslation } from '../i18n';

interface Event {
    id: number;
    type: 'GOAL' | 'BET' | 'RESOLVE';
    message: string;
    time: string;
}

export const LiveEventFeed: React.FC = () => {
    const { connection } = useConnection();
    const { t } = useTranslation();
    const [events, setEvents] = useState<Event[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const refresh = async () => {
            try {
                const fixtures = await fetchFixtures(connection);
                if (!mounted) return;
                const next = fixtures.slice(0, 5).map((f, idx) => {
                    const total = f.poolA + f.poolB + f.poolDraw;
                    const type: Event['type'] = f.status === 'completed' ? 'RESOLVE' : (f.status === 'live' ? 'GOAL' : 'BET');
                    return {
                        id: Number(`${Date.now()}${idx}`),
                        type,
                        message: `${f.matchId}: ${f.teamA} vs ${f.teamB} | estado=${f.status} | pool=${total}`,
                        time: 'On-chain snapshot',
                    };
                });
                setEvents(next);
                setError(null);
            } catch (e) {
                if (!mounted) return;
                setError(t('oracle_error_feed') || 'No se pudo actualizar el feed on-chain.');
                setEvents([]);
            }
        };
        refresh();
        const interval = setInterval(refresh, 15000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [connection]);

    const oracleLogs = [
        t('oracle_log_connected') || '[Oracle] Conexión inicializada. Esperando actualizaciones...',
        t('oracle_log_validator') || '[Oracle] Conexión con validador de Solana establecida.',
        t('oracle_log_authority') || '[Oracle] Oracle Authority verificado.',
        t('oracle_log_fixture_init') || '[Oracle] Inicializando fixture: Argentina vs Francia (WC2026_FINAL)',
        t('oracle_log_fixture_ready') || '[Oracle] Fixture inicializado en la blockchain.',
        t('oracle_log_market_create') || '[Oracle] Creando Live Market on-chain...',
        t('oracle_log_market_ready') || '[Oracle] Live Market creado exitosamente.',
        t('oracle_log_goal') || '[Oracle] ¡GOOOOL!',
        t('oracle_log_market_close') || '[Oracle] Cerrando Live Market...',
        t('oracle_log_resolving') || '[Oracle] Resolviendo Live Market...',
        t('oracle_log_settle') || '[Oracle] Liquidando pools y distribuyendo GCH atómicamente.',
        t('oracle_log_half_time') || '[Oracle] Medio tiempo. Estado de fixture actualizado.',
        t('oracle_log_market_open_2') || '[Oracle] Abriendo Live Market 2. Status: ABIERTO',
        t('oracle_log_final') || '[Oracle] ¡FIN DEL PARTIDO! Resolviendo pools pre-match...',
        t('oracle_log_complete') || '[Oracle] Fixture completado exitosamente en Blockchain.',
        t('oracle_log_waiting') || 'Oracle esperando nuevo partido en vivo.',
    ];

    return (
        <div className="live-feed" style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'rgba(20, 241, 149, 0.05)',
            borderLeft: '4px solid #14f195',
            borderRadius: '0 12px 12px 0',
            textAlign: 'left'
        }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="pulse-dot"></span> {t('oracle_feed_title') || 'On-Chain Live Feed (Helius)'}
            </h3>
            {error && (
                <div style={{ color: '#ff9ea8', fontSize: '0.8rem', marginBottom: 10 }}>{error}</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {events.length === 0 && !error && (
                    <div style={{ fontSize: '0.85rem', opacity: 0.75 }}>{t('oracle_no_events') || 'Sin eventos recientes on-chain para mostrar.'}</div>
                )}
                {events.map(event => (
                    <div key={event.id} style={{
                        fontSize: '0.85rem',
                        padding: '8px',
                        background: '#111',
                        borderRadius: '4px',
                        border: '1px solid #222'
                    }}>
                        <span style={{
                            color: event.type === 'GOAL' ? '#ff4b4b' : '#14f195',
                            fontWeight: 'bold',
                            marginRight: '8px'
                        }}>
                            [{event.type}]
                        </span>
                        {event.message}
                        <span style={{ float: 'right', opacity: 0.5 }}>{event.time}</span>
                    </div>
                ))}

                {/* Oracle Log Stream */}
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', opacity: 0.7 }}>
                    {t('oracle_log_title') || 'Oracle Log Stream'}
                  </h4>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', opacity: 0.6, lineHeight: '1.8' }}>
                    {oracleLogs.map((log, i) => (
                      <div key={i} style={{ marginBottom: '2px', opacity: 0.7 }}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
            </div>

            <style>{`
                .pulse-dot {
                    width: 10px;
                    height: 10px;
                    background: #14f195;
                    border-radius: 50%;
                    box-shadow: 0 0 0 0 rgba(20, 241, 149, 0.7);
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(20, 241, 149, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(20, 241, 149, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(20, 241, 149, 0); }
                }
            `}</style>
        </div>
    );
};