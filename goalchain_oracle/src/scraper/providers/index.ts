import type { FixtureProvider, PriceProvider, ScraperConfig } from '../types.js';

export class ProviderRegistry {
  private fixtureProviders: FixtureProvider[] = [];
  private priceProviders: PriceProvider[] = [];

  registerFixtureProvider(provider: FixtureProvider): void {
    this.fixtureProviders.push(provider);
  }

  registerPriceProvider(provider: PriceProvider): void {
    this.priceProviders.push(provider);
  }

  getFixtureProviders(): FixtureProvider[] {
    return [...this.fixtureProviders];
  }

  getPriceProviders(): PriceProvider[] {
    return [...this.priceProviders];
  }

  getFixtureProvider(name: string): FixtureProvider | undefined {
    return this.fixtureProviders.find(p => p.name === name);
  }

  getPriceProvider(name: string): PriceProvider | undefined {
    return this.priceProviders.find(p => p.name === name);
  }
}

export const providerRegistry = new ProviderRegistry();

export async function createProviders(config: ScraperConfig): Promise<{
  fixtureProviders: FixtureProvider[];
  priceProviders: PriceProvider[];
}> {
  const fixtureProviders: FixtureProvider[] = [];
  const priceProviders: PriceProvider[] = [];

  if (config.enableSportsApi) {
    const { SportsApiProvider } = await import('./sportsApi.js');
    const provider = new SportsApiProvider(config);
    fixtureProviders.push(provider);
    providerRegistry.registerFixtureProvider(provider);
  }

  if (config.enableChainlink) {
    const { ChainlinkProvider } = await import('./chainlink.js');
    const provider = new ChainlinkProvider(config);
    priceProviders.push(provider);
    providerRegistry.registerPriceProvider(provider);
  }

  if (config.enableDrift) {
    const { DriftProvider } = await import('./drift.js');
    const provider = new DriftProvider(config);
    priceProviders.push(provider);
    providerRegistry.registerPriceProvider(provider);
  }

  return { fixtureProviders, priceProviders };
}