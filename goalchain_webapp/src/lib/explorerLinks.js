/*
 * Solana Explorer Links Helper
 * Provides cluster-aware explorer URLs for programs and transactions
 */
/**
 * Get cluster-aware explorer URL for a transaction
 * @param txId Transaction ID
 * @param connection Solana connection
 * @returns Explorer URL
 */
export function explorerTxUrl(txId, connection) {
    const cluster = connection.rpcEndpoint.includes('devnet') ? 'devnet' : 'mainnet';
    return `https://explorer.solana.com/tx/${txId}?cluster=${cluster}`;
}
/**
 * Get cluster-aware explorer URL for a program
 * @param programId Program ID
 * @param connection Solana connection
 * @returns Explorer URL
 */
export function explorerProgramUrl(programId, connection) {
    const cluster = connection.rpcEndpoint.includes('devnet') ? 'devnet' : 'mainnet';
    return `https://explorer.solana.com/address/${programId}?cluster=${cluster}`;
}
