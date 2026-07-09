export function explorerTxUrl(txId: string, cluster: string = 'devnet'): string {
  const baseUrls = {
    devnet: 'https://explorer.solana.com/tx',
    testnet: 'https://explorer.solana.com/tx',
    mainnet: 'https://explorer.solana.com/tx'
  };
  return `${baseUrls[cluster]}/${txId}`;
}

export function explorerAccountUrl(accountId: string, cluster: string = 'devnet'): string {
  const baseUrls = {
    devnet: 'https://explorer.solana.com/address',
    testnet: 'https://explorer.solana.com/address',
    mainnet: 'https://explorer.solana.com/address'
  };
  return `${baseUrls[cluster]}/${accountId}`;
}

export function explorerProgramUrl(programId: string, cluster: string = 'devnet'): string {
  const baseUrls = {
    devnet: 'https://explorer.solana.com/address',
    testnet: 'https://explorer.solana.com/address',
    mainnet: 'https://explorer.solana.com/address'
  };
  return `${baseUrls[cluster]}/${programId}`;
}