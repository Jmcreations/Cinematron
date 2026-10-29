import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const candidates = process.platform === 'win32'
  ? [join('backend', 'venv', 'Scripts', 'python.exe'), 'python']
  : [join('backend', 'venv', 'bin', 'python'), 'python3', 'python'];
const python = candidates.find(executable => executable === 'python' || executable === 'python3' || existsSync(executable));

if (!python) {
  console.error('Python was not found. Create a virtual environment and install requirements.txt.');
  process.exit(1);
}

const result = spawnSync(python, ['-m', 'backend.migrate'], { stdio: 'inherit' });
process.exit(result.status ?? 1);
