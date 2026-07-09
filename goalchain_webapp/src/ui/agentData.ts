// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
interface TokenizedAgent {
  id: string;
  name: string;
  roleEn: string;
  roleEs: string;
  icon: string;
  color: string;
  status: 'active' | 'idle' | 'thinking';
  tokenPrice: number;
  change24h: number;
  tasksDone: number;
  uptime: string;
}

// ─────────────────────────────────────────────────────────────────
// Agent registry (matches GoalWorld SOUL.md profiles)
// ─────────────────────────────────────────────────────────────────
const AGENTS: TokenizedAgent[] = [
  { id: 'ceo',      name: 'Hermes CEO',  roleEn: 'Supreme Orchestrator',       roleEs: 'Orquestador Supremo',          icon: '👑', color: '#9945ff', status: 'active',   tokenPrice: 2.47, change24h: 5.2,   tasksDone: 312, uptime: '99.8%' },
  { id: 'dev',      name: 'Dev Agent',    roleEn: 'Web3 Developer',             roleEs: 'Desarrollador Web3',           icon: '⚡', color: '#00e0ff', status: 'thinking', tokenPrice: 1.83, change24h: 3.1,   tasksDone: 287, uptime: '98.5%' },
  { id: 'qa',       name: 'QA Agent',     roleEn: 'Quality Assurance',          roleEs: 'Control de Calidad',           icon: '🔍', color: '#22d3ee', status: 'idle',     tokenPrice: 0.92, change24h: -1.4,  tasksDone: 198, uptime: '97.2%' },
  { id: 'money',    name: 'Money Agent',  roleEn: 'Treasury Operations',        roleEs: 'Operaciones de Tesorería',     icon: '💰', color: '#fbbf24', status: 'active',   tokenPrice: 3.15, change24h: 8.7,   tasksDone: 145, uptime: '99.9%' },
  { id: 'trader',   name: 'Trader Agent', roleEn: 'Predictive Markets',         roleEs: 'Mercados Predictivos',         icon: '📊', color: '#f97316', status: 'thinking', tokenPrice: 4.21, change24h: 12.3,  tasksDone: 423, uptime: '99.1%' },
  { id: 'product',  name: 'Product Agent',roleEn: 'Product Management',         roleEs: 'Gestión de Producto',          icon: '📋', color: '#a78bfa', status: 'idle',     tokenPrice: 1.05, change24h: 0.8,   tasksDone: 89,  uptime: '96.4%' },
  { id: 'creative', name: 'Creative Agent', roleEn: 'Visual Design',            roleEs: 'Diseño Visual',                icon: '🎨', color: '#ec4899', status: 'active',   tokenPrice: 1.67, change24h: -2.3,  tasksDone: 156, uptime: '95.8%' },
  { id: 'research', name: 'Research Agent', roleEn: 'Intelligence & Analysis',  roleEs: 'Inteligencia y Análisis',      icon: '🧠', color: '#14f195', status: 'thinking', tokenPrice: 2.89, change24h: 6.5,   tasksDone: 234, uptime: '98.9%' },
  { id: 'social',   name: 'Social Agent', roleEn: 'Community & Growth',         roleEs: 'Comunidad y Crecimiento',      icon: '📢', color: '#06b6d4', status: 'active',   tokenPrice: 1.34, change24h: 4.1,   tasksDone: 378, uptime: '97.6%' },
  { id: 'default',  name: 'Coordinator',  roleEn: 'Default Coordinator',        roleEs: 'Coordinador General',          icon: '🔧', color: '#64748b', status: 'idle',     tokenPrice: 0.78, change24h: -0.5,  tasksDone: 67,  uptime: '94.1%' },
];

export { AGENTS };
export type { TokenizedAgent };
