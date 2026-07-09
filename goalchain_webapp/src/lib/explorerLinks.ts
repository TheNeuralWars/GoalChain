/**
 * explorerLinks.ts — Solana Explorer URL builder for GoalChain
 *
 * Generates links to the official Solana Explorer for transactions,
 * accounts, and the GoalChain program page.
 *
 * Inspired by Solana Explorer enhancements (verified programs, Codama
 * IDL interaction, feature gates) announced by @SolPlay_jonas.
 * See: docs/VERIFIED_BUILD_GUIDE.md
 *
 * Issue #847 (voice task xq).
 */

import { getCluster, getProgramId } from '@goalchain/sdk';

const EXPLORER_BASE = 'https://explorer.solana.com';

type ExplorerEntity = 'tx' | 'address' | 'block';

function clusterParam(): string {
  const cluster = getCluster();
  if (cluster === 'mainnet') return ''; // mainnet is the default
  return `?cluster=${cluster}`;
}

/** Full explorer URL for a transaction signature. */
export function explorerTxUrl(signature: string): string {
  return `${EXPLORER_BASE}/tx/${signature}${clusterParam()}`;
}

/** Full explorer URL for any account / pubkey (wallets, PDAs, mints). */
export function explorerAccountUrl(address: string): string {
  return `${EXPLORER_BASE}/address/${address}${clusterParam()}`;
}

/** Full explorer URL for the GoalChain program page (IDL, verified build). */
export function explorerProgramUrl(): string {
  return explorerAccountUrl(getProgramId().toBase58());
}

/** Open an explorer link in a new tab (browser only). */
export function openExplorer(entity: ExplorerEntity, id: string): void {
  const url =
    entity === 'tx'
      ? explorerTxUrl(id)
      : explorerAccountUrl(id);
  window.open(url, '_blank', 'noopener,noreferrer');
}
