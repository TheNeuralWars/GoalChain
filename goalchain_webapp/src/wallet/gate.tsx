import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { prefetchOnIdle } from '../ui/routeChunk';
import { ScrollRestore } from '../ui/tabMemory';

/**
 * Wallet gate — the only wallet-related module in the eager bundle.
 *
 * It imports NO Solana libraries. The real provider stack lives in
 * `./WalletProviders`, a lazily-imported chunk that is only fetched when the
 * user reaches for a wallet (connect button hover/click, a wallet feature
 * wrapped in <WalletRequired>, etc.).
 */

export type WalletGateStatus = 'idle' | 'loading' | 'ready';

export interface WalletGateState {
  /** 'idle' = wallet chunk not requested yet, 'loading' = chunk loading, 'ready' = providers mounted. */
  status: WalletGateStatus;
  /** Base58 wallet address once connected (published by the provider bridge). */
  publicKeyBase58: string | null;
  connected: boolean;
  /**
   * True once the wallet stack module has finished downloading. The bridge
   * keeps rendering the app untouched until this flips (see WalletGateBridge):
   * swapping the tree while the chunk is still in flight blanks the whole app
   * behind the Suspense fallback and remounts it mid-interaction.
   */
  stackReady: boolean;
  /** Load the wallet chunk if not loaded yet. Idempotent, safe to call often. */
  ensure: () => void;
  /** Open the wallet picker modal (loads the wallet stack on first call). */
  openModal: () => void;
}

/** Full gate API incl. register/publish (used by the lazy provider chunk). */
export interface WalletGateBridgeApi extends WalletGateState {
  register: (ops: { openModal: () => void }) => void;
  publishWalletState: (s: { publicKeyBase58: string | null; connected: boolean }) => void;
}

type WalletGateApi = WalletGateBridgeApi;

// Lazily-loaded provider stack (dynamic import → separate chunk, fetched on demand).
const LazyWalletProviders = React.lazy(() => import('./WalletProviders'));

const WalletGateContext = createContext<WalletGateApi | null>(null);

export function WalletGateProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<WalletGateStatus>('idle');
  const [stackReady, setStackReady] = useState(false);
  const [walletState, setWalletState] = useState<{
    publicKeyBase58: string | null;
    connected: boolean;
  }>({ publicKeyBase58: null, connected: false });

  const statusRef = useRef<WalletGateStatus>('idle');
  const openerRef = useRef<(() => void) | null>(null);
  const pendingOpenRef = useRef(false);

  const ensure = useCallback(() => {
    if (statusRef.current !== 'idle') return;
    statusRef.current = 'loading';
    setStatus('loading');
    // Kick the dynamic import immediately. WalletGateBridge keeps the current
    // app tree in place until the module has actually downloaded (stackReady),
    // then swaps in the lazy provider component — which resolves instantly
    // from the module cache.
    import('./WalletProviders')
      .then(() => {
        setStackReady(true);
      })
      .catch((err) => {
        console.error('[wallet] failed to load the wallet stack', err);
        statusRef.current = 'idle';
        openerRef.current = null;
        setStatus('idle');
      });
  }, []);

  const openModal = useCallback(() => {
    if (openerRef.current) {
      openerRef.current();
      return;
    }
    pendingOpenRef.current = true;
    ensure();
  }, [ensure]);

  const register = useCallback((ops: { openModal: () => void }) => {
    openerRef.current = ops.openModal;
    statusRef.current = 'ready';
    setStatus('ready');
    if (pendingOpenRef.current) {
      pendingOpenRef.current = false;
      ops.openModal();
    }
  }, []);

  const publishWalletState = useCallback(
    (s: { publicKeyBase58: string | null; connected: boolean }) =>
      // Keep the same object when nothing changed — a fresh object every time
      // would retrigger the bridge effect forever (infinite render loop).
      setWalletState((prev) =>
        prev.publicKeyBase58 === s.publicKeyBase58 && prev.connected === s.connected ? prev : s,
      ),
    [],
  );

  const value = useMemo<WalletGateApi>(
    () => ({
      status,
      publicKeyBase58: walletState.publicKeyBase58,
      connected: walletState.connected,
      stackReady,
      ensure,
      openModal,
      register,
      publishWalletState,
    }),
    [status, walletState, stackReady, ensure, openModal, register, publishWalletState],
  );

  // Warm the wallet stack once the browser is idle (auto-improve 2026-11-21).
  // The provider tree swap is a one-time full app remount (see
  // WalletGateBridge) — routing it to idle time means it happens before the
  // user interacts, so no click is ever swallowed and no UI state is lost.
  // Idle timing keeps the download out of the critical phase (same lesson as
  // routeChunk's prefetchOnIdle: eager-at-boot measurably delays FCP/LCP);
  // `timeoutMs` guarantees the warm-up even on pages that stay busy.
  useEffect(() => {
    prefetchOnIdle([
      {
        prefetch: () => {
          import('./WalletProviders')
            .then(() => {
              setStackReady(true);
            })
            .catch(() => {
              /* offline blip: stay idle; a later hover/click retries via ensure() */
            });
        },
      },
    ]);
  }, []);

  return <WalletGateContext.Provider value={value}>{children}</WalletGateContext.Provider>;
}

export function useWalletGate(): WalletGateState {
  const ctx = useContext(WalletGateContext);
  if (!ctx) throw new Error('useWalletGate must be used inside <WalletGateProvider>');
  return ctx;
}

/** Full API (incl. register/publishWalletState) — lazy provider chunk only. */
export function useWalletGateBridge(): WalletGateBridgeApi {
  const ctx = useContext(WalletGateContext);
  if (!ctx) throw new Error('useWalletGateBridge must be used inside <WalletGateProvider>');
  return ctx;
}

/**
 * Renders its children only once the wallet stack is mounted (they may use
 * wallet-adapter hooks). Triggers the lazy wallet load on mount.
 */
export function WalletRequired({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const gate = useWalletGate();
  useEffect(() => {
    gate.ensure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (gate.status !== 'ready') {
    return (
      <>
        {fallback ?? (
          <div className="wallet-gate-loading" role="status">
            Loading wallet…
          </div>
        )}
      </>
    );
  }
  return <>{children}</>;
}

/**
 * Wraps the whole app: while the wallet chunk is idle the app renders without
 * providers (light first paint); once the stack has downloaded, the lazy
 * provider stack wraps the same children.
 *
 * NOTE: swapping `children` under <LazyWalletProviders> is a one-time FULL APP
 * REMOUNT — React cannot insert an ancestor around mounted children without
 * remounting them (positional reconciliation). Two consequences are handled
 * here and in WalletGateProvider:
 *   1. Never swap while the chunk is still in flight: the Suspense fallback
 *      (null) would blank the whole app, and the remount would land
 *      mid-interaction, swallowing the click that triggered the wallet load
 *      (observed as "Market tab needs a second click on first visit").
 *   2. The provider warms the chunk at idle (prefetchOnIdle), so the swap —
 *      and with it the one remount — happens before user interaction.
 * Portal sub-tabs are additionally session-sticky (ui/tabMemory.ts) so no tab
 * selection is ever lost to the remount.
 */
export function WalletGateBridge({ children }: { children: React.ReactNode }) {
  const gate = useWalletGate();
  if (!gate.stackReady) return <>{children}</>;
  return (
    <React.Suspense fallback={null}>
      <LazyWalletProviders>
        <ScrollRestore />
        {children}
      </LazyWalletProviders>
    </React.Suspense>
  );
}
