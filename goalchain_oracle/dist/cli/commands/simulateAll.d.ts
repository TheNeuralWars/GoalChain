import { GlobalOptions } from '../utils.js';
interface SimulateAllOptions extends GlobalOptions {
    dryRun?: boolean;
}
export declare function simulateAllCommand(opts: SimulateAllOptions): Promise<void>;
export {};
