import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const candidates = process.platform === 'win32'
  ? [join('backend', 'venv', 'Scripts', 'python.exe'), 'python']
  : [join('backend', 'venv', 'bin', 'python'), 'python3', 'python'];
const python = candidates.find(executable => executable === 'python' || executable === 'python3' || existsSync(executable));

if (!python) {
  console.error('Python was not found. Create a virtual environment and install requirements.txt.');
  process.exit(1);
}

const child = spawn(
  python,
  [
    '-m',
    'uvicorn',
    'backend.main:app',
    '--host',
    process.env.API_HOST || '127.0.0.1',
    '--port',
    process.env.API_PORT || '8000'
  ],
  { stdio: 'inherit' }
);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 1);
  }
});
