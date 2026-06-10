import { GlobalOptions } from '../utils.js';
interface ResolveFixturesOptions extends GlobalOptions {
    execute?: boolean;
    fixtureIds?: string;
}
export declare function resolveFixturesCommand(opts: ResolveFixturesOptions): Promise<void>;
export {};
