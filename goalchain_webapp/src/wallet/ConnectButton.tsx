import React from 'react';
import { useWalletGate } from './gate';

/**
 * Lazy import of the real wallet button: the wallet-adapter UI chunk is only
 * fetched once the wallet stack is mounted (see gate.tsx).
 */
const WalletMultiButton = React.lazy(() =>
  import('@solana/wallet-adapter-react-ui').then((m) => ({ default: m.WalletMultiButton })),
);

/**
 * Header connect-wallet button. Before the wallet stack is loaded it is a plain
 * (fast, tiny) button that opens the wallet modal on click — which lazily loads
 * the Solana stack in the background. Hover/focus preloads the chunk so the
 * modal feels instant. After the stack is mounted it hands over to the stock
 * wallet-adapter button (connected state + dropdown).
 */
export function ConnectButton() {
  const gate = useWalletGate();

  if (gate.status === 'ready') {
    return (
      <React.Suspense
        fallback={
          <button type="button" className="wallet-connect-btn wallet-connect-btn--busy" disabled>
            Connect Wallet
          </button>
        }
      >
        <WalletMultiButton />
      </React.Suspense>
    );
  }

  return (
    <button
      type="button"
      className="wallet-connect-btn"
      onPointerEnter={gate.ensure}
      onFocus={gate.ensure}
      onClick={gate.openModal}
    >
      Connect Wallet
    </button>
  );
}
