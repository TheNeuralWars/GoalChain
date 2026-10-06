import React, { useCallback, useEffect, useMemo } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletModalProvider, useWalletModal } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';
import { useWalletGateBridge } from './gate';

/**
 * The real Solana provider stack — code-split on purpose. This module (and the
 * @solana/* libs it pulls in) is only downloaded when the wallet gate opens
 * (connect button hover/click or a wallet-gated feature).
 */

/** Publishes wallet state + the modal opener back into the eager gate. */
function WalletStateBridge() {
  const gate = useWalletGateBridge();
  const { setVisible } = useWalletModal();
  const { publicKey, connected } = useWallet();
  const publicKeyBase58 = publicKey?.toBase58() ?? null;

  const openModal = useCallback(() => setVisible(true), [setVisible]);

  useEffect(() => {
    gate.register({ openModal });
  }, [gate.register, openModal]);

  useEffect(() => {
    gate.publishWalletState({ publicKeyBase58, connected });
  }, [gate.publishWalletState, publicKeyBase58, connected]);

  return null;
}

export default function WalletProviders({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletStateBridge />
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
