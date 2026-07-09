import { clusterApiUrl, PublicKey } from '@solana/web3.js';

const EXPLORER_BASE_URLS: Record<string, string> = {
  'mainnet-beta': 'https://explorer.solana.com',
  'devnet': 'https://explorer.solana.com',
  'testnet': 'https://explorer.solana.com',
  'localnet': 'http://localhost:8899'
}; 'localnet': 'http://localhost:8899'
};
// Get the explorer URL for a transaction
function explorerTxUrl(txId: string, cluster: string = 'mainnet-beta'): string {
  const baseUrl = cluster === 'localnet' ? 'http://localhost:8899' : 'https://explorer.solana.com';
  return `${baseUrl}/tx/${txId}`;
}

// Get the explorer URL for an account
function explorerAccountUrl(accountId: string, cluster: string = 'mainnet-beta'): string {
  const baseUrl = EXPLORER_BASE_URLS[cluster] || EXPLORER_BASE_URLS['mainnet-beta'];
  return `${baseUrl}/address/${accountId}`;
}

// Get the explorer URL for a program
function explorerProgramUrl(programId: string, cluster: string = 'mainnet-beta'): string {
  const baseUrl = EXPLORER_BASE_URLS[cluster] || EXPLORER_BASE_URLS['mainnet-beta'];
  return `${baseUrl}/address/${programId}`;
}

export {
  explorerTxUrl,
  explorerAccountUrl,
  explorerProgramUrl
};