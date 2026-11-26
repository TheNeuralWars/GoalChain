/**
 * Typed product-event schema for play.goalworld.fun. Keep in sync with the
 * table in docs/analytics/POSTHOG.md. No raw wallet addresses, emails or
 * usernames — only categorical/numeric properties.
 */

export type GameId = 'match_sim' | 'penalty' | 'pack' | 'modifiers';
export type GameMode = 'tactical' | 'arcade';
export type GameResult = 'win' | 'draw' | 'loss' | 'abandoned' | 'closed';

export interface AnalyticsEventMap {
  game_started: {
    game: GameId;
    mode: GameMode;
    surface: string;
    entry_fee_gch?: number;
  };
  game_ended: {
    game: GameId;
    mode: GameMode;
    result: GameResult;
    duration_s: number;
    surface: string;
    score_home?: number;
    score_away?: number;
    goal_diff?: number;
    match_minute?: number;
    goals?: number;
    misses?: number;
    packs_opened?: number;
    best_rarity?: string;
  };
  registration_completed: {
    method: 'wallet';
    role: string;
    avatar: string;
  };
  wallet_connected: {
    wallet_name: string;
    network: 'devnet' | 'mainnet-beta' | 'testnet';
  };
  wallet_disconnected: {
    wallet_name: string;
  };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;

/** Result of a finished tactical match from the home side's perspective. */
export function matchResult(home: number, away: number): Extract<GameResult, 'win' | 'draw' | 'loss'> {
  if (home > away) return 'win';
  if (home < away) return 'loss';
  return 'draw';
}

/** Elapsed whole seconds, clamped to [0, 6h] so a stale tab can't skew averages. */
export function durationSeconds(startMs: number, endMs: number): number {
  const s = Math.round((endMs - startMs) / 1000);
  return Math.max(0, Math.min(s, 6 * 60 * 60));
}

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

/** Higher-ranked rarity of two (unknown strings rank lowest). */
export function bestRarity(a: string | undefined, b: string): string {
  if (!a) return b;
  return RARITY_ORDER.indexOf(b.toLowerCase()) > RARITY_ORDER.indexOf(a.toLowerCase()) ? b : a;
}
