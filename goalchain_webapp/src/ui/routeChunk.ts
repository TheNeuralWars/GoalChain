import React from 'react';

export type PrefetchableLazyComponent<T extends React.ComponentType<any>> =
  React.LazyExoticComponent<T> & { prefetch: () => void };

/**
 * React.lazy with a shared, prefetchable loader (auto-improve 2026-10-15).
 *
 * Plain React.lazy starts fetching the route chunk only when the component
 * first renders. On wallet-gated routes (`<WalletRequired>` around a lazy
 * component) that render is deferred until the wallet stack chunk has loaded,
 * so the two chunks load strictly one after the other — the direct-entry
 * waterfall behind the slow /perfil/:username LCP.
 *
 * `prefetch()` starts the same import early — the wallet-gated pages call it
 * on mount, in parallel with the wallet stack fetch — so the route chunk is
 * ready by the time the gate opens. The loader caches its promise, so prefetch
 * and render share a single fetch (ESM's module cache would dedupe double
 * imports anyway).
 *
 * Keep prefetch timing at the wallet-gate phase: starting these imports at
 * main-chunk eval instead pulls the page's @solana/* dependency tree into the
 * critical font/locale phase and measurably delays FCP/LCP on throttled
 * connections (measured 2026-10-15, evidence in the run log).
 */
export function lazyRoute<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): PrefetchableLazyComponent<T> {
  let pending: Promise<{ default: T }> | null = null;
  const load = (): Promise<{ default: T }> => {
    if (!pending) {
      pending = factory();
      // A failed fetch (offline blip) must not poison the cache forever.
      pending.catch(() => {
        pending = null;
      });
    }
    return pending;
  };
  const Lazy = React.lazy(load) as PrefetchableLazyComponent<T>;
  Lazy.prefetch = () => {
    void load();
  };
  return Lazy;
}

/**
 * Start prefetching chunks once the browser is idle (auto-improve 2026-10-17).
 *
 * Portal sub-panels behind tab switches used to fetch only on first click, so
 * every tab switch paid a full chunk fetch after the click. Prefetching them at
 * portal mount would instead contend with the portal's own first render and the
 * default panel's fetch (same lesson as the 2026-10-15 run: prefetch timing
 * matters). Idle timing keeps them off the critical phase while still warming
 * the cache before the user reaches a tab. `timeoutMs` guarantees the prefetch
 * even on pages that stay busy (e.g. while the wallet stack loads).
 */
export function prefetchOnIdle(
  loaders: ReadonlyArray<{ prefetch: () => void }>,
  timeoutMs = 2000,
): void {
  if (typeof window === 'undefined') return;
  const run = () => {
    for (const loader of loaders) loader.prefetch();
  };
  const ric = (
    window as Window & {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number },
      ) => number;
    }
  ).requestIdleCallback;
  if (typeof ric === 'function') {
    ric.call(window, run, { timeout: timeoutMs });
  } else {
    window.setTimeout(run, timeoutMs);
  }
}
