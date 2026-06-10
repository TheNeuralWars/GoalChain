import { GlobalOptions } from '../utils.js';
interface CrankVaultOptions extends GlobalOptions {
    execute?: boolean;
    batchSize?: string;
}
export declare function crankVaultCommand(opts: CrankVaultOptions): Promise<void>;
export {};
