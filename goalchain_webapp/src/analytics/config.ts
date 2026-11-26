/**
 * PostHog runtime config for play.goalworld.fun.
 *
 * The project token is a PUBLIC client key (it only allows sending events),
 * so a fallback is safe to ship. Env vars win so Preview/Production/dev can
 * point at different projects, and `VITE_POSTHOG_DISABLED=1` turns analytics
 * off completely (e.g. for local perf profiling).
 */

/** EU Cloud project 304954 ("GoalWorld"). Public key — safe in the bundle. */
export const FALLBACK_POSTHOG_TOKEN = 'phc_omw247yohHidWjoLZkuVHTQmeK7PEyCDnL5kGm3vHPku';
export const FALLBACK_POSTHOG_HOST = 'https://eu.i.posthog.com';
export const POSTHOG_UI_HOST = 'https://eu.posthog.com';

export interface AnalyticsEnv {
  VITE_POSTHOG_TOKEN?: string;
  VITE_POSTHOG_HOST?: string;
  VITE_POSTHOG_DISABLED?: string;
}

export interface ResolvedAnalyticsConfig {
  enabled: boolean;
  token: string;
  apiHost: string;
}

const TRUTHY = new Set(['1', 'true', 'yes', 'on']);

/** Pure resolver — unit-tested in tests/analytics. */
export function resolveAnalyticsConfig(env: AnalyticsEnv): ResolvedAnalyticsConfig {
  const token = (env.VITE_POSTHOG_TOKEN ?? '').trim() || FALLBACK_POSTHOG_TOKEN;
  const rawHost = (env.VITE_POSTHOG_HOST ?? '').trim() || FALLBACK_POSTHOG_HOST;
  // Only accept https PostHog-style hosts; anything else falls back to EU Cloud
  // so a typo in a Vercel env var can never ship events to a random origin.
  const apiHost = /^https:\/\/[a-z0-9.-]+$/i.test(rawHost.replace(/\/+$/, ''))
    ? rawHost.replace(/\/+$/, '')
    : FALLBACK_POSTHOG_HOST;
  const disabled = TRUTHY.has((env.VITE_POSTHOG_DISABLED ?? '').trim().toLowerCase());
  return {
    enabled: !disabled && token.startsWith('phc_'),
    token,
    apiHost,
  };
}
