import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

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
    // Kick the dynamic import immediately. WalletGateBridge renders the lazy
    // provider component as soon as status leaves 'idle'.
    import('./WalletProviders').catch((err) => {
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
      ensure,
      openModal,
      register,
      publishWalletState,
    }),
    [status, walletState, ensure, openModal, register, publishWalletState],
  );

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
 * providers (light first paint); once requested, the lazy provider stack wraps
 * the same children.
 */
export function WalletGateBridge({ children }: { children: React.ReactNode }) {
  const gate = useWalletGate();
  if (gate.status === 'idle') return <>{children}</>;
  return (
    <React.Suspense fallback={null}>
      <LazyWalletProviders>{children}</LazyWalletProviders>
    </React.Suspense>
  );
}
