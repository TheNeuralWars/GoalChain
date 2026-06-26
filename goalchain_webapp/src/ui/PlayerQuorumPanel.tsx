import React, { useState, useEffect, useCallback } from 'react';
import { apiBaseUrl } from '../lib/opsClient';
import { useTranslation } from '../i18n';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface SquadPlayer {
  id: number;
  name: string;
  rarity: 'mythic' | 'legendary' | 'epic' | 'rare' | 'common';
  country: string;
  position: string;
  stats: { atk: number; def: number; hype: number };
  gp: number;
}

interface QuorumResult {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  gp_threshold: number;
  min_players: number;
  quorum_label: string;
  squad_gp: number;
  squad_players: SquadPlayer[];
  quorum_reached: boolean;
  gp_deficit: number;
  players_deficit: number;
  message: string;
}

interface Props {
  /** Prefill an operation to evaluate immediately */
  initialOperation?: string;
  /** Called when quorum is reached and user confirms */
  onQuorumReached?: (result: QuorumResult) => void;
  /** Called when panel is dismissed */
  onDismiss?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const RARITY_COLOR: Record<string, string> = {
  mythic:    '#ffd700',
  legendary: '#9945ff',
  epic:      '#00e0ff',
  rare:      '#14f195',
  common:    '#94a3b8',
};

const RARITY_GLOW: Record<string, string> = {
  mythic:    'rgba(255,215,0,0.4)',
  legendary: 'rgba(153,69,255,0.4)',
  epic:      'rgba(0,224,255,0.3)',
  rare:      'rgba(20,241,149,0.3)',
  common:    'rgba(148,163,184,0.2)',
};

const RISK_COLOR: Record<string, string> = {
  LOW:      '#14f195',
  MEDIUM:   '#fbbf24',
  HIGH:     '#f97316',
  CRITICAL: '#ef4444',
};

const RISK_ICON: Record<string, string> = {
  LOW:      '✅',
  MEDIUM:   '🟡',
  HIGH:     '🟠',
  CRITICAL: '🔴',
};

const FLAG_MAP: Record<string, string> = {
  'Argentina': '🇦🇷', 'Brasil': '🇧🇷', 'Francia': '🇫🇷', 'España': '🇪🇸',
  'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Alemania': '🇩🇪', 'México': '🇲🇽', 'Uruguay': '🇺🇾',
  'Egipto': '🇪🇬', 'Polonia': '🇵🇱', 'Croacia': '🇭🇷', 'Corea del Sur': '🇰🇷',
  'Portugal': '🇵🇹', 'Italia': '🇮🇹', 'Países Bajos': '🇳🇱', 'Bélgica': '🇧🇪',
};

// Sample operations for the interactive demo
const DEMO_OPERATIONS = [
  { labelEn: 'Stripe Pay $200 (HIGH)',       labelEs: 'Pagar Stripe $200 (ALTO)',       opEn: 'Stripe payment $200 for Render.com hosting',     opEs: 'Pago de Stripe de $200 para alojamiento Render.com',     expectedRisk: 'HIGH' },
  { labelEn: 'Deploy to Production (HIGH)',  labelEs: 'Desplegar a Prod (ALTO)',        opEn: 'npm run build && deploy to production server',    opEs: 'npm run build y desplegar al servidor de producción',    expectedRisk: 'HIGH' },
  { labelEn: 'Stripe Pay $600 (CRITICAL)',   labelEs: 'Pagar Stripe $600 (CRÍTICO)',    opEn: 'Stripe transfer payout $600 to external account', opEs: 'Transferencia de Stripe de $600 a cuenta externa', expectedRisk: 'CRITICAL' },
  { labelEn: 'Smart Contract Deploy',        labelEs: 'Desplegar Contrato Inteligente', opEn: 'anchor deploy --provider.cluster mainnet',        opEs: 'anchor deploy --provider.cluster mainnet',        expectedRisk: 'CRITICAL' },
  { labelEn: 'GH Issue Create (MEDIUM)',     labelEs: 'Crear Incidencia GH (MEDIO)',    opEn: 'gh issue create --title "Bug fix" --body "..."',  opEs: 'gh issue create --title "Bug fix" --body "..."',  expectedRisk: 'MEDIUM' },
  { labelEn: 'Health Check (LOW)',           labelEs: 'Comprobar Salud (BAJO)',         opEn: 'systemctl --user is-active oa-worker.service',    opEs: 'systemctl --user is-active oa-worker.service',    expectedRisk: 'LOW' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function GPBar({ current, max, color }: { current: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 100;
  return (
    <div style={{ height: 8, borderRadius: 6, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}>
      <div style={{
        height: '100%', width: `${pct}%`,
        background: `linear-gradient(90deg, ${color}, ${color}88)`,
        borderRadius: 6, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </div>
  );
}

function PlayerCard({
  player, selected, onClick, signerIndex,
}: {
  player: SquadPlayer;
  selected: boolean;
  onClick: () => void;
  signerIndex?: number;
}) {
  const { language } = useTranslation();
  const rColor = RARITY_COLOR[player.rarity] || '#94a3b8';
  const rGlow  = RARITY_GLOW[player.rarity]  || 'transparent';
  const flag   = FLAG_MAP[player.country] || '🏳️';

  const positionText = (pos: string) => {
    if (language !== 'es') return pos;
    const mapping: Record<string, string> = {
      FWD: 'DEL',
      MID: 'MED',
      DEF: 'DFN',
    };
    return mapping[pos] || pos;
  };

  const rarityText = (rarity: string) => {
    if (language !== 'es') return rarity;
    const mapping: Record<string, string> = {
      mythic: 'mítico',
      legendary: 'legendario',
      epic: 'épico',
      rare: 'raro',
      common: 'común',
    };
    return mapping[rarity] || rarity;
  };

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        padding: '14px 12px', borderRadius: '12px',
        background: selected ? `${rColor}15` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${selected ? rColor : 'rgba(255,255,255,0.08)'}`,
        cursor: 'pointer', transition: 'all 0.25s ease',
        boxShadow: selected ? `0 0 20px ${rColor}44` : 'none',
        transform: selected ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* Signer badge */}
      {selected && signerIndex !== undefined && (
        <div style={{
          position: 'absolute', top: -8, right: -8,
          width: 22, height: 22, borderRadius: '50%',
          background: rColor, color: '#000', fontSize: '0.65rem',
          fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 10px ${rColor}44`,
        }}>{signerIndex + 1}</div>
      )}

      {/* Rarity badge */}
      <div style={{
        position: 'absolute', top: 8, left: 8,
        fontSize: '0.55rem', fontWeight: 800, padding: '2px 5px', borderRadius: '4px',
        background: `${rColor}22`, color: rColor, textTransform: 'uppercase', letterSpacing: '0.04em',
      }}>{rarityText(player.rarity)}</div>

      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.9rem' }}>{flag}</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e2e8f0' }}>{player.name}</span>
        </div>
        <div style={{ fontSize: '0.6rem', color: '#64748b', marginBottom: '8px' }}>{positionText(player.position)} · #{player.id.toString().padStart(3, '0')}</div>

        {/* Governance Power */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 }}>{language === 'es' ? '⚖️ PODER GOB' : '⚖️ GOV POWER'}</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: rColor }}>{player.gp.toFixed(1)}</span>
          </div>
          <GPBar current={player.gp} max={300} color={rColor} />
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '6px', fontSize: '0.58rem' }}>
          {[['ATK', player.stats.atk], ['DEF', player.stats.def], ['HYP', player.stats.hype]].map(([label, val]) => (
            <div key={label as string} style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', padding: '3px 0' }}>
              <div style={{ color: '#64748b', fontWeight: 700 }}>{label}</div>
              <div style={{ color: '#e2e8f0', fontWeight: 800 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Panel
// ─────────────────────────────────────────────────────────────────────────────
export function PlayerQuorumPanel({ initialOperation, onQuorumReached, onDismiss }: Props) {
  const apiBase = apiBaseUrl();
  const { language } = useTranslation();
  const tText = useCallback((en: string, es: string) => (language === 'es' ? es : en), [language]);

  const [squad, setSquad]           = useState<SquadPlayer[]>([]);
  const [selected, setSelected]     = useState<Set<number>>(new Set());
  const [operation, setOperation]   = useState(initialOperation || '');
  const [result, setResult]         = useState<QuorumResult | null>(null);
  const [loading, setLoading]       = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [signed, setSigned]         = useState(false);

  // Load demo squad
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const r = await fetch(`${apiBase}/api/ops/quorum/demo-squad`);
        if (r.ok) {
          const d = await r.json();
          setSquad(d.squad);
        }
      } catch {
        // Fallback squad if backend not running
        setSquad([
          { id: 1,  name: 'Lionel Messi',   rarity: 'mythic',    country: 'Argentina', position: 'FWD', stats: { atk: 98, def: 52, hype: 99 }, gp: 212.1 },
          { id: 7,  name: 'Kylian Mbappé',  rarity: 'legendary', country: 'Francia',   position: 'FWD', stats: { atk: 96, def: 45, hype: 94 }, gp: 147.0 },
          { id: 9,  name: 'R. Lewandowski', rarity: 'epic',      country: 'Polonia',   position: 'FWD', stats: { atk: 91, def: 60, hype: 80 }, gp: 119.7 },
          { id: 11, name: 'Mohamed Salah',  rarity: 'rare',      country: 'Egipto',    position: 'MID', stats: { atk: 88, def: 58, hype: 78 }, gp:  91.7 },
          { id: 10, name: 'Luka Modrić',    rarity: 'epic',      country: 'Croacia',   position: 'MID', stats: { atk: 80, def: 79, hype: 87 }, gp: 118.2 },
          { id: 6,  name: 'Virgil van Dijk',rarity: 'rare',      country: 'Países Bajos', position: 'DEF', stats: { atk: 55, def: 94, hype: 75 }, gp:  76.9 },
          { id: 20, name: 'Son Heung-min',  rarity: 'rare',      country: 'Corea del Sur', position: 'MID', stats: { atk: 84, def: 62, hype: 80 }, gp:  72.4 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiBase]);

  // Auto-evaluate when selection or operation changes
  const evaluate = useCallback(async (op: string, ids: number[]) => {
    if (!op.trim()) return;
    setEvaluating(true);
    try {
      const r = await fetch(`${apiBase}/api/ops/quorum/evaluate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: op, player_ids: ids }),
      });
      if (r.ok) setResult(await r.json());
    } catch {
      // Local fallback computation
      const selectedPlayers = squad.filter(p => ids.includes(p.id));
      const totalGP = selectedPlayers.reduce((sum, p) => sum + p.gp, 0);
      setResult({
        risk_level: 'HIGH', gp_threshold: 400, min_players: 2, quorum_label: '🟠 2 squad signers needed',
        squad_gp: totalGP, squad_players: selectedPlayers, quorum_reached: totalGP >= 400 && ids.length >= 2,
        gp_deficit: Math.max(0, 400 - totalGP), players_deficit: Math.max(0, 2 - ids.length),
        message: totalGP >= 400 && ids.length >= 2 ? '⚡ Quorum REACHED' : `❌ Need more GP (${totalGP.toFixed(1)} / 400)`,
      });
    } finally {
      setEvaluating(false);
    }
  }, [apiBase, squad]);

  const handleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      evaluate(operation, Array.from(next));
      return next;
    });
    setSigned(false);
  };

  const handleOperationChange = (op: string) => {
    setOperation(op);
    if (selected.size > 0) evaluate(op, Array.from(selected));
    setSigned(false);
    setResult(null);
  };

  const handleSign = () => {
    if (!result?.quorum_reached) return;
    setSigned(true);
    setTimeout(() => { onQuorumReached?.(result!); }, 1200);
  };

  const RISK_LEVEL_TRANS: Record<string, { en: string; es: string }> = {
    LOW: { en: 'LOW', es: 'BAJO' },
    MEDIUM: { en: 'MEDIUM', es: 'MEDIO' },
    HIGH: { en: 'HIGH', es: 'ALTO' },
    CRITICAL: { en: 'CRITICAL', es: 'CRÍTICO' },
  };

  const getQuorumLabel = (lbl: string) => {
    if (language !== 'es') return lbl;
    if (lbl.includes("No quorum required")) return "✅ No se requiere cuórum";
    if (lbl.includes("1 squad signer needed")) return "🟡 Se necesita 1 firmante del squad";
    if (lbl.includes("2 squad signers needed")) return "🟠 Se necesitan 2 firmantes del squad";
    if (lbl.includes("3 squad signers needed")) return "🔴 Se necesitan 3 firmantes del squad";
    return lbl;
  };

  const localizeMessage = (res: QuorumResult) => {
    const isEs = language === 'es';
    const riskTranslated = isEs ? RISK_LEVEL_TRANS[res.risk_level]?.es : res.risk_level;
    
    if (res.risk_level === 'LOW') {
      return isEs
        ? "✅ Operación clasificada como de riesgo BAJO — ejecutando directamente. No se requiere firma del squad."
        : "✅ Operation classified LOW risk — executing directly. No squad signature required.";
    }

    if (res.quorum_reached) {
      const signerNames = res.squad_players.map(p => p.name).join(', ');
      return isEs
        ? `⚡ ¡Cuórum ALCANZADO! — Operación de riesgo ${riskTranslated} aprobada por ${res.squad_players.length} jugador(es): ${signerNames}. GP Total: ${res.squad_gp.toFixed(1)} / ${res.gp_threshold} requerido. Enjambre de agentes autorizado para proceder.`
        : `⚡ Quorum REACHED — ${res.risk_level} operation approved by ${res.squad_players.length} player(s): ${signerNames}. Total GP: ${res.squad_gp.toFixed(1)} / ${res.gp_threshold} required. Agent swarm authorized to proceed.`;
    } else {
      const deficitStr = isEs
        ? (res.gp_deficit > 0 ? `${res.gp_deficit.toFixed(1)} GP` : `${res.players_deficit} jugador(es) más`)
        : (res.gp_deficit > 0 ? `${res.gp_deficit.toFixed(1)} GP` : `${res.players_deficit} more player(s)`);
      return isEs
        ? `❌ Cuórum NO ALCANZADO — Operación de riesgo ${riskTranslated} bloqueada. Se necesita ${deficitStr} de tu squad para autorizar esta acción. GP actual del squad: ${res.squad_gp.toFixed(1)} / ${res.gp_threshold} requerido.`
        : `❌ Quorum NOT REACHED — ${res.risk_level} operation blocked. Need ${deficitStr} from your squad to authorize this action. Current squad GP: ${res.squad_gp.toFixed(1)} / ${res.gp_threshold} required.`;
    }
  };

  const riskColor = result ? RISK_COLOR[result.risk_level] : '#94a3b8';
  const selectedList = squad.filter(p => selected.has(p.id));
  const selectedGP   = selectedList.reduce((s, p) => s + p.gp, 0);

  return (
    <div style={{
      width: '100%', color: '#fff',
      fontFamily: "'Inter', system-ui, sans-serif",
      display: 'flex', flexDirection: 'column', gap: '1.25rem',
    }}>

      {/* ── HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(251,191,36,0.10))',
        border: '1px solid rgba(239,68,68,0.25)', borderRadius: '14px', padding: '18px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.4rem' }}>⚖️</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>
              {tText('NemoClaw Quorum Protocol', 'Protocolo de Cuórum NemoClaw')}
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', maxWidth: '440px' }}>
            {tText(
              'High-risk agent operations require authorization from your Genesis Squad players. Select signers whose combined ',
              'Las operaciones de agente de alto riesgo requieren autorización de tus jugadores del Genesis Squad. Selecciona firmantes cuyo '
            )}
            <strong style={{ color: '#fbbf24' }}>
              {tText('Governance Power', 'Poder de Gobernanza')}
            </strong>{' '}
            {tText('meets the threshold.', 'acumulado cumpla con el umbral.')}
          </p>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.75rem',
          }}>{tText('✕ Dismiss', '✕ Descartar')}</button>
        )}
      </div>

      {/* ── OPERATION SELECTOR ── */}
      <div style={{
        background: 'rgba(10,10,22,0.7)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px', padding: '16px',
      }}>
        <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {tText('🎯 Operation to Authorize', '🎯 Operación a Autorizar')}
        </div>

        {/* Quick select buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {DEMO_OPERATIONS.map(d => {
            const opVal = language === 'es' ? d.opEs : d.opEn;
            const labelVal = language === 'es' ? d.labelEs : d.labelEn;
            const isSelected = operation === opVal;
            return (
              <button key={opVal} onClick={() => handleOperationChange(opVal)} style={{
                padding: '5px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer',
                background: isSelected ? `${RISK_COLOR[d.expectedRisk]}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isSelected ? RISK_COLOR[d.expectedRisk] : 'rgba(255,255,255,0.08)'}`,
                color: isSelected ? RISK_COLOR[d.expectedRisk] : '#64748b',
                transition: 'all 0.2s',
              }}>{labelVal}</button>
            );
          })}
        </div>

        <textarea
          value={operation}
          onChange={e => handleOperationChange(e.target.value)}
          placeholder={tText(
            "Or type a custom operation: e.g. 'Stripe payment $300 for NVIDIA NIM API credits'",
            "O escribe una operación personalizada: ej. 'Pago Stripe $300 para créditos de API de NVIDIA NIM'"
          )}
          rows={2}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: '8px', resize: 'none',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#e2e8f0', fontSize: '0.78rem', outline: 'none', fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />

        {/* Risk classification badge */}
        {result && (
          <div style={{
            marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '8px',
            background: `${riskColor}11`, border: `1px solid ${riskColor}33`,
          }}>
            <span style={{ fontSize: '1rem' }}>{RISK_ICON[result.risk_level]}</span>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: riskColor }}>
                {tText(result.risk_level + " RISK", "RIESGO " + (RISK_LEVEL_TRANS[result.risk_level]?.es || result.risk_level))} — {getQuorumLabel(result.quorum_label)}
              </div>
              <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '2px' }}>
                {tText(
                  `Requires ≥ ${result.gp_threshold} GP from ≥ ${result.min_players} player(s)`,
                  `Requiere ≥ ${result.gp_threshold} GP de ≥ ${result.min_players} jugador(es)`
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SQUAD SELECTION ── */}
      <div style={{
        background: 'rgba(10,10,22,0.7)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px', padding: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {tText('⚽ Your Genesis Squad — Select Signers', '⚽ Tu Genesis Squad — Seleccionar Firmantes')}
          </div>
          {selected.size > 0 && (
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fbbf24' }}>
              {tText(`${selected.size} selected`, `${selected.size} seleccionados`)} · {selectedGP.toFixed(1)} GP
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.8rem' }}>{tText('Loading squad...', 'Cargando squad...')}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '10px' }}>
            {squad.map((p, idx) => (
              <PlayerCard
                key={p.id}
                player={p}
                selected={selected.has(p.id)}
                onClick={() => handleSelect(p.id)}
                signerIndex={selected.has(p.id) ? Array.from(selected).indexOf(p.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── QUORUM METER ── */}
      {result && result.risk_level !== 'LOW' && (
        <div style={{
          background: 'rgba(10,10,22,0.7)', border: `1px solid ${riskColor}33`,
          borderRadius: '12px', padding: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: riskColor }}>{tText('Quorum Progress', 'Progreso del Cuórum')}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#e2e8f0' }}>
              {evaluating ? '...' : `${result.squad_gp.toFixed(1)} / ${result.gp_threshold} GP`}
            </div>
          </div>
          <GPBar current={result.squad_gp} max={result.gp_threshold} color={riskColor} />
          <div style={{ marginTop: '10px', fontSize: '0.72rem', color: result.quorum_reached ? '#14f195' : '#94a3b8', lineHeight: 1.5 }}>
            {localizeMessage(result)}
          </div>

          {/* Active signers list */}
          {selectedList.length > 0 && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {selectedList.map((p, idx) => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '5px 10px', borderRadius: '20px',
                  background: `${RARITY_COLOR[p.rarity]}18`, border: `1px solid ${RARITY_COLOR[p.rarity]}55`,
                  fontSize: '0.68rem', fontWeight: 700,
                }}>
                  <span style={{ fontWeight: 900, color: RARITY_COLOR[p.rarity] }}>{idx + 1}</span>
                  <span>{p.name}</span>
                  <span style={{ color: RARITY_COLOR[p.rarity] }}>⚖️ {p.gp.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SIGN BUTTON ── */}
      {result && result.risk_level !== 'LOW' && (
        <button
          onClick={handleSign}
          disabled={!result.quorum_reached || signed}
          style={{
            width: '100%', padding: '16px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 900,
            cursor: result.quorum_reached && !signed ? 'pointer' : 'not-allowed',
            background: signed ? '#14f195'
                       : result.quorum_reached ? `linear-gradient(135deg, ${riskColor}, ${riskColor}cc)`
                       : 'rgba(255,255,255,0.04)',
            border: `1px solid ${result.quorum_reached ? riskColor : 'rgba(255,255,255,0.08)'}`,
            color: signed || result.quorum_reached ? (signed ? '#000' : '#fff') : '#475569',
            transition: 'all 0.3s ease',
            boxShadow: result.quorum_reached && !signed ? `0 0 24px ${riskColor}44` : 'none',
            letterSpacing: '0.02em',
          }}
        >
          {signed
            ? tText(
                '✅ Quorum Confirmed — Agent Authorized to Execute',
                '✅ Cuórum Confirmado — Agente Autorizado para Ejecutar'
              )
            : result.quorum_reached
              ? tText(
                  `⚡ Confirm Quorum — Authorize ${result.risk_level} Operation`,
                  `⚡ Confirmar Cuórum — Autorizar Operación de Riesgo ${RISK_LEVEL_TRANS[result.risk_level]?.es || result.risk_level}`
                )
              : tText(
                  `❌ Quorum Insufficient — Need ${result.gp_deficit.toFixed(1)} more GP`,
                  `❌ Cuórum Insuficiente — Faltan ${result.gp_deficit.toFixed(1)} GP`
                )}
        </button>
      )}

      {/* LOW risk shortcut */}
      {result && result.risk_level === 'LOW' && (
        <div style={{
          padding: '14px 16px', borderRadius: '12px', textAlign: 'center',
          background: 'rgba(20,241,149,0.08)', border: '1px solid rgba(20,241,149,0.2)',
          fontSize: '0.82rem', color: '#14f195', fontWeight: 700,
        }}>
          {tText(
            '✅ LOW RISK — NemoClaw approved. No squad signature required. Agent executing directly.',
            '✅ RIESGO BAJO — NemoClaw aprobado. No se requiere firma del squad. El agente se ejecuta directamente.'
          )}
        </div>
      )}
    </div>
  );
}
