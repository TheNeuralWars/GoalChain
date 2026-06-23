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

export function MarketingControlCenter() {
  const apiBase = apiBaseUrl();
  
  const [runs, setRuns] = useState<MarketingRun[]>([]);
  const [daemon, setDaemon] = useState<DaemonStatus>({ status: 'offline', is_online: false });
  const [filter, setFilter] = useState<'all' | 'NicoPezDorado' | 'GoalChainSol'>('all');
  
  // Trigger form states
  const [targetAccount, setTargetAccount] = useState<'NicoPezDorado' | 'GoalChainSol' | 'both'>('GoalChainSol');
  const [customTopic, setCustomTopic] = useState('');
  const [triggering, setTriggering] = useState(false);
  const [researching, setResearching] = useState(false);
  
  // Real-time terminal states
  const [logs, setLogs] = useState<string>('');
  const [activeLogRunId, setActiveLogRunId] = useState<string | null>(null);
  const [showConsole, setShowConsole] = useState(false);
  
  // Editing planned run states
  const [editingRunId, setEditingRunId] = useState<string | null>(null);
  const [editTopic, setEditTopic] = useState('');
  const [editPostText, setEditPostText] = useState('');
  const [editImagePrompt, setEditImagePrompt] = useState('');
  const [editVideoPrompt, setEditVideoPrompt] = useState('');
  
  // Comment inputs per run
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // 1. Poll runs and daemon status on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch runs
        const runsRes = await fetch(`${apiBase}/api/marketing/runs`);
        if (runsRes.ok) {
          const runsData = await runsRes.json();
          setRuns(runsData);
        }
        
        // Fetch daemon status
        const daemonRes = await fetch(`${apiBase}/api/marketing/daemon-status`);
        if (daemonRes.ok) {
          const daemonData = await daemonRes.json();
          setDaemon(daemonData);
          
          // Auto-detect active running/researching log
          if (daemonData.status === 'running' && daemonData.current_run?.run_id) {
            setActiveLogRunId(daemonData.current_run.run_id);
            setShowConsole(true);
          } else if (daemonData.status === 'researching') {
            setActiveLogRunId('research');
            setShowConsole(true);
          }
        }
      } catch (err) {
        console.error('Error fetching marketing data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 4000); // Poll every 4 seconds
    return () => clearInterval(interval);
  }, [apiBase]);

  // 2. Poll active run logs when console is open and activeLogRunId is set
  useEffect(() => {
    if (!activeLogRunId || !showConsole) return;

    let isSubscribed = true;
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${apiBase}/api/marketing/runs/${activeLogRunId}/log`);
        if (res.ok) {
          const text = await res.text();
          if (isSubscribed) {
            setLogs(text);
          }
        }
      } catch (err) {
        // Log file might not be created yet, ignore
      }
    };

    fetchLogs();
    const logInterval = setInterval(fetchLogs, 1500); // Poll logs every 1.5 seconds

    return () => {
      isSubscribed = false;
      clearInterval(logInterval);
    };
  }, [activeLogRunId, showConsole, apiBase]);

  // 3. Auto-scroll terminal console
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, showConsole]);

  // Handle trigger submit (manual wake)
  const handleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriggering(true);
    setLogs('Enviando comando para despertar a Hermes...\n');
    setShowConsole(true);

    try {
      const res = await fetch(`${apiBase}/api/marketing/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_name: targetAccount,
          topic: customTopic.trim() || undefined
        })
      });

      if (res.ok) {
        setLogs(prev => prev + '✅ ¡Hermes despertado con éxito! Esperando a que el daemon inicie la generación...\n');
        setCustomTopic('');
      } else {
        const err = await res.json();
        setLogs(prev => prev + `❌ Error al despertar a Hermes: ${err.error}\n`);
      }
    } catch (err: any) {
      setLogs(prev => prev + `❌ Error de red: ${err.message}\n`);
    } finally {
      setTriggering(false);
    }
  };

  // Handle Trend Research trigger
  const handleResearch = async () => {
    setResearching(true);
    setLogs('Iniciando estudio de tendencias de Hermes en el host...\n');
    setActiveLogRunId('research');
    setShowConsole(true);

    try {
      const res = await fetch(`${apiBase}/api/marketing/research`, {
        method: 'POST'
      });
      if (res.ok) {
        setLogs(prev => prev + '✅ ¡Agente de investigación activado! Analizando tendencias en vivo...\n');
      } else {
        const err = await res.json();
        setLogs(prev => prev + `❌ Error al activar el estudio de mercado: ${err.error}\n`);
      }
    } catch (err: any) {
      setLogs(prev => prev + `❌ Error de red: ${err.message}\n`);
    } finally {
      setResearching(false);
    }
  };

  // Handle comment submit
  const handleCommentSubmit = async (runId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[runId]?.trim();
    if (!text) return;

    try {
      const res = await fetch(`${apiBase}/api/marketing/runs/${runId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (res.ok) {
        const data = await res.json();
        setRuns(prev => prev.map(r => r.id === runId ? data.run : r));
        setCommentInputs(prev => ({ ...prev, [runId]: '' }));
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
    }
  };

  // Handle Edit mode open
  const startEdit = (run: MarketingRun) => {
    setEditingRunId(run.id);
    setEditTopic(run.topic || '');
    setEditPostText(run.post_text || '');
    setEditImagePrompt(run.image_prompt || '');
    setEditVideoPrompt(run.video_prompt || '');
  };

  // Handle Save Edit
  const handleSaveEdit = async (runId: string) => {
    try {
      const res = await fetch(`${apiBase}/api/marketing/runs/${runId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: editTopic,
          post_text: editPostText,
          image_prompt: editImagePrompt,
          video_prompt: editVideoPrompt
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRuns(prev => prev.map(r => r.id === runId ? data.run : r));
        setEditingRunId(null);
      }
    } catch (err) {
      console.error('Error saving edits:', err);
    }
  };

  // Handle Delete Planned Run
  const handleDeleteRun = async (runId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este video planificado de la cola?')) return;
    try {
      const res = await fetch(`${apiBase}/api/marketing/runs/${runId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setRuns(prev => prev.filter(r => r.id !== runId));
      }
    } catch (err) {
      console.error('Error deleting planned run:', err);
    }
  };

  // Handle Trigger Specific Planned Run
  const handleTriggerPlanned = async (runId: string) => {
    setLogs(`Despertando a Hermes para generar el plan: ${runId}...\n`);
    setActiveLogRunId(runId);
    setShowConsole(true);
    try {
      const res = await fetch(`${apiBase}/api/marketing/runs/${runId}/trigger`, {
        method: 'POST'
      });
      if (res.ok) {
        setLogs(prev => prev + '✅ ¡Cola disparada para este plan! Hermes está comenzando a generar...\n');
      } else {
        const err = await res.json();
        setLogs(prev => prev + `❌ Error al disparar plan: ${err.error}\n`);
      }
    } catch (err) {
      console.error('Error triggering planned run:', err);
    }
  };

  // Separate planned and production runs
  const plannedRuns = runs.filter(r => r.status === 'planned');
  const historyRuns = runs.filter(r => r.status !== 'planned');

  const filteredPlanned = plannedRuns.filter(run => {
    if (filter === 'all') return true;
    return run.account_name === filter;
  });

  const filteredHistory = historyRuns.filter(run => {
    if (filter === 'all') return true;
    return run.account_name === filter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left', width: '100%' }}>
      
      {/* 1. Header & Status Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>🦅 Hermes Pilot</h1>
          <p style={{ opacity: 0.7, fontSize: '0.9rem', marginTop: '4px' }}>
            Centro de Control de Marketing Autónomo. Hermes estudia tendencias de fútbol, diseña prompts y publica en tus canales automáticamente.
          </p>
        </div>
        
        {/* Daemon Status Card & Trend Research button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={handleResearch}
            disabled={researching || !daemon.is_online}
            className="btn-neon-green"
            style={{ padding: '10px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            🧠 {researching ? 'ANALIZANDO...' : 'LLENAR COLA DE TENDENCIAS'}
          </button>
          
          <div className="glass-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '14px', background: 'rgba(10,10,20,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="pulse-dot" style={{ background: daemon.is_online ? (daemon.status === 'researching' ? '#00f2ea' : 'var(--primary-neon)') : 'var(--accent-red)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 'bold' }}>HERMES ENGINE</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>
                {daemon.is_online ? `ONLINE (${daemon.status.toUpperCase()})` : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Control Panel & Terminal Console */}
      <div style={{ display: 'grid', gridTemplateColumns: showConsole ? '1fr 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Wake Hermes Manual Form */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>⚡ Despertar a Hermes (Generación al Vuelo)</h3>
          
          <form onSubmit={handleTrigger} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>CANAL DE DESTINO</label>
                <select 
                  className="form-select"
                  value={targetAccount}
                  onChange={(e) => setTargetAccount(e.target.value as any)}
                >
                  <option value="GoalChainSol">GoalChainSol (YT Shorts / IG)</option>
                  <option value="NicoPezDorado">NicoPezDorado (TikTok)</option>
                  <option value="both">Ambas Cuentas (Secuencial)</option>
                </select>
              </div>
              
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>TEMÁTICA O HILO</label>
                <input 
                  type="text"
                  placeholder="Automático (Analizado por Hermes)..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(15, 15, 25, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#fff', borderRadius: '12px', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button 
                type="submit" 
                className="btn-neon-purple"
                style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                disabled={triggering || !daemon.is_online}
              >
                🚀 {triggering ? 'DESPERTANDO...' : 'WAKE UP HERMES'}
              </button>
              {showConsole && (
                <button 
                  type="button" 
                  className="btn-outline-red" 
                  onClick={() => setShowConsole(false)}
                  style={{ padding: '10px 16px', borderRadius: '12px', cursor: 'pointer' }}
                >
                  Ocultar Consola
                </button>
              )}
              {!showConsole && logs && (
                <button 
                  type="button" 
                  className="btn-outline-green" 
                  onClick={() => setShowConsole(true)}
                  style={{ padding: '10px 16px', borderRadius: '12px', cursor: 'pointer' }}
                >
                  Consola
                </button>
              )}
            </div>
            {!daemon.is_online && (
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-red)', textAlign: 'center', display: 'block' }}>
                ⚠️ Hermes está durmiendo. Asegúrate de iniciar el daemon PM2 en la terminal del VPS.
              </span>
            )}
          </form>
        </div>

        {/* Real-Time Terminal View */}
        {showConsole && (
          <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid rgba(20, 241, 149, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-neon)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🟢 CONSOLA DE HERMES (VPS LIVE FEED)
              </span>
              <button 
                onClick={() => setShowConsole(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                ✕ Minimizar
              </button>
            </div>
            
            <div 
              className="terminal-console" 
              style={{ 
                height: '160px', 
                whiteSpace: 'pre-wrap', 
                overflowY: 'auto',
                fontSize: '0.75rem',
                lineHeight: '1.4',
                color: '#14f195',
                background: '#040409',
                padding: '12px',
                fontFamily: 'monospace'
              }}
            >
              {logs || 'Iniciando terminal...'}
              <div ref={terminalEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Filter Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ borderBottom: 'none', paddingBottom: 0, margin: 0 }}>📊 Dashboard de Producción</h2>
        
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['all', 'GoalChainSol', 'NicoPezDorado'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '0.72rem',
                fontWeight: 'bold',
                background: filter === f ? 'var(--secondary-neon)' : 'rgba(255,255,255,0.03)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {f === 'all' ? 'VER TODO' : f}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Planned Queue Section */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary-neon)', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          📅 Cola de Próximas Publicaciones Planificadas ({filteredPlanned.length})
        </h3>
        
        {filteredPlanned.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }} className="glass-card">
            <span style={{ fontSize: '2rem' }}>🕵️‍♂️</span>
            <h4 style={{ color: 'var(--text-dim)', marginTop: '8px' }}>No hay videos planificados en cola.</h4>
            <p style={{ fontSize: '0.75rem', opacity: 0.6, maxWidth: '400px', margin: '4px auto 0 auto' }}>
              Haz clic en "Llenar Cola de Tendencias" arriba para que Hermes analice el mercado de fútbol y complete los próximos 10 videos.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredPlanned.map(run => {
              const badgeBg = run.account_name === 'NicoPezDorado' ? 'rgba(0,242,234,0.1)' : 'rgba(153,69,255,0.1)';
              const badgeBorder = run.account_name === 'NicoPezDorado' ? 'rgba(0,242,234,0.3)' : 'rgba(153,69,255,0.3)';
              const badgeText = run.account_name === 'NicoPezDorado' ? '#00f2ea' : 'var(--secondary-neon)';
              const networkLabel = run.account_name === 'NicoPezDorado' ? '🎵 TIKTOK (Personal)' : '📺 YT SHORTS & IG (Project)';
              const isEditing = editingRunId === run.id;

              return (
                <div 
                  key={run.id} 
                  className="glass-card" 
                  style={{ 
                    padding: '1.25rem', 
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(15,15,28,0.75)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        fontSize: '0.62rem', 
                        fontWeight: 'bold', 
                        padding: '2px 6px', 
                        borderRadius: '5px', 
                        background: badgeBg, 
                        border: `1px solid ${badgeBorder}`, 
                        color: badgeText,
                        letterSpacing: '0.5px'
                      }}>
                        {networkLabel}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>ID: {run.id}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!isEditing ? (
                        <>
                          <button 
                            onClick={() => startEdit(run)}
                            className="btn-outline-green"
                            style={{ padding: '4px 10px', fontSize: '0.7rem', borderRadius: '8px', cursor: 'pointer' }}
                          >
                            ✍️ Editar
                          </button>
                          <button 
                            onClick={() => handleTriggerPlanned(run.id)}
                            className="btn-neon-purple"
                            style={{ padding: '4px 10px', fontSize: '0.7rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                            disabled={!daemon.is_online}
                          >
                            🚀 Producir Ahora
                          </button>
                          <button 
                            onClick={() => handleDeleteRun(run.id)}
                            className="btn-outline-red"
                            style={{ padding: '4px 10px', fontSize: '0.7rem', borderRadius: '8px', cursor: 'pointer' }}
                          >
                            ✕ Descartar
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleSaveEdit(run.id)}
                            className="btn-neon-green"
                            style={{ padding: '4px 12px', fontSize: '0.7rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            💾 Guardar
                          </button>
                          <button 
                            onClick={() => setEditingRunId(null)}
                            className="btn-outline-red"
                            style={{ padding: '4px 12px', fontSize: '0.7rem', borderRadius: '8px', cursor: 'pointer' }}
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>TEMA DEL VIDEO</label>
                        <input 
                          type="text"
                          value={editTopic}
                          onChange={(e) => setEditTopic(e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', background: '#0a0a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>IMAGE PROMPT (GROK IMAGINE)</label>
                          <textarea 
                            value={editImagePrompt}
                            onChange={(e) => setEditImagePrompt(e.target.value)}
                            rows={3}
                            style={{ width: '100%', padding: '8px 12px', background: '#0a0a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'monospace' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>VIDEO PROMPT (ANIMACIÓN)</label>
                          <textarea 
                            value={editVideoPrompt}
                            onChange={(e) => setEditVideoPrompt(e.target.value)}
                            rows={3}
                            style={{ width: '100%', padding: '8px 12px', background: '#0a0a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'monospace' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>COPYWRITING DE LA PUBLICACIÓN</label>
                        <textarea 
                          value={editPostText}
                          onChange={(e) => setEditPostText(e.target.value)}
                          rows={4}
                          style={{ width: '100%', padding: '8px 12px', background: '#0a0a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', fontSize: '0.82rem', lineHeight: '1.4' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 style={{ margin: '4px 0 6px 0', color: '#fff', fontSize: '1.05rem', fontWeight: 800 }}>
                        {run.topic}
                      </h4>
                      {run.narrative_angle && (
                        <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', color: '#a0aec0', fontStyle: 'italic' }}>
                          🎯 Ángulo: {run.narrative_angle}
                        </p>
                      )}
                      
                      {/* Read-Only Details Accordion */}
                      <details style={{ marginTop: '8px', cursor: 'pointer' }}>
                        <summary style={{ fontSize: '0.72rem', color: 'var(--primary-neon)', fontWeight: 'bold', outline: 'none' }}>
                          Ver detalles del plan (Prompts y Copy pre-generados)
                        </summary>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginTop: '10px', background: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '8px', cursor: 'default' }}>
                          <div>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 'bold', display: 'block' }}>IMAGE PROMPT</span>
                            <span style={{ fontSize: '0.72rem', color: '#e2e8f0', fontFamily: 'monospace', display: 'block', maxHeight: '80px', overflowY: 'auto' }}>{run.image_prompt}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 'bold', display: 'block' }}>VIDEO PROMPT</span>
                            <span style={{ fontSize: '0.72rem', color: '#e2e8f0', fontFamily: 'monospace', display: 'block', maxHeight: '80px', overflowY: 'auto' }}>{run.video_prompt}</span>
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 'bold', display: 'block' }}>PRE-COPY TEXT</span>
                            <span style={{ fontSize: '0.75rem', color: '#e2e8f0', display: 'block', maxHeight: '80px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>{run.post_text}</span>
                          </div>
                        </div>
                      </details>

                      {/* Comments Loop Steering block */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>💬 AJUSTAR TONO / COMENTARIOS DE STEERING</span>
                        
                        {/* List of comments */}
                        {run.comments && run.comments.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '4px' }}>
                            {run.comments.map((c, i) => (
                              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', padding: '4px 8px', fontSize: '0.7rem' }}>
                                <span style={{ color: 'var(--primary-neon)', fontWeight: 'bold', marginRight: '6px' }}>Director:</span>
                                <span style={{ color: '#cbd5e1' }}>{c.text}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comment input form */}
                        <form 
                          onSubmit={(e) => handleCommentSubmit(run.id, e)}
                          style={{ display: 'flex', gap: '8px' }}
                        >
                          <input 
                            type="text"
                            placeholder="Ej. 'Cambia el balón por uno de Solana brillante' o 'Haz el tono más agresivo'..."
                            value={commentInputs[run.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [run.id]: e.target.value }))}
                            style={{ flex: 1, padding: '6px 10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', fontSize: '0.72rem', outline: 'none' }}
                          />
                          <button 
                            type="submit"
                            className="btn-outline-green"
                            style={{ padding: '6px 12px', fontSize: '0.7rem', borderRadius: '8px', cursor: 'pointer' }}
                          >
                            Opinar
                          </button>
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

      {/* 4. Production History Feed */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0', color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>
          📽️ Historial de Producción y Publicaciones ({filteredHistory.length})
        </h3>
        
        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }} className="glass-card">
            <span style={{ fontSize: '2rem' }}>💤</span>
            <h4 style={{ color: 'var(--text-dim)', marginTop: '8px' }}>No hay registros de producción todavía.</h4>
            <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Despierta a Hermes o activa la cola para ver tus primeros videos generados.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredHistory.map(run => {
              const dateStr = new Date(run.timestamp).toLocaleString();
              const isGenerating = run.status === 'generating';
              const isFailed = run.status === 'failed';
              const isPublished = run.status === 'published';
              
              const badgeBg = run.account_name === 'NicoPezDorado' ? 'rgba(0,242,234,0.1)' : 'rgba(153,69,255,0.1)';
              const badgeBorder = run.account_name === 'NicoPezDorado' ? 'rgba(0,242,234,0.3)' : 'rgba(153,69,255,0.3)';
              const badgeText = run.account_name === 'NicoPezDorado' ? '#00f2ea' : 'var(--secondary-neon)';
              const networkLabel = run.account_name === 'NicoPezDorado' ? '🎵 TIKTOK (Personal)' : '📺 YT SHORTS & IG (Project)';

              return (
                <div 
                  key={run.id} 
                  className="glass-card" 
                  style={{ 
                    padding: '1.5rem',
                    border: isGenerating 
                      ? '1px solid rgba(20, 241, 149, 0.35)' 
                      : isFailed 
                        ? '1px solid rgba(255, 75, 75, 0.3)' 
                        : '1px solid var(--card-border)',
                    boxShadow: isGenerating ? '0 0 15px rgba(20,241,149,0.06)' : undefined
                  }}
                >
                  
                  {/* Top Bar inside Card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ 
                        fontSize: '0.68rem', 
                        fontWeight: 'bold', 
                        padding: '3px 8px', 
                        borderRadius: '6px', 
                        background: badgeBg, 
                        border: `1px solid ${badgeBorder}`, 
                        color: badgeText,
                        letterSpacing: '0.5px'
                      }}>
                        {networkLabel}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>🕒 {dateStr}</span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isGenerating && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--primary-neon)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="pulse-dot" /> PRODUCIR...
                        </span>
                      )}
                      {isFailed && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--accent-red)' }}>
                          ❌ ERROR DE GENERACIÓN
                        </span>
                      )}
                      {isPublished && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--primary-neon)' }}>
                          ✅ ENCOLA EN BUFFER
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Topic Title */}
                  <h3 style={{ margin: '0 0 1rem 0', color: '#fff', fontSize: '1.25rem', fontWeight: 800 }}>
                    {run.topic}
                  </h3>

                  {/* Main Grid: Preview and Metadata */}
                  {isFailed ? (
                    <div style={{ background: 'rgba(255,75,75,0.05)', border: '1px solid rgba(255,75,75,0.2)', padding: '12px', borderRadius: '10px', fontSize: '0.8rem', color: '#fca5a5' }}>
                      <strong>Detalle del Error:</strong> {run.error_message || 'El proceso de Grok CLI terminó abruptamente.'}
                      <button 
                        onClick={() => {
                          setActiveLogRunId(run.id);
                          setShowConsole(true);
                        }}
                        style={{ display: 'block', marginTop: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', color: '#fff', cursor: 'pointer' }}
                      >
                        🔎 Ver Log de Consola
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                      
                      {/* Left: Video / Image Player Preview */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 'bold', textTransform: 'uppercase' }}>Preview Visual (9:16 vertical)</span>
                        <div style={{ 
                          height: '320px', 
                          background: '#040408', 
                          borderRadius: '12px', 
                          border: '1px solid rgba(255,255,255,0.04)', 
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative'
                        }}>
                          {run.video_url ? (
                            <video 
                              src={run.video_url} 
                              controls 
                              loop 
                              muted 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : run.image_url ? (
                            <img 
                              src={run.image_url} 
                              alt="Generated frame" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                              <span style={{ display: 'block', fontSize: '1.5rem', marginBottom: '8px', animation: 'pulse-glow 1.5s infinite' }}>🤖</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Hermes está imaginando la escena...</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Copywriting & Steering Feedback Loop */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        
                        {/* Generated Copy text */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 'bold', textTransform: 'uppercase' }}>Copia Final de Publicación</span>
                          <div style={{ 
                            background: 'rgba(0,0,0,0.25)', 
                            border: '1px solid rgba(255,255,255,0.03)', 
                            borderRadius: '10px', 
                            padding: '12px', 
                            fontSize: '0.82rem', 
                            color: '#e2e8f0', 
                            fontFamily: 'system-ui, sans-serif',
                            lineHeight: '1.55',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '130px',
                            overflowY: 'auto'
                          }}>
                            {run.post_text || (isGenerating ? 'Generando copywriting...' : 'No disponible.')}
                          </div>
                        </div>

                        {/* Steering Feedback Loop Comments */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 'bold', textTransform: 'uppercase' }}>💬 Retroalimentación del Historial</span>
                          
                          {/* List of comments */}
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '6px', 
                            maxHeight: '100px', 
                            overflowY: 'auto',
                            marginBottom: '6px'
                          }}>
                            {(!run.comments || run.comments.length === 0) ? (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                                Sin comentarios todavía.
                              </span>
                            ) : (
                              run.comments.map((c, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', padding: '6px 10px', fontSize: '0.72rem' }}>
                                  <span style={{ color: 'var(--primary-neon)', fontWeight: 'bold', marginRight: '6px' }}>Director:</span>
                                  <span style={{ color: '#cbd5e1' }}>{c.text}</span>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Comment input form */}
                          <form 
                            onSubmit={(e) => handleCommentSubmit(run.id, e)}
                            style={{ display: 'flex', gap: '8px' }}
                          >
                            <input 
                              type="text"
                              placeholder="Ej. 'Buen video, sigue por esta línea'..."
                              value={commentInputs[run.id] || ''}
                              onChange={(e) => setCommentInputs(prev => ({ ...prev, [run.id]: e.target.value }))}
                              style={{ flex: 1, padding: '6px 10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', fontSize: '0.75rem', outline: 'none' }}
                            />
                            <button 
                              type="submit"
                              className="btn-outline-green"
                              style={{ padding: '6px 12px', fontSize: '0.72rem', borderRadius: '8px', cursor: 'pointer' }}
                            >
                              Opinar
                            </button>
                            <button 
                              type="button"
                              className="btn-outline-red"
                              onClick={() => {
                                setActiveLogRunId(run.id);
                                setShowConsole(true);
                              }}
                              style={{ padding: '6px 8px', fontSize: '0.72rem', borderRadius: '8px', cursor: 'pointer' }}
                              title="Ver log de consola"
                            >
                              🔎 Log
                            </button>
                          </form>
                        </div>

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
