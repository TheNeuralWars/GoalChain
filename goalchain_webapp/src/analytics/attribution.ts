/**
 * First-touch / last-touch marketing attribution.
 *
 * PostHog already records `utm_*` on each event and `$initial_utm_*` on
 * persons, but play.goalworld.fun runs with anonymous (identified_only)
 * profiles, so we also pin first-touch attribution as super properties that
 * ride along every event. Links from X (@nicopez) should use:
 *   ?utm_source=x&utm_medium=social&utm_campaign=<campaign>&utm_content=nicopez
 * Plain X clicks without UTM are still detected via the t.co / x.com referrer.
 */

export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
export type UtmKey = (typeof UTM_KEYS)[number];

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  /** Normalised channel: 'x' | 'direct' | 'owned' (goalworld.fun etc.) | 'referral' | 'search' | other utm_source. */
  channel: string;
  /** X handle that drove the visit when known (e.g. 'nicopez'). */
  x_account?: string;
  referring_domain?: string;
  landing_path: string;
}

const X_HOSTS = /(^|\.)(t\.co|x\.com|twitter\.com)$/i;
const SEARCH_HOSTS = /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|search\.brave\.com|yandex\.[a-z]+)$/i;
const OWNED_HOSTS = /(^|\.)(goalworld\.fun|goalchain\.fun|theneuralwars\.xyz)$/i;
const X_SOURCES = new Set(['x', 'twitter', 'x.com', 't.co']);
const KNOWN_X_ACCOUNTS = ['nicopez'];

function clean(v: string | null): string | undefined {
  if (!v) return undefined;
  const t = v.trim().slice(0, 200);
  return t ? t : undefined;
}

function hostOf(referrer: string): string | undefined {
  try {
    return referrer ? new URL(referrer).hostname.toLowerCase() : undefined;
  } catch {
    return undefined;
  }
}

/** Pure: derive attribution from a URL + document.referrer. */
export function parseAttribution(href: string, referrer: string, selfHost?: string): Attribution {
  const url = new URL(href);
  const params = url.searchParams;
  const utm: Partial<Record<UtmKey, string>> = {};
  for (const key of UTM_KEYS) {
    const v = clean(params.get(key));
    if (v) utm[key] = v;
  }
  const refHost = hostOf(referrer);
  const sameSite = !!refHost && !!selfHost && refHost === selfHost;
  const referring_domain = refHost && !sameSite ? refHost : undefined;
  const owned = !!referring_domain && OWNED_HOSTS.test(referring_domain);

  const source = utm.utm_source?.toLowerCase();
  let channel: string;
  if (source) channel = X_SOURCES.has(source) ? 'x' : source;
  else if (referring_domain && X_HOSTS.test(referring_domain)) channel = 'x';
  else if (owned) channel = 'owned';
  else if (referring_domain && SEARCH_HOSTS.test(referring_domain)) channel = 'search';
  else if (referring_domain) channel = 'referral';
  else channel = 'direct';

  let x_account: string | undefined;
  if (channel === 'x') {
    const haystack = [utm.utm_content, utm.utm_campaign, utm.utm_term, params.get('ref')]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .replace(/@/g, '');
    x_account = KNOWN_X_ACCOUNTS.find((h) => haystack.includes(h));
  }

  return {
    ...utm,
    channel,
    ...(x_account ? { x_account } : {}),
    ...(referring_domain ? { referring_domain } : {}),
    landing_path: url.pathname,
  };
}

/** True when this visit carries campaign info worth recording as a new touch. */
export function isCampaignTouch(a: Attribution): boolean {
  return !!a.utm_source || a.channel === 'x' || a.channel === 'search' || !!a.x_account;
}

/** Super properties: first_touch_* (set once, never overwritten) and last_touch_*. */
export function toSuperProperties(a: Attribution, prefix: 'first_touch' | 'last_touch'): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(a)) {
    if (typeof v === 'string' && v) out[`${prefix}_${k}`] = v;
  }
  return out;
}
