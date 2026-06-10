import { createFormatter, GlobalOptions, OutputFormatter, CliError, handleError } from '../utils.js';
import * as fs from 'fs';
import * as path from 'path';

interface VersionOptions extends GlobalOptions {}

export async function versionCommand(opts: VersionOptions): Promise<void> {
  const formatter = createFormatter(opts.json ?? false, opts.verbose ?? false);

  try {
    const pkgPath = path.resolve(__dirname, '../../../package.json');
    let version = '1.0.0';
    let commitHash = 'unknown';

    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      version = pkg.version || version;
    }

    // Try to get git commit hash
    try {
      const { execSync } = await import('child_process');
      commitHash = execSync('git rev-parse --short HEAD', { cwd: path.resolve(__dirname, '../../..'), encoding: 'utf-8' }).trim();
    } catch {
      // Ignore if not a git repo
    }

    const info = {
      name: 'oracle',
      version,
      commit: commitHash,
      description: 'GoalChain Oracle CLI - Operations tooling for on-chain oracle operations',
    };

    formatter.success('Version info');
    formatter.output(info);

    formatter.exit(0);
  } catch (error) {
    handleError(formatter, error);
  }
}