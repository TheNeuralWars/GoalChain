import { GlobalOptions } from '../utils.js';
interface EconomyEpochOptions extends GlobalOptions {
    execute?: boolean;
    epoch?: string;
    start?: boolean;
    finalize?: boolean;
    claim?: boolean;
    pool?: string;
}
export declare function economyEpochCommand(opts: EconomyEpochOptions): Promise<void>;
export {};
