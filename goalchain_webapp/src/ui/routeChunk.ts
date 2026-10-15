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
