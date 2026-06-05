export class ProviderRegistry {
    fixtureProviders = [];
    priceProviders = [];
    registerFixtureProvider(provider) {
        this.fixtureProviders.push(provider);
    }
    registerPriceProvider(provider) {
        this.priceProviders.push(provider);
    }
    getFixtureProviders() {
        return [...this.fixtureProviders];
    }
    getPriceProviders() {
        return [...this.priceProviders];
    }
    getFixtureProvider(name) {
        return this.fixtureProviders.find(p => p.name === name);
    }
    getPriceProvider(name) {
        return this.priceProviders.find(p => p.name === name);
    }
}
export const providerRegistry = new ProviderRegistry();
export async function createProviders(config) {
    const fixtureProviders = [];
    const priceProviders = [];
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
