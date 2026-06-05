import type { PriceProvider, ProviderResponse, ScraperConfig } from '../types.js';

interface ChainlinkFeed {
  address: string;
  symbol: string;
  decimals: number;
}

const CHAINLINK_FEEDS: Record<string, ChainlinkFeed> = {
  'SOL/USD': { address: '0x99B8235b4E1f552764b51C1e6C1B0d3D2b0e3D3E', symbol: 'SOL/USD', decimals: 8 },
  'BTC/USD': { address: '0x2b89d999E527a2e3C6565D1c248a3B8e5c0D7e0A', symbol: 'BTC/USD', decimals: 8 },
  'ETH/USD': { address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419', symbol: 'ETH/USD', decimals: 8 },
  'GCH/USD': { address: '', symbol: 'GCH/USD', decimals: 6 },
};

export class ChainlinkProvider implements PriceProvider {
  name = 'chainlink';
  private rateLimitRemaining = 100;
  private rateLimitReset = Date.now() + 60_000;
  private config: ScraperConfig;
  private rpcUrl: string;

  constructor(config: ScraperConfig) {
    this.config = config;
    this.rpcUrl = config.chainlinkRpcUrl || 'https://api.mainnet-beta.solana.com';
  }

  getRateLimitInfo(): { remaining: number; reset: number } {
    return { remaining: this.rateLimitRemaining, reset: this.rateLimitReset };
  }

  async fetchPrice(symbol: string, config: ScraperConfig): Promise<ProviderResponse<number>> {
    const feed = CHAINLINK_FEEDS[symbol];
    if (!feed || !feed.address) {
      return { success: false, error: `No Chainlink feed configured for ${symbol}` };
    }

    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getAccountInfo',
          params: [feed.address, { encoding: 'base64' }],
        }),
      });

      if (!response.ok) {
        return { success: false, error: `RPC error: ${response.statusText}` };
      }

      const data = await response.json();
      if (!data.result?.value?.data?.[0]) {
        return { success: false, error: 'Feed account not found' };
      }

      const accountData = Buffer.from(data.result.value.data[0], 'base64');
      const price = this.decodeChainlinkPrice(accountData, feed.decimals);

      return { success: true, data: price, rateLimitRemaining: this.rateLimitRemaining, rateLimitReset: this.rateLimitReset };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private decodeChainlinkPrice(data: Buffer, decimals: number): number {
    if (data.length < 120) return 0;
    const answerOffset = 88;
    const answerBytes = data.slice(answerOffset, answerOffset + 8);
    const rawAnswer = answerBytes.readBigInt64LE();
    return Number(rawAnswer) / Math.pow(10, decimals);
  }
}