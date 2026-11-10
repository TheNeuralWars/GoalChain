// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
interface TokenizedAgent {
  id: string;
  name: string;
  roleEn: string;
  roleEs: string;
  roleIt: string;
  icon: string;
  color: string;
  status: 'active' | 'idle' | 'thinking';
  telemetryScore: number;
  change24h: number;
  tasksDone: number;
  uptime: string;
}

// ─────────────────────────────────────────────────────────────────
// Agent registry (matches GoalWorld SOUL.md profiles — Devnet telemetry)
// ─────────────────────────────────────────────────────────────────
const AGENTS: TokenizedAgent[] = [
  { id: 'ceo',      name: 'Hermes CEO',     roleEn: 'Supreme Orchestrator',      roleEs: 'Orquestador Supremo',       roleIt: 'Orchestratore Supremo',      icon: '👑', color: '#9945ff', status: 'active',   telemetryScore: 99.4, change24h: 5.2,   tasksDone: 312, uptime: '99.8%' },
  { id: 'dev',      name: 'Dev Agent',      roleEn: 'Web3 & Systems Developer',  roleEs: 'Desarrollador de Sistemas', roleIt: 'Sviluppatore di Sistemi',    icon: '⚡', color: '#00e0ff', status: 'thinking', telemetryScore: 97.8, change24h: 3.1,   tasksDone: 287, uptime: '98.5%' },
  { id: 'qa',       name: 'QA Agent',       roleEn: 'Quality Assurance',         roleEs: 'Control de Calidad',        roleIt: 'Controllo Qualità',          icon: '🔍', color: '#22d3ee', status: 'idle',     telemetryScore: 96.2, change24h: 1.4,   tasksDone: 198, uptime: '97.2%' },
  { id: 'money',    name: 'Treasury Agent', roleEn: 'Devnet Pool Telemetry',     roleEs: 'Telemetría de Pools',       roleIt: 'Telemetria dei Pool',        icon: '🛡️', color: '#fbbf24', status: 'active',   telemetryScore: 98.9, change24h: 4.7,   tasksDone: 145, uptime: '99.9%' },
  { id: 'trader',   name: 'Oracle Agent',   roleEn: 'Matchday Oracle Sync',      roleEs: 'Sincronización de Oráculo', roleIt: 'Sincronizzazione Oracolo',   icon: '📊', color: '#f97316', status: 'thinking', telemetryScore: 98.1, change24h: 6.3,   tasksDone: 423, uptime: '99.1%' },
  { id: 'product',  name: 'Product Agent',  roleEn: 'Product Management',        roleEs: 'Gestión de Producto',       roleIt: 'Gestione Prodotto',          icon: '📋', color: '#a78bfa', status: 'idle',     telemetryScore: 95.0, change24h: 0.8,   tasksDone: 89,  uptime: '96.4%' },
  { id: 'creative', name: 'Cinema Agent',   roleEn: 'Visual & Cinema Pipeline',  roleEs: 'Pipeline Visual y Cine',    roleIt: 'Pipeline Visiva e Cinema',   icon: '🎨', color: '#ec4899', status: 'active',   telemetryScore: 96.7, change24h: 2.3,   tasksDone: 156, uptime: '95.8%' },
  { id: 'research', name: 'Lore Agent',     roleEn: 'Canon & Continuity Audit',  roleEs: 'Auditoría de Canon y Lore', roleIt: 'Audit di Canone e Continuità', icon: '🧠', color: '#14f195', status: 'thinking', telemetryScore: 98.5, change24h: 6.5,   tasksDone: 234, uptime: '98.9%' },
  { id: 'social',   name: 'Studio Herald',  roleEn: 'Release Feed & Dispatch',   roleEs: 'Boletín y Despacho',        roleIt: 'Bollettino e Dispatch',      icon: '📢', color: '#06b6d4', status: 'active',   telemetryScore: 97.1, change24h: 4.1,   tasksDone: 378, uptime: '97.6%' },
  { id: 'default',  name: 'Coordinator',    roleEn: 'Default Coordinator',       roleEs: 'Coordinador General',       roleIt: 'Coordinatore Generale',      icon: '🔧', color: '#64748b', status: 'idle',     telemetryScore: 94.2, change24h: 0.5,   tasksDone: 67,  uptime: '94.1%' },
];

export { AGENTS };
export type { TokenizedAgent };
