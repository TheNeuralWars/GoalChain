/**
 * Bridges the in-app game bus (arcade mini-games) to analytics.
 *
 * Arcade games run in an iframe and report through the postMessage bridge →
 * gameBus (see ui/VanillaMount.tsx). A session starts when the arcade modal
 * opens a game and ends when it closes (any path: ✕, Escape, backdrop, or the
 * game's own close button) — ModalRoot calls startArcadeSession/endArcadeSession.
 */
import { gameBus } from '../hooks/useGameBus';
import { track } from './client';
import { bestRarity, durationSeconds, type GameId } from './events';

interface ArcadeSession {
  game: GameId;
  startedAt: number;
  surface: string;
  goals: number;
  misses: number;
  packs: number;
  best?: string;
}

let session: ArcadeSession | null = null;
let busWired = false;

function wireBus(): void {
  if (busWired) return;
  busWired = true;
  gameBus.on('penalty:goal', () => {
    if (session) session.goals += 1;
  });
  gameBus.on('penalty:miss', () => {
    if (session) session.misses += 1;
  });
  gameBus.on('pack:opened', ({ rarity }) => {
    if (!session) return;
    session.packs += 1;
    session.best = bestRarity(session.best, rarity);
  });
}

export function startArcadeSession(game: GameId): void {
  wireBus();
  if (session && session.game === game) return;
  if (session) endArcadeSession();
  const surface = window.location.pathname;
  session = { game, startedAt: Date.now(), surface, goals: 0, misses: 0, packs: 0 };
  track('game_started', { game, mode: 'arcade', surface });
}

export function endArcadeSession(): void {
  if (!session) return;
  const s = session;
  session = null;
  track('game_ended', {
    game: s.game,
    mode: 'arcade',
    result: 'closed',
    duration_s: durationSeconds(s.startedAt, Date.now()),
    surface: s.surface,
    ...(s.game === 'penalty' ? { goals: s.goals, misses: s.misses } : {}),
    ...(s.game === 'pack' ? { packs_opened: s.packs, ...(s.best ? { best_rarity: s.best } : {}) } : {}),
  });
}
