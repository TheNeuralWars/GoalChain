import { createFormatter, GlobalOptions, createConnection, getProgramId, loadConfig, OutputFormatter, CliError, handleError } from '../utils.js';

interface HealthCheckOptions extends GlobalOptions {}

export async function healthCheckCommand(opts: HealthCheckOptions): Promise<void> {
  const formatter = createFormatter(opts.json ?? false, opts.verbose ?? false);

  try {
    const connection = createConnection(opts);
    const config = loadConfig();

    formatter.log('Running health checks...', { rpcUrl: connection.rpcEndpoint });

    const checks: Array<{ name: string; status: 'pass' | 'fail' | 'warn'; latencyMs?: number; detail?: string }> = [];

    // RPC check
    const rpcStart = Date.now();
    try {
      const slot = await connection.getSlot();
      checks.push({
        name: 'RPC Connection',
        status: 'pass',
        latencyMs: Date.now() - rpcStart,
        detail: `Slot ${slot}`,
      });
    } catch (e) {
      checks.push({
        name: 'RPC Connection',
        status: 'fail',
        detail: String(e),
      });
    }

    // Jito check (if enabled)
    if (config.jito.enabled) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), config.healthCheck.jitoTimeoutMs);
        await fetch(config.jito.blockEngineUrl + '/health', { signal: controller.signal });
        clearTimeout(timeout);
        checks.push({ name: 'Jito Block Engine', status: 'pass', detail: config.jito.blockEngineUrl });
      } catch {
        checks.push({ name: 'Jito Block Engine', status: 'warn', detail: 'Health endpoint unreachable' });
      }
    }

    // Priority fees check
    checks.push({
      name: 'Priority Fees Config',
      status: 'pass',
      detail: `microLamports: ${config.priorityFees.microLamports}, max: ${config.priorityFees.maxPriorityFee}`,
    });

    // Program ID check
    checks.push({
      name: 'Program ID',
      status: 'pass',
      detail: config.programId,
    });

    const overall = checks.every(c => c.status === 'pass') ? 'healthy' :
      checks.some(c => c.status === 'fail') ? 'critical' : 'warning';

    formatter.success(`Health check complete: ${overall}`);
    formatter.output({
      overall,
      checks,
      network: opts.network || 'devnet',
      rpcUrl: connection.rpcEndpoint,
      timestamp: new Date().toISOString(),
    });

    formatter.exit(overall === 'critical' ? 2 : 0);
  } catch (error) {
    handleError(formatter, error);
  }
}