import { spawn } from 'node:child_process';
import os from 'node:os';

// Ensure Turbopack is not selected (it compiles extremely slowly on this Windows setup).
delete process.env.TURBOPACK;

const totalMemMB = Math.floor(os.totalmem() / 1024 / 1024);
// Give the dev server more headroom before Next.js auto-restarts at 80% heap usage.
const maxOldSpaceMB = Math.min(Math.max(4096, Math.floor(totalMemMB * 0.6)), 8192);

const existingNodeOptions = process.env.NODE_OPTIONS ?? '';
const nodeOptions = `${existingNodeOptions} --max-old-space-size=${maxOldSpaceMB}`.trim();

const child = spawn(
  'next',
  ['dev', '--webpack', '--disable-source-maps'],
  {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_OPTIONS: nodeOptions,
      // Limit file watchers — unbounded watchers can balloon memory on Windows.
      WATCHPACK_WATCHER_LIMIT: '20',
    },
  }
);

child.on('exit', (code) => process.exit(code ?? 0));