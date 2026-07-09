/*
 * Solana Explorer Links Helper
 * Provides cluster-aware explorer URLs for programs and transactions
 */

import { Connection } from '@solana/web3.js';

/**
 * Get cluster-aware explorer URL for a transaction
 * @param txId Transaction ID
 * @param connection Solana connection
 * @returns Explorer URL
 */
export function explorerTxUrl(txId: string, connection: Connection): string {
  const cluster = connection.rpcEndpoint.includes('devnet') ? 'devnet' : 'mainnet';
  return `https://explorer.solana.com/tx/${txId}?cluster=${cluster}`;
}

/**
 * Get cluster-aware explorer URL for a program
 * @param programId Program ID
 * @param connection Solana connection
 * @returns Explorer URL
 */
export function explorerProgramUrl(programId: string, connection: Connection): string {
  const cluster = connection.rpcEndpoint.includes('devnet') ? 'devnet' : 'mainnet';
  return `https://explorer.solana.com/address/${programId}?cluster=${cluster}`;
}
