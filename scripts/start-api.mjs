import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const candidates = process.platform === 'win32'
  ? [join('backend', 'venv', 'Scripts', 'python.exe'), 'python']
  : [join('backend', 'venv', 'bin', 'python'), 'python3', 'python'];
const python = candidates.find(executable => executable === 'python' || executable === 'python3' || existsSync(executable));

if (!python) {
  console.error('Python was not found. Create a virtual environment and install requirements.txt.');
  process.exit(1);
}

const tmdbAccessToken = process.env.TMDB_READ_ACCESS_TOKEN?.trim();
if (!tmdbAccessToken || tmdbAccessToken === 'replace_with_your_tmdb_read_access_token') {
  console.error(
    'TMDB_READ_ACCESS_TOKEN is missing. Copy .env.example to .env and set the TMDB API Read Access Token before starting the API.'
  );
  process.exit(1);
}

try {
  const tmdbResponse = await fetch(
    'https://api.themoviedb.org/3/trending/movie/week',
    { headers: { Authorization: `Bearer ${tmdbAccessToken}` } }
  );
  if (!tmdbResponse.ok) {
    const details = await tmdbResponse.json().catch(() => ({}));
    console.error(
      `TMDB_READ_ACCESS_TOKEN was rejected (${tmdbResponse.status}): ${
        details.status_message || 'TMDB request failed.'
      }`
    );
    process.exit(1);
  }
} catch (error) {
  console.error('Unable to validate TMDB_API_KEY. Check your network connection.', error);
  process.exit(1);
}

const migration = spawnSync(python, ['-m', 'backend.migrate'], { stdio: 'inherit' });
if (migration.status !== 0) {
  process.exit(migration.status ?? 1);
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
