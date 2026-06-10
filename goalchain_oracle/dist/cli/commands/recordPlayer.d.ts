import { GlobalOptions } from '../utils.js';
interface RecordPlayerOptions extends GlobalOptions {
    execute?: boolean;
    fixture: string;
    player: string;
    goals: number;
    assists: number;
}
export declare function recordPlayerCommand(opts: RecordPlayerOptions): Promise<void>;
export {};
