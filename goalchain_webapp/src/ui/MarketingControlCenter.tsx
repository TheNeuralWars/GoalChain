import React, { useState, useEffect, useRef } from 'react';
import { apiBaseUrl } from '../lib/opsClient';

interface Comment {
  timestamp: string;
  text: string;
}

interface MarketingRun {
  id: string;
  timestamp: string;
  account_name: string;
  topic: string;
  status: 'generating' | 'published' | 'failed' | 'planned';
  image_url: string;
  video_url: string;
  post_text: string;
  error_message?: string;
  buffer_post_ids?: string[];
  comments: Comment[];
  narrative_angle?: string;
  image_prompt?: string;
  video_prompt?: string;
}

interface DaemonStatus {
  status: 'idle' | 'running' | 'offline' | 'researching';
  pid?: number;
  last_check?: string;
  is_online: boolean;
  current_run?: {
    account: string;
    run_id: string;
    started_at: string;
  } | null;
}

const ACCOUNT_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  NicoPezDorado: { bg: 'rgba(0,242,234,0.1)', border: 'rgba(0,242,234,0.3)', text: '#00f2ea', label: '🎵 TikTok' },
  GoalChainSol:  { bg: 'rgba(153,69,255,0.1)',  border: 'rgba(153,69,255,0.3)',  text: '#9945ff', label: '📺 YT / IG' },
};

export function MarketingControlCenter() {
  const apiBase = apiBaseUrl();

  const [runs, setRuns] = useState<MarketingRun[]>([]);
  const [daemon, setDaemon] = useState<DaemonStatus>({ status: 'offline', is_online: false });
  const [filter, setFilter] = useState<'all' | 'NicoPezDorado' | 'GoalChainSol'>('all');

  const [targetAccount, setTargetAccount] = useState<'NicoPezDorado' | 'GoalChainSol' | 'both'>('GoalChainSol');
  const [customTopic, setCustomTopic] = useState('');
  const [triggering, setTriggering] = useState(false);
  const [researching, setResearching] = useState(false);

  const [logs, setLogs] = useState<string>('');
  const [activeLogRunId, setActiveLogRunId] = useState<string | null>(null);
  const [showConsole, setShowConsole] = useState(false);

  const [editingRunId, setEditingRunId] = useState<string | null>(null);
  const [editTopic, setEditTopic] = useState('');
  const [editPostText, setEditPostText] = useState('');
  const [editImagePrompt, setEditImagePrompt] = useState('');
  const [editVideoPrompt, setEditVideoPrompt] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const runsRes = await fetch(`${apiBase}/api/marketing/runs`);
        if (runsRes.ok) setRuns(await runsRes.json());

        const daemonRes = await fetch(`${apiBase}/api/marketing/daemon-status`);
        if (daemonRes.ok) {
          const d = await daemonRes.json();
          setDaemon(d);
          if (d.status === 'running' && d.current_run?.run_id) {
            setActiveLogRunId(d.current_run.run_id);
            setShowConsole(true);
          } else if (d.status === 'researching') {
            setActiveLogRunId('research');
            setShowConsole(true);
          }
        }
      } catch {}
    };
    fetchData();
    const iv = setInterval(fetchData, 4000);
    return () => clearInterval(iv);
  }, [apiBase]);

  useEffect(() => {
    if (!activeLogRunId || !showConsole) return;
    let sub = true;
    const fetchLogs = async () => {
      try {
        const r = await fetch(`${apiBase}/api/marketing/runs/${activeLogRunId}/log`);
        if (r.ok && sub) setLogs(await r.text());
      } catch {}
    };
    fetchLogs();
    const iv = setInterval(fetchLogs, 1500);
    return () => { sub = false; clearInterval(iv); };
  }, [activeLogRunId, showConsole, apiBase]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, showConsole]);

  const handleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriggering(true);
    setLogs('Enviando trigger a Hermes...\n');
    setShowConsole(true);
    try {
      const r = await fetch(`${apiBase}/api/marketing/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_name: targetAccount, topic: customTopic.trim() || undefined }),
      });
      const msg = r.ok ? '✅ ¡Hermes despertado! Esperando al daemon...\n' : `❌ Error: ${(await r.json().catch(() => ({ error: r.statusText }))).error}\n`;
      setLogs(prev => prev + msg);
      if (r.ok) setCustomTopic('');
    } catch (err: any) {
      setLogs(prev => prev + `❌ Error de red: ${err.message}\n`);
    } finally {
      setTriggering(false);
    }
  };

  const handleResearch = async () => {
    setResearching(true);
    setLogs('Iniciando análisis de tendencias...\n');
    setActiveLogRunId('research');
    setShowConsole(true);
    try {
      const r = await fetch(`${apiBase}/api/marketing/research`, { method: 'POST' });
      const msg2 = r.ok ? '✅ Agente de investigación activado!\n' : `❌ Error: ${(await r.json().catch(() => ({ error: r.statusText }))).error}\n`;
      setLogs(prev => prev + msg2);
    } catch (err: any) {
      setLogs(prev => prev + `❌ ${err.message}\n`);
    } finally {
      setResearching(false);
    }
  };

  const handleCommentSubmit = async (runId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[runId]?.trim();
    if (!text) return;
    try {
      const r = await fetch(`${apiBase}/api/marketing/runs/${runId}/comment`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
      });
      if (r.ok) {
        const { run } = await r.json();
        setRuns(prev => prev.map(x => x.id === runId ? run : x));
        setCommentInputs(prev => ({ ...prev, [runId]: '' }));
      }
    } catch {}
  };

  const startEdit = (run: MarketingRun) => {
    setEditingRunId(run.id);
    setEditTopic(run.topic || '');
    setEditPostText(run.post_text || '');
    setEditImagePrompt(run.image_prompt || '');
    setEditVideoPrompt(run.video_prompt || '');
  };

  const handleSaveEdit = async (runId: string) => {
    try {
      const r = await fetch(`${apiBase}/api/marketing/runs/${runId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: editTopic, post_text: editPostText, image_prompt: editImagePrompt, video_prompt: editVideoPrompt }),
      });
      if (r.ok) {
        const { run } = await r.json();
        setRuns(prev => prev.map(x => x.id === runId ? run : x));
        setEditingRunId(null);
      }
    } catch {}
  };

  const handleDeleteRun = async (runId: string) => {
    if (!window.confirm('¿Eliminar este video de la cola?')) return;
    try {
      const r = await fetch(`${apiBase}/api/marketing/runs/${runId}`, { method: 'DELETE' });
      if (r.ok) setRuns(prev => prev.filter(x => x.id !== runId));
    } catch {}
  };

  const handleTriggerPlanned = async (runId: string) => {
    setLogs(`Disparando producción de ${runId}...\n`);
    setActiveLogRunId(runId);
    setShowConsole(true);
    try {
      const r = await fetch(`${apiBase}/api/marketing/runs/${runId}/trigger`, { method: 'POST' });
      const msg3 = r.ok ? '✅ Producción en curso!\n' : `❌ Error: ${(await r.json().catch(() => ({ error: r.statusText }))).error}\n`;
      setLogs(prev => prev + msg3);
    } catch {}
  };

  const plannedRuns = runs.filter(r => r.status === 'planned').filter(r => filter === 'all' || r.account_name === filter);
  const historyRuns = runs.filter(r => r.status !== 'planned').filter(r => filter === 'all' || r.account_name === filter);

  const daemonColor = daemon.is_online
    ? (daemon.status === 'researching' ? '#00f2ea' : daemon.status === 'running' ? '#14f195' : 'rgba(255,255,255,0.4)')
    : 'var(--accent-red, #f04)';

  const daemonLabel = daemon.is_online
    ? `● ${daemon.status === 'idle' ? 'IDLE' : daemon.status === 'running' ? 'GENERANDO' : daemon.status === 'researching' ? 'INVESTIGANDO' : daemon.status.toUpperCase()}`
    : '● OFFLINE';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left', width: '100%' }}>

      {/* ── TOP BAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>🦅 Hermes Pilot</h1>
          <span style={{ fontSize: '0.7rem', color: daemonColor, fontWeight: 800, letterSpacing: '0.5px' }}>
            {daemonLabel}
          </span>
          {daemon.is_online && daemon.pid && (
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>PID {daemon.pid}</span>
          )}
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {(['all', 'GoalChainSol', 'NicoPezDorado'] as const).map(f => (
            <button
              key={f}
              id={`filter-${f}`}
              onClick={() => setFilter(f)}
              style={{
                padding: '4px 10px', borderRadius: '14px', fontSize: '0.68rem', fontWeight: 700,
                background: filter === f ? 'var(--secondary-neon, #9945ff)' : 'rgba(255,255,255,0.04)',
                color: '#fff', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {f === 'all' ? 'Todo' : f}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTROL STRIP ── */}
      <div className="glass-card" style={{ padding: '0.9rem 1rem' }}>
        <form onSubmit={handleTrigger} style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            id="target-account-select"
            className="form-select"
            value={targetAccount}
            onChange={e => setTargetAccount(e.target.value as any)}
            style={{ padding: '6px 10px', fontSize: '0.82rem', borderRadius: '8px', flex: '0 0 auto' }}
          >
            <option value="GoalChainSol">GoalChainSol</option>
            <option value="NicoPezDorado">NicoPezDorado</option>
            <option value="both">Ambas</option>
          </select>

          <input
            id="custom-topic-input"
            type="text"
            placeholder="Tema (vacío = auto-análisis de Hermes)"
            value={customTopic}
            onChange={e => setCustomTopic(e.target.value)}
            style={{
              flex: 1, minWidth: '180px', padding: '6px 10px',
              background: 'rgba(10,10,20,0.8)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff', borderRadius: '8px', fontSize: '0.82rem', outline: 'none',
            }}
          />

          <button
            id="wake-hermes-btn"
            type="submit"
            disabled={triggering || !daemon.is_online}
            className="btn-neon-purple"
            style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {triggering ? '...' : '🚀 Wake'}
          </button>

          <button
            id="fill-queue-btn"
            type="button"
            onClick={handleResearch}
            disabled={researching || !daemon.is_online}
            className="btn-neon-green"
            style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {researching ? '...' : '🧠 Llenar Cola'}
          </button>

          <button
            id="toggle-console-btn"
            type="button"
            onClick={() => setShowConsole(v => !v)}
            style={{
              padding: '6px 10px', borderRadius: '8px', fontSize: '0.75rem',
              background: showConsole ? 'rgba(20,241,149,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${showConsole ? 'rgba(20,241,149,0.3)' : 'rgba(255,255,255,0.06)'}`,
              color: showConsole ? '#14f195' : 'rgba(255,255,255,0.5)', cursor: 'pointer',
            }}
          >
            📟 Log
          </button>
        </form>

        {/* Inline warning when offline */}
        {!daemon.is_online && (
          <p style={{ margin: '6px 0 0 0', fontSize: '0.7rem', color: '#f04', opacity: 0.9 }}>
            ⚠️ Hermes está durmiendo. Ejecuta <code>pm2 start hermes-video-daemon</code> en el VPS.
          </p>
        )}
      </div>

      {/* ── CONSOLE (collapsible) ── */}
      {showConsole && (
        <div className="glass-card" style={{ padding: '0.75rem', border: '1px solid rgba(20,241,149,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.68rem', color: '#14f195', fontWeight: 800 }}>🟢 CONSOLA VPS (LIVE)</span>
            <button onClick={() => setShowConsole(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
          </div>
          <div style={{
            height: '130px', overflowY: 'auto', whiteSpace: 'pre-wrap',
            fontSize: '0.72rem', lineHeight: '1.4', color: '#14f195',
            background: '#040409', padding: '8px', borderRadius: '6px', fontFamily: 'monospace',
          }}>
            {logs || 'Iniciando...'}
            <div ref={terminalEndRef} />
          </div>
        </div>
      )}

      {/* ── PLANNED QUEUE ── */}
      {plannedRuns.length > 0 && (
        <div>
          <h3 style={{ margin: '0 0 0.6rem 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-neon, #14f195)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📅 Cola ({plannedRuns.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {plannedRuns.map(run => {
              const acct = ACCOUNT_COLORS[run.account_name] ?? ACCOUNT_COLORS.GoalChainSol;
              const isEditing = editingRunId === run.id;
              return (
                <div key={run.id} className="glass-card" style={{ padding: '0.75rem 1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {/* Row 1: badge + id + actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: acct.bg, border: `1px solid ${acct.border}`, color: acct.text }}>
                      {acct.label}
                    </span>
                    {!isEditing && <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{run.topic}</span>}
                    <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                      {!isEditing ? (
                        <>
                          <button onClick={() => startEdit(run)} className="btn-outline-green" style={{ padding: '2px 8px', fontSize: '0.68rem', borderRadius: '6px', cursor: 'pointer' }}>✍️</button>
                          <button onClick={() => handleTriggerPlanned(run.id)} className="btn-neon-purple" style={{ padding: '2px 8px', fontSize: '0.68rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 800 }} disabled={!daemon.is_online}>🚀</button>
                          <button onClick={() => handleDeleteRun(run.id)} className="btn-outline-red" style={{ padding: '2px 8px', fontSize: '0.68rem', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleSaveEdit(run.id)} className="btn-neon-green" style={{ padding: '2px 10px', fontSize: '0.68rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 800 }}>💾</button>
                          <button onClick={() => setEditingRunId(null)} className="btn-outline-red" style={{ padding: '2px 10px', fontSize: '0.68rem', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Edit fields */}
                  {isEditing && (
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input type="text" value={editTopic} onChange={e => setEditTopic(e.target.value)} placeholder="Tema" style={{ padding: '5px 8px', background: '#0a0a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.8rem', width: '100%' }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <textarea value={editImagePrompt} onChange={e => setEditImagePrompt(e.target.value)} rows={2} placeholder="Image prompt" style={{ padding: '5px 8px', background: '#0a0a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'monospace' }} />
                        <textarea value={editVideoPrompt} onChange={e => setEditVideoPrompt(e.target.value)} rows={2} placeholder="Video prompt" style={{ padding: '5px 8px', background: '#0a0a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'monospace' }} />
                      </div>
                      <textarea value={editPostText} onChange={e => setEditPostText(e.target.value)} rows={3} placeholder="Post copy" style={{ padding: '5px 8px', background: '#0a0a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.78rem', width: '100%', lineHeight: 1.4 }} />
                    </div>
                  )}

                  {/* Comment steering row */}
                  {!isEditing && (
                    <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {run.comments?.map((c, i) => (
                        <div key={i} style={{ fontSize: '0.68rem', color: '#a0aec0', background: 'rgba(255,255,255,0.02)', padding: '3px 6px', borderRadius: '5px' }}>
                          <span style={{ color: 'var(--primary-neon, #14f195)', fontWeight: 700, marginRight: '4px' }}>Dir:</span>{c.text}
                        </div>
                      ))}
                      <form onSubmit={e => handleCommentSubmit(run.id, e)} style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="text" placeholder="Opiná sobre este plan..."
                          value={commentInputs[run.id] || ''}
                          onChange={e => setCommentInputs(p => ({ ...p, [run.id]: e.target.value }))}
                          style={{ flex: 1, padding: '4px 8px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', borderRadius: '6px', fontSize: '0.7rem', outline: 'none' }}
                        />
                        <button type="submit" className="btn-outline-green" style={{ padding: '4px 10px', fontSize: '0.68rem', borderRadius: '6px', cursor: 'pointer' }}>💬</button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── HISTORY ── */}
      <div>
        <h3 style={{ margin: '0 0 0.6rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
          📽️ Historial ({historyRuns.length})
        </h3>

        {historyRuns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px' }} className="glass-card">
            <span style={{ fontSize: '1.5rem' }}>💤</span>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: '6px 0 0 0' }}>Sin registros todavía.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {historyRuns.map(run => {
              const acct = ACCOUNT_COLORS[run.account_name] ?? ACCOUNT_COLORS.GoalChainSol;
              const isGenerating = run.status === 'generating';
              const isFailed = run.status === 'failed';
              const isPublished = run.status === 'published';

              return (
                <div key={run.id} className="glass-card" style={{
                  padding: '0.9rem 1rem',
                  border: isGenerating ? '1px solid rgba(20,241,149,0.3)' : isFailed ? '1px solid rgba(255,60,60,0.25)' : '1px solid rgba(255,255,255,0.04)',
                }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.58rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: acct.bg, border: `1px solid ${acct.border}`, color: acct.text }}>
                      {acct.label}
                    </span>
                    <span style={{ flex: 1, fontSize: '0.92rem', fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{run.topic}</span>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
                      {new Date(run.timestamp).toLocaleString()}
                    </span>
                    {isGenerating && <span style={{ fontSize: '0.68rem', color: '#14f195', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}><span className="pulse-dot" /> GEN...</span>}
                    {isFailed && <span style={{ fontSize: '0.68rem', color: '#f04', fontWeight: 800 }}>❌ ERROR</span>}
                    {isPublished && <span style={{ fontSize: '0.68rem', color: '#14f195', fontWeight: 800 }}>✅ BUFFER</span>}
                  </div>

                  {/* Content row */}
                  {isFailed ? (
                    <div style={{ fontSize: '0.75rem', color: '#fca5a5', background: 'rgba(255,60,60,0.04)', border: '1px solid rgba(255,60,60,0.15)', padding: '6px 10px', borderRadius: '6px' }}>
                      {run.error_message || 'Grok CLI terminó abruptamente.'}
                      <button onClick={() => { setActiveLogRunId(run.id); setShowConsole(true); }} style={{ marginLeft: '10px', background: 'rgba(255,255,255,0.04)', border: 'none', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer' }}>🔎 Log</button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: run.video_url || run.image_url ? 'auto 1fr' : '1fr', gap: '10px', alignItems: 'start' }}>
                      {/* Media thumbnail */}
                      {(run.video_url || run.image_url) && (
                        <div style={{ width: '90px', height: '120px', borderRadius: '8px', overflow: 'hidden', background: '#040408', flexShrink: 0 }}>
                          {run.video_url
                            ? <video src={run.video_url} controls loop muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <img src={run.image_url} alt="frame" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                      )}
                      {/* Text + comments */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                        {run.post_text && (
                          <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.45, maxHeight: '80px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                            {run.post_text}
                          </div>
                        )}
                        {isGenerating && !run.post_text && (
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Generando copywriting...</span>
                        )}
                        {/* Comment form */}
                        <form onSubmit={e => handleCommentSubmit(run.id, e)} style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                          <input
                            type="text" placeholder="Feedback para Hermes..."
                            value={commentInputs[run.id] || ''}
                            onChange={e => setCommentInputs(p => ({ ...p, [run.id]: e.target.value }))}
                            style={{ flex: 1, padding: '4px 8px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', borderRadius: '6px', fontSize: '0.7rem', outline: 'none' }}
                          />
                          <button type="submit" className="btn-outline-green" style={{ padding: '4px 8px', fontSize: '0.68rem', borderRadius: '6px', cursor: 'pointer' }}>💬</button>
                          <button type="button" className="btn-outline-red" onClick={() => { setActiveLogRunId(run.id); setShowConsole(true); }} style={{ padding: '4px 8px', fontSize: '0.68rem', borderRadius: '6px', cursor: 'pointer' }}>🔎</button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
