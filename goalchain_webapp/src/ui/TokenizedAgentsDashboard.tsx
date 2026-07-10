import React from 'react';
import { SimulationBadge } from '../components/SimulationBadge';
import { useTranslation } from '../i18n';
import { AGENTS, type TokenizedAgent } from './agentData';

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────
function StatusDot({ status }: { status: TokenizedAgent['status'] }) {
  const colors: Record<string, string> = { active: '#14f195', thinking: '#fbbf24', idle: '#64748b' };
  const labels: Record<string, string> = { active: 'ACTIVE', thinking: 'THINKING', idle: 'IDLE' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      <span style={{
        width: '8px', height: '8px', borderRadius: '50%', background: colors[status],
        boxShadow: status === 'active' ? `0 0 6px ${colors[status]}` : 'none',
        animation: status === 'active' ? 'pulse 2s infinite' : status === 'thinking' ? 'pulse 1s infinite' : 'none',
      }} />
      <span style={{ color: colors[status] }}>{labels[status]}</span>
    </span>
  );
}

function AgentCard({ agent, lang }: { agent: TokenizedAgent; lang: string }) {
  const role = lang === 'es' ? agent.roleEs : agent.roleEn;
  const changeColor = agent.change24h >= 0 ? '#14f195' : '#ef4444';
  const changePrefix = agent.change24h >= 0 ? '+' : '';

  return (
    <div className="glass-card" style={{
      padding: '20px', borderRadius: '16px', border: `1px solid ${agent.color}22`,
      background: `linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.8))`,
      transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${agent.color}15`; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.6rem' }}>{agent.icon}</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>{agent.name}</div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>{role}</div>
          </div>
        </div>
        <StatusDot status={agent.status} />
      </div>

      {/* Token price row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '14px' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: agent.color, fontVariantNumeric: 'tabular-nums' }}>
          ${agent.tokenPrice.toFixed(2)}
        </span>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: changeColor }}>
          {changePrefix}{agent.change24h.toFixed(1)}%
        </span>
        <SimulationBadge label="demo" />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.58rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Tasks Done</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{agent.tasksDone}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.58rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Uptime</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#14f195', fontVariantNumeric: 'tabular-nums' }}>{agent.uptime}</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main dashboard
// ─────────────────────────────────────────────────────────────────
export function TokenizedAgentsDashboard() {
  const { language, t } = useTranslation();
  const totalMarketCap = AGENTS.reduce((s, a) => s + a.tokenPrice * 1000, 0);
  const activeCount = AGENTS.filter(a => a.status === 'active').length;
  const totalTasks = AGENTS.reduce((s, a) => s + a.tasksDone, 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '20px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', background: 'rgba(153,69,255,0.15)', border: '1px solid #9945ff', color: '#9945ff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            🤖 AGENT SWARM
          </span>
          <SimulationBadge />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
          {t('agents_title')}
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
          {t('agents_subtitle')}
        </p>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div className="glass-card" style={{ padding: '14px 16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Total Agents</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#9945ff' }}>{AGENTS.length}</div>
        </div>
        <div className="glass-card" style={{ padding: '14px 16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Active Now</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#14f195' }}>{activeCount}</div>
        </div>
        <div className="glass-card" style={{ padding: '14px 16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Market Cap</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>${(totalMarketCap / 1000).toFixed(1)}K <SimulationBadge label="demo" /></div>
        </div>
        <div className="glass-card" style={{ padding: '14px 16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Tasks Completed</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00e0ff' }}>{totalTasks.toLocaleString()}</div>
        </div>
      </div>

      {/* Agent grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {AGENTS.map(agent => (
          <AgentCard key={agent.id} agent={agent} lang={language} />
        ))}
      </div>
    </div>
  );
}
