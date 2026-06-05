import type { PriceProvider, ProviderResponse, ScraperConfig } from '../types.js';

interface DriftMarket {
  marketIndex: number;
  symbol: string;
  oracleSource: string;
  oracle: string;
}

const DRIFT_MARKETS: Record<string, DriftMarket> = {
  'SOL-PERP': { marketIndex: 0, symbol: 'SOL-PERP', oracleSource: 'pyth', oracle: 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN719K48qKRT' },
  'BTC-PERP': { marketIndex: 1, symbol: 'BTC-PERP', oracleSource: 'pyth', oracle: 'GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UyMU' },
  'ETH-PERP': { marketIndex: 2, symbol: 'ETH-PERP', oracleSource: 'pyth', oracle: 'JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB' },
};

export class DriftProvider implements PriceProvider {
  name = 'drift';
  private rateLimitRemaining = 100;
  private rateLimitReset = Date.now() + 60_000;
  private config: ScraperConfig;
  private rpcUrl: string;

  constructor(config: ScraperConfig) {
    this.config = config;
    this.rpcUrl = config.driftRpcUrl || 'https://api.mainnet-beta.solana.com';
  }

  getRateLimitInfo(): { remaining: number; reset: number } {
    return { remaining: this.rateLimitRemaining, reset: this.rateLimitReset };
  }

  async fetchPrice(symbol: string, config: ScraperConfig): Promise<ProviderResponse<number>> {
    const market = DRIFT_MARKETS[symbol];
    if (!market) {
      return { success: false, error: `No Drift market configured for ${symbol}` };
    }

    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getAccountInfo',
          params: [market.oracle, { encoding: 'base64' }],
        }),
      });

      if (!response.ok) {
        return { success: false, error: `RPC error: ${response.statusText}` };
      }

      const data = await response.json();
      if (!data.result?.value?.data?.[0]) {
        return { success: false, error: 'Oracle account not found' };
      }

      const accountData = Buffer.from(data.result.value.data[0], 'base64');
      const price = this.decodePythPrice(accountData);

      return { success: true, data: price, rateLimitRemaining: this.rateLimitRemaining, rateLimitReset: this.rateLimitReset };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private decodePythPrice(data: Buffer): number {
    if (data.length < 200) return 0;
    const priceOffset = 128;
    const confOffset = 136;
    const expoOffset = 144;

    const priceBytes = data.slice(priceOffset, priceOffset + 8);
    const confBytes = data.slice(confOffset, confOffset + 8);
    const expoBytes = data.slice(expoOffset, expoOffset + 2);

    const price = priceBytes.readBigInt64LE();
    const expo = expoBytes.readInt16LE();

    return Number(price) * Math.pow(10, expo);
  }
}