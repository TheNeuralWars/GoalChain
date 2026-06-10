import { GlobalOptions } from '../utils.js';
interface HealthCheckOptions extends GlobalOptions {
}
export declare function healthCheckCommand(opts: HealthCheckOptions): Promise<void>;
export {};
