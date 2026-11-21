import React, { useLayoutEffect, useState } from 'react';

/**
 * Session-sticky sub-tab state + scroll memory (auto-improve 2026-11-21).
 *
 * The wallet-stack tree swap in wallet/gate.tsx is a one-time full-app remount,
 * so any tab selection held only in component state would be silently reset —
 * the visible form of the bug was "the Market tab needs a second click on the
 * first visit". This module keeps the selection in a module-level store so it
 * survives remounts (and stays sticky when navigating away and back within the
 * session). Storage is in-memory only: a real page reload starts fresh.
 *
 * The remount also resets the window scroll position (measured live: 300px →
 * 24px), so the swapped-in tree renders <ScrollRestore/> first: it re-applies
 * the remembered offset in a layout effect, before paint.
 */
const memory = new Map<string, string>();

export function usePersistentTab<T extends string>(
  key: string,
  initial: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => (memory.get(key) as T | undefined) ?? initial);
  const set: React.Dispatch<React.SetStateAction<T>> = (next) => {
    setValue((prev) => {
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      memory.set(key, resolved);
      return resolved;
    });
  };
  return [value, set];
}

let lastScrollY = 0;
if (typeof window !== 'undefined') {
  window.addEventListener(
    'scroll',
    () => {
      lastScrollY = window.scrollY;
    },
    { passive: true },
  );
}

/** Restores the remembered window scroll offset when the app tree remounts. */
export function ScrollRestore(): null {
  useLayoutEffect(() => {
    const target = lastScrollY;
    if (target <= 0) return;
    window.scrollTo(0, target);
    // The freshly remounted tree can still be shorter than the target offset
    // (images/lazy panels loading), in which case scrollTo is clamped — keep
    // retrying until the offset sticks, but back off the moment the user
    // scrolls or interacts themselves.
    let cancelled = false;
    const cancel = () => {
      cancelled = true;
    };
    window.addEventListener('wheel', cancel, { passive: true });
    window.addEventListener('touchstart', cancel, { passive: true });
    window.addEventListener('pointerdown', cancel, { passive: true });
    window.addEventListener('keydown', cancel);
    const startedAt = Date.now();
    const retry = () => {
      if (cancelled) return;
      if (window.scrollY >= target) return; // offset reached
      window.scrollTo(0, target);
      if (Date.now() - startedAt < 3000) requestAnimationFrame(retry);
    };
    requestAnimationFrame(retry);
    return () => {
      cancelled = true;
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchstart', cancel);
      window.removeEventListener('pointerdown', cancel);
      window.removeEventListener('keydown', cancel);
    };
  }, []);
  return null;
}
