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
  scheduled_at?: string;
  platform_slots?: Record<string, string>;
  comments: Comment[];
  narrative_angle?: string;
  image_prompt?: string;
  video_prompt?: string;
  _reconstructed?: boolean;
}

interface DaemonStatus {
  status: 'idle' | 'running' | 'offline' | 'researching';
  pid?: number;
  last_check?: string;
  is_online: boolean;
  current_run?: { account: string; run_id: string; started_at: string } | null;
}

// ── Platform helpers ──────────────────────────────────────────────────────────
const PLATFORM_META: Record<string, { icon: string; color: string; name: string }> = {
  tiktok:    { icon: '🎵', color: '#00f2ea', name: 'TikTok' },
  youtube:   { icon: '▶️', color: '#ff0000', name: 'YouTube' },
  instagram: { icon: '📸', color: '#e1306c', name: 'Instagram' },
};

const ACCOUNT_STYLES: Record<string, { accent: string; label: string; platforms: string[] }> = {
  NicoPezDorado: { accent: '#00f2ea', label: 'NicoPez', platforms: ['tiktok'] },
  GoalChainSol:  { accent: '#9945ff', label: 'GoalChain', platforms: ['youtube', 'instagram'] },
};

function formatScheduledAt(iso?: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-AR', {
      weekday: 'short', day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires'
    }) + ' ART';
  } catch { return iso; }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

// ── Video Card ────────────────────────────────────────────────────────────────
function VideoCard({
  run,
  apiBase,
  onComment,
}: {
  run: MarketingRun;
  apiBase: string;
  onComment: (id: string, text: string) => Promise<void>;
}) {
  const acct = ACCOUNT_STYLES[run.account_name] ?? ACCOUNT_STYLES.GoalChainSol;
  const [expanded, setExpanded] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [postExpanded, setPostExpanded] = useState(false);

  const isGenerating = run.status === 'generating';
  const isFailed = run.status === 'failed';
  const isPublished = run.status === 'published';
  const isPlanned = run.status === 'planned';

  const statusColor = isGenerating ? '#14f195'
    : isFailed ? '#f04040'
    : isPublished ? acct.accent
    : 'rgba(255,255,255,0.35)';

  const statusLabel = isGenerating ? '⚡ GENERANDO'
    : isFailed ? '❌ ERROR'
    : isPublished ? '✅ BUFFER'
    : '📋 PLANIFICADO';

  const scheduledTime = run.scheduled_at || '';
  const platformSlots = run.platform_slots || {};

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await onComment(run.id, commentText.trim());
      setCommentText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <article style={{
      background: 'rgba(10,10,22,0.8)',
      border: `1px solid ${isGenerating ? 'rgba(20,241,149,0.3)' : isFailed ? 'rgba(255,40,40,0.25)' : `${acct.accent}22`}`,
      borderRadius: '16px',
      overflow: 'hidden',
      backdropFilter: 'blur(12px)',
      transition: 'box-shadow 0.2s',
    }}>

      {/* ── TOP HEADER BAR ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
        padding: '12px 16px',
        borderBottom: `1px solid ${acct.accent}18`,
        background: `linear-gradient(90deg, ${acct.accent}0a 0%, transparent 100%)`,
      }}>
        {/* Account badge */}
        <span style={{
          fontSize: '0.62rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px',
          background: `${acct.accent}22`, border: `1px solid ${acct.accent}44`, color: acct.accent,
          letterSpacing: '0.5px',
        }}>
          {acct.label.toUpperCase()}
        </span>

        {/* Platforms */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {acct.platforms.map(p => {
            const pm = PLATFORM_META[p];
            const slotTime = platformSlots[p];
            return (
              <span key={p} title={slotTime ? `${pm.name}: ${formatScheduledAt(slotTime)}` : pm.name}
                style={{
                  fontSize: '0.6rem', padding: '2px 6px', borderRadius: '5px',
                  background: `${pm.color}18`, border: `1px solid ${pm.color}44`, color: pm.color,
                  fontWeight: 700, cursor: slotTime ? 'help' : 'default',
                }}>
                {pm.icon} {pm.name}
              </span>
            );
          })}
        </div>

        {/* Topic */}
        <span style={{
          flex: 1, fontSize: '0.9rem', fontWeight: 800, color: '#fff',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {run.topic || '—'}
        </span>

        {/* Status */}
        <span style={{ fontSize: '0.65rem', color: statusColor, fontWeight: 800, whiteSpace: 'nowrap' }}>
          {statusLabel}
        </span>
      </div>

      {/* ── MAIN BODY ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: (run.video_url || run.image_url) ? '220px 1fr' : '1fr',
        gap: '0',
        minHeight: '200px',
      }}>

        {/* ── LEFT: Video Player ── */}
        {(run.video_url || run.image_url) && (
          <div style={{
            position: 'relative',
            background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            aspectRatio: isPlanned ? undefined : '9/16',
            maxHeight: '390px',
            borderRight: `1px solid ${acct.accent}15`,
          }}>
            {run.video_url ? (
              <video
                src={run.video_url}
                controls
                loop
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <img
                src={run.image_url}
                alt="frame"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            )}
          </div>
        )}

        {/* ── RIGHT: Details ── */}
        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'hidden' }}>

          {/* Scheduled time — MOST PROMINENT */}
          {scheduledTime && (
            <div style={{
              background: `${acct.accent}12`,
              border: `1px solid ${acct.accent}33`,
              borderRadius: '10px',
              padding: '8px 12px',
            }}>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: '2px', letterSpacing: '0.5px' }}>
                ⏰ PUBLICACIÓN PROGRAMADA
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: acct.accent }}>
                {formatScheduledAt(scheduledTime)}
              </div>
              {Object.keys(platformSlots).length > 1 && (
                <div style={{ marginTop: '4px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {Object.entries(platformSlots).map(([svc, t]) => {
                    const pm = PLATFORM_META[svc];
                    return pm ? (
                      <span key={svc} style={{ fontSize: '0.6rem', color: pm.color }}>
                        {pm.icon} {formatScheduledAt(t)}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          )}

          {/* Narrative angle */}
          {run.narrative_angle && (
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', lineHeight: 1.4 }}>
              🎯 {run.narrative_angle}
            </div>
          )}

          {/* Post text (caption) */}
          {run.post_text && (
            <div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginBottom: '4px', letterSpacing: '0.5px' }}>
                📝 PIE DE VIDEO
              </div>
              <div style={{
                fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                maxHeight: postExpanded ? 'none' : '72px',
                overflow: postExpanded ? 'visible' : 'hidden',
                position: 'relative',
              }}>
                {run.post_text}
                {!postExpanded && run.post_text.length > 200 && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '28px',
                    background: 'linear-gradient(transparent, rgba(10,10,22,0.95))',
                  }} />
                )}
              </div>
              {run.post_text.length > 200 && (
                <button onClick={() => setPostExpanded(v => !v)} style={{
                  background: 'none', border: 'none', color: acct.accent, cursor: 'pointer',
                  fontSize: '0.68rem', padding: '2px 0', fontWeight: 700,
                }}>
                  {postExpanded ? '▲ Ver menos' : '▼ Ver todo el copy'}
                </button>
              )}
            </div>
          )}

          {/* Meta row: timestamp + buffer links */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginTop: 'auto' }}>
            <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)' }}>
              🕐 {timeAgo(run.timestamp)}
            </span>
            {run.buffer_post_ids && run.buffer_post_ids.length > 0 && (
              <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>
                📤 Buffer IDs: {run.buffer_post_ids.join(', ')}
              </span>
            )}
            {run._reconstructed && (
              <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
                archivo recuperado
              </span>
            )}
          </div>

          {/* Expand toggle for prompts */}
          {(run.image_prompt || run.video_prompt) && (
            <button onClick={() => setShowPrompts(v => !v)} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.35)', borderRadius: '6px', cursor: 'pointer',
              fontSize: '0.65rem', padding: '4px 10px', textAlign: 'left',
            }}>
              {showPrompts ? '▲ Ocultar prompts' : '🤖 Ver prompts de IA'}
            </button>
          )}
          {showPrompts && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {run.image_prompt && (
                <div>
                  <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>IMAGE:</span>
                  <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', margin: '2px 0', fontFamily: 'monospace', lineHeight: 1.4 }}>{run.image_prompt}</p>
                </div>
              )}
              {run.video_prompt && (
                <div>
                  <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>VIDEO:</span>
                  <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', margin: '2px 0', fontFamily: 'monospace', lineHeight: 1.4 }}>{run.video_prompt}</p>
                </div>
              )}
            </div>
          )}

          {/* Error detail */}
          {isFailed && run.error_message && (
            <div style={{
              fontSize: '0.72rem', color: '#fca5a5', background: 'rgba(255,40,40,0.06)',
              border: '1px solid rgba(255,40,40,0.15)', padding: '6px 10px', borderRadius: '8px',
            }}>
              {run.error_message}
            </div>
          )}

          {/* Comments */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
            {run.comments && run.comments.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                {run.comments.map((c, i) => (
                  <div key={i} style={{
                    fontSize: '0.7rem', color: '#a0aec0',
                    background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px',
                    borderLeft: `2px solid ${acct.accent}66`,
                  }}>
                    <span style={{ color: acct.accent, fontWeight: 700, marginRight: '6px', fontSize: '0.6rem' }}>
                      {timeAgo(c.timestamp)}
                    </span>
                    {c.text}
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleComment} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder={isPlanned ? 'Opina sobre este plan...' : 'Feedback para próximos videos...'}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                style={{
                  flex: 1, padding: '5px 10px', fontSize: '0.72rem',
                  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)',
                  color: '#fff', borderRadius: '8px', outline: 'none',
                }}
              />
              <button type="submit" disabled={submitting || !commentText.trim()} style={{
                padding: '5px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700,
                background: `${acct.accent}22`, border: `1px solid ${acct.accent}44`,
                color: acct.accent, cursor: 'pointer',
              }}>
                {submitting ? '...' : '💬'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </article>
  );
}

// ── Planned Queue Card (compact) ──────────────────────────────────────────────
function PlannedCard({
  run,
  onEdit,
  onTrigger,
  onDelete,
  onComment,
  daemonOnline,
}: {
  run: MarketingRun;
  onEdit: (run: MarketingRun) => void;
  onTrigger: (id: string) => void;
  onDelete: (id: string) => void;
  onComment: (id: string, text: string) => Promise<void>;
  daemonOnline: boolean;
}) {
  const acct = ACCOUNT_STYLES[run.account_name] ?? ACCOUNT_STYLES.GoalChainSol;
  const [commentText, setCommentText] = useState('');

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await onComment(run.id, commentText.trim());
    setCommentText('');
  };

  return (
    <div style={{
      background: 'rgba(10,10,22,0.7)',
      border: `1px solid ${acct.accent}22`,
      borderRadius: '12px', padding: '12px 16px',
      display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '0.6rem', fontWeight: 800, padding: '2px 7px', borderRadius: '5px',
          background: `${acct.accent}18`, border: `1px solid ${acct.accent}44`, color: acct.accent,
        }}>
          {acct.label}
        </span>
        <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {run.topic}
        </span>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button onClick={() => onEdit(run)} style={{
            padding: '2px 8px', fontSize: '0.65rem', borderRadius: '5px', cursor: 'pointer',
            background: 'rgba(20,241,149,0.08)', border: '1px solid rgba(20,241,149,0.25)', color: '#14f195',
          }}>✍️</button>
          <button onClick={() => onTrigger(run.id)} disabled={!daemonOnline} style={{
            padding: '2px 8px', fontSize: '0.65rem', borderRadius: '5px', cursor: 'pointer',
            background: `${acct.accent}18`, border: `1px solid ${acct.accent}44`, color: acct.accent,
            opacity: daemonOnline ? 1 : 0.4,
          }}>🚀</button>
          <button onClick={() => onDelete(run.id)} style={{
            padding: '2px 8px', fontSize: '0.65rem', borderRadius: '5px', cursor: 'pointer',
            background: 'rgba(255,40,40,0.06)', border: '1px solid rgba(255,40,40,0.2)', color: '#f66',
          }}>✕</button>
        </div>
      </div>
      {run.narrative_angle && (
        <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
          🎯 {run.narrative_angle}
        </p>
      )}
      <form onSubmit={handleComment} style={{ display: 'flex', gap: '6px' }}>
        <input type="text" placeholder="Opina sobre este plan..."
          value={commentText} onChange={e => setCommentText(e.target.value)}
          style={{ flex: 1, padding: '4px 8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', borderRadius: '6px', fontSize: '0.68rem', outline: 'none' }}
        />
        <button type="submit" style={{
          padding: '4px 10px', fontSize: '0.65rem', borderRadius: '6px', cursor: 'pointer',
          background: `${acct.accent}12`, border: `1px solid ${acct.accent}33`, color: acct.accent,
        }}>💬</button>
      </form>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ run, onSave, onClose }: {
  run: MarketingRun;
  onSave: (id: string, data: Partial<MarketingRun>) => Promise<void>;
  onClose: () => void;
}) {
  const [topic, setTopic] = useState(run.topic || '');
  const [postText, setPostText] = useState(run.post_text || '');
  const [imagePrompt, setImagePrompt] = useState(run.image_prompt || '');
  const [videoPrompt, setVideoPrompt] = useState(run.video_prompt || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(run.id, { topic, post_text: postText, image_prompt: imagePrompt, video_prompt: videoPrompt });
    setSaving(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
        padding: '24px', width: '100%', maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '12px',
      }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>✍️ Editar plan</h3>
        <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Tema"
          style={{ padding: '8px 12px', background: '#040408', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <textarea value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} rows={3} placeholder="Image prompt"
            style={{ padding: '7px 10px', background: '#040408', border: '1px solid rgba(255,255,255,0.08)', color: '#a0aec0', borderRadius: '8px', fontSize: '0.72rem', fontFamily: 'monospace', resize: 'vertical', outline: 'none' }} />
          <textarea value={videoPrompt} onChange={e => setVideoPrompt(e.target.value)} rows={3} placeholder="Video prompt"
            style={{ padding: '7px 10px', background: '#040408', border: '1px solid rgba(255,255,255,0.08)', color: '#a0aec0', borderRadius: '8px', fontSize: '0.72rem', fontFamily: 'monospace', resize: 'vertical', outline: 'none' }} />
        </div>
        <textarea value={postText} onChange={e => setPostText(e.target.value)} rows={4} placeholder="Copy del pie de video"
          style={{ padding: '7px 10px', background: '#040408', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1', borderRadius: '8px', fontSize: '0.78rem', lineHeight: 1.5, resize: 'vertical', outline: 'none' }} />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: '0.82rem' }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 18px', borderRadius: '8px', background: 'rgba(20,241,149,0.15)', border: '1px solid rgba(20,241,149,0.4)', color: '#14f195', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 800 }}>
            {saving ? 'Guardando...' : '💾 Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function MarketingControlCenter() {
  const apiBase = apiBaseUrl();

  const [runs, setRuns] = useState<MarketingRun[]>([]);
  const [daemon, setDaemon] = useState<DaemonStatus>({ status: 'offline', is_online: false });
  const [filter, setFilter] = useState<'all' | 'NicoPezDorado' | 'GoalChainSol' | 'planned'>('all');

  const [targetAccount, setTargetAccount] = useState<'NicoPezDorado' | 'GoalChainSol' | 'both'>('GoalChainSol');
  const [customTopic, setCustomTopic] = useState('');
  const [triggering, setTriggering] = useState(false);
  const [researching, setResearching] = useState(false);

  const [logs, setLogs] = useState<string>('');
  const [activeLogRunId, setActiveLogRunId] = useState<string | null>(null);
  const [showConsole, setShowConsole] = useState(false);

  const [editingRun, setEditingRun] = useState<MarketingRun | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const fetchRuns = async () => {
    try {
      const r = await fetch(`${apiBase}/api/marketing/runs`);
      if (r.ok) setRuns(await r.json());
    } catch {}
  };

  useEffect(() => {
    const fetchAll = async () => {
      await fetchRuns();
      try {
        const dr = await fetch(`${apiBase}/api/marketing/daemon-status`);
        if (dr.ok) {
          const d = await dr.json();
          setDaemon(d);
          if (d.status === 'running' && d.current_run?.run_id) {
            setActiveLogRunId(d.current_run.run_id); setShowConsole(true);
          } else if (d.status === 'researching') {
            setActiveLogRunId('research'); setShowConsole(true);
          }
        }
      } catch {}
    };
    fetchAll();
    const iv = setInterval(fetchAll, 4000);
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

  useEffect(() => { terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriggering(true);
    setLogs('Enviando trigger a Hermes...\n');
    setShowConsole(true);
    try {
      const r = await fetch(`${apiBase}/api/marketing/trigger`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_name: targetAccount, topic: customTopic.trim() || undefined }),
      });
      const msg = r.ok ? '✅ ¡Hermes despertado! Esperando al daemon...\n'
        : `❌ Error: ${(await r.json().catch(() => ({ error: r.statusText }))).error}\n`;
      setLogs(prev => prev + msg);
      if (r.ok) setCustomTopic('');
    } catch (err: any) {
      setLogs(prev => prev + `❌ Error de red: ${err.message}\n`);
    } finally { setTriggering(false); }
  };

  const handleResearch = async () => {
    setResearching(true);
    setLogs('🧠 Activando agente de investigación...\n');
    setShowConsole(true);
    try {
      const r = await fetch(`${apiBase}/api/marketing/research`, { method: 'POST' });
      const msg2 = r.ok ? '✅ Agente de investigación activado!\n'
        : `❌ Error: ${(await r.json().catch(() => ({ error: r.statusText }))).error}\n`;
      setLogs(prev => prev + msg2);
    } catch (err: any) {
      setLogs(prev => prev + `❌ ${err.message}\n`);
    } finally { setResearching(false); }
  };

  const handleTriggerPlanned = async (runId: string) => {
    setLogs(`Disparando producción de ${runId}...\n`);
    setActiveLogRunId(runId); setShowConsole(true);
    try {
      const r = await fetch(`${apiBase}/api/marketing/runs/${runId}/trigger`, { method: 'POST' });
      const msg3 = r.ok ? '✅ Producción en curso!\n'
        : `❌ Error: ${(await r.json().catch(() => ({ error: r.statusText }))).error}\n`;
      setLogs(prev => prev + msg3);
    } catch {}
  };

  const handleDelete = async (runId: string) => {
    if (!confirm('¿Eliminar este run?')) return;
    await fetch(`${apiBase}/api/marketing/runs/${runId}`, { method: 'DELETE' });
    await fetchRuns();
  };

  const handleSaveEdit = async (id: string, data: Partial<MarketingRun>) => {
    await fetch(`${apiBase}/api/marketing/runs/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await fetchRuns();
  };

  const handleComment = async (id: string, text: string) => {
    await fetch(`${apiBase}/api/marketing/runs/${id}/comment`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    await fetchRuns();
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  const plannedRuns = runs.filter(r => r.status === 'planned')
    .filter(r => filter === 'all' || filter === 'planned' || r.account_name === filter);
    
  const historyRuns = runs.filter(r => r.status !== 'planned')
    .filter(r => {
      if (filter === 'planned') return false;
      if (filter === 'all') return true;
      return r.account_name === filter;
    });

  const daemonColor = daemon.is_online
    ? (daemon.status === 'researching' ? '#00f2ea' : daemon.status === 'running' ? '#14f195' : 'rgba(255,255,255,0.3)')
    : '#f04040';

  const daemonLabel = daemon.is_online
    ? `● ${daemon.status === 'idle' ? 'IDLE' : daemon.status === 'running' ? 'GENERANDO' : daemon.status === 'researching' ? 'INVESTIGANDO' : daemon.status.toUpperCase()}`
    : '● OFFLINE';

  const scheduledCount = runs.filter(r => r.scheduled_at && r.status === 'published').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left', width: '100%' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>🦅 Hermes Pilot</h1>
          <span style={{ fontSize: '0.7rem', color: daemonColor, fontWeight: 800, letterSpacing: '0.5px' }}>
            {daemonLabel}
          </span>
          {scheduledCount > 0 && (
            <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', padding: '2px 7px', borderRadius: '5px' }}>
              {scheduledCount} programados en Buffer
            </span>
          )}
        </div>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '5px' }}>
          {(['all', 'planned', 'GoalChainSol', 'NicoPezDorado'] as const).map(f => (
            <button key={f} id={`filter-${f}`} onClick={() => setFilter(f)} style={{
              padding: '4px 10px', borderRadius: '12px', fontSize: '0.67rem', fontWeight: 700,
              background: filter === f ? 'rgba(153,69,255,0.25)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filter === f ? 'rgba(153,69,255,0.5)' : 'rgba(255,255,255,0.06)'}`,
              color: filter === f ? '#9945ff' : 'rgba(255,255,255,0.5)', cursor: 'pointer',
            }}>
              {f === 'all' ? 'Todo' : f === 'planned' ? '📋 Cola' : f}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTROL STRIP ── */}
      <div style={{ background: 'rgba(10,10,22,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '14px 16px' }}>
        <form onSubmit={handleTrigger} style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select id="target-account-select" value={targetAccount}
            onChange={e => setTargetAccount(e.target.value as any)}
            style={{ padding: '7px 10px', fontSize: '0.82rem', borderRadius: '8px', flex: '0 0 auto', background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}>
            <option value="GoalChainSol">GoalChainSol</option>
            <option value="NicoPezDorado">NicoPezDorado</option>
            <option value="both">Ambas</option>
          </select>
          <input id="custom-topic-input" type="text"
            placeholder="Tema específico (vacío = Hermes decide)"
            value={customTopic} onChange={e => setCustomTopic(e.target.value)}
            style={{ flex: 1, minWidth: '180px', padding: '7px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', fontSize: '0.82rem', outline: 'none' }}
          />
          <button id="wake-hermes-btn" type="submit" disabled={triggering || !daemon.is_online}
            style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap', background: 'rgba(153,69,255,0.2)', border: '1px solid rgba(153,69,255,0.5)', color: '#9945ff', opacity: (!daemon.is_online || triggering) ? 0.5 : 1 }}>
            {triggering ? '...' : '🚀 Generar'}
          </button>
          <button id="fill-queue-btn" type="button" onClick={handleResearch}
            disabled={researching || !daemon.is_online}
            style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap', background: 'rgba(20,241,149,0.12)', border: '1px solid rgba(20,241,149,0.35)', color: '#14f195', opacity: (!daemon.is_online || researching) ? 0.5 : 1 }}>
            {researching ? '...' : '🧠 Llenar Cola'}
          </button>
          <button id="toggle-console-btn" type="button" onClick={() => setShowConsole(v => !v)}
            style={{ padding: '7px 10px', borderRadius: '8px', fontSize: '0.72rem', background: showConsole ? 'rgba(20,241,149,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${showConsole ? 'rgba(20,241,149,0.3)' : 'rgba(255,255,255,0.07)'}`, color: showConsole ? '#14f195' : 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            📟
          </button>
        </form>
        {!daemon.is_online && (
          <p style={{ margin: '8px 0 0 0', fontSize: '0.7rem', color: '#f04040' }}>
            ⚠️ Hermes está durmiendo. Ejecuta <code style={{ fontSize: '0.65rem' }}>pm2 start hermes-video-daemon</code> en el VPS.
          </p>
        )}
      </div>

      {/* ── CONSOLE ── */}
      {showConsole && (
        <div style={{ background: 'rgba(4,4,9,0.95)', border: '1px solid rgba(20,241,149,0.2)', borderRadius: '12px', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.65rem', color: '#14f195', fontWeight: 800 }}>🟢 LOG VPS</span>
            <button onClick={() => setShowConsole(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
          </div>
          <div style={{ height: '120px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: '0.7rem', lineHeight: 1.4, color: '#14f195', fontFamily: 'monospace' }}>
            {logs || 'Iniciando...'}
            <div ref={terminalEndRef} />
          </div>
        </div>
      )}

      {/* ── PLANNED QUEUE ── */}
      {(filter === 'all' || filter === 'planned') && plannedRuns.length > 0 && (
        <section>
          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 800, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📋 Cola Planificada
            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.07)', padding: '2px 8px', borderRadius: '10px' }}>{plannedRuns.length}</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {plannedRuns.map(run => (
              <PlannedCard
                key={run.id} run={run}
                onEdit={setEditingRun}
                onTrigger={handleTriggerPlanned}
                onDelete={handleDelete}
                onComment={handleComment}
                daemonOnline={daemon.is_online}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── VIDEO GALLERY ── */}
      {filter !== 'planned' && (
        <section>
          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 800, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🎬 Galería de Videos
            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.07)', padding: '2px 8px', borderRadius: '10px' }}>{historyRuns.length}</span>
          </h3>
          {historyRuns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(10,10,22,0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '2rem' }}>🎥</span>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', margin: '10px 0 0 0' }}>
                Aún no hay videos. Despertá a Hermes para empezar a generar.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {historyRuns.map(run => (
                <VideoCard key={run.id} run={run} apiBase={apiBase} onComment={handleComment} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── EDIT MODAL ── */}
      {editingRun && (
        <EditModal
          run={editingRun}
          onSave={handleSaveEdit}
          onClose={() => setEditingRun(null)}
        />
      )}

    </div>
  );
}
