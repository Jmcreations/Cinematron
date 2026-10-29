# Cinematron

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.11.

## Development server

Create a local `.env` file from `.env.example` and set your local secrets:

```bash
cp .env.example .env
```

The `.env` file is ignored by Git. Never copy real credentials into
`.env.example`; it is a safe template intended to be committed.

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to
`http://localhost:4200/`. `npm start` launches both Angular and the local
Python API; you do not need to start a second backend terminal.

The development server proxies API requests to the SSR server. Start the SSR
server in a second terminal after building:

The application automatically reloads whenever you modify source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

To run the built application with the TMDB proxy enabled:

```bash
npm run build
npm run serve:ssr:Cinematron
```

## Database migrations

The schema is managed with Alembic rather than being created during application
import. Apply pending migrations with:

```bash
npm run migrate
```

`npm start` runs migrations before starting the local API. Vercel runs them
when the Python function is initialized. Create a new revision with Alembic
after changing the SQLAlchemy models, review it, and commit the revision:

```bash
backend/venv/bin/alembic revision --autogenerate -m "describe schema change"
```

### Python API on Vercel

The Python API is exposed through [api/index.py](./api/index.py), so Vercel
deploys it as a serverless function automatically. You do not need to run
`backend/main.py` manually in production. Vercel installs the dependencies
from `requirements.txt` and invokes the FastAPI application when an API
request arrives.

The deployed SQLite database uses Vercel's temporary `/tmp` filesystem. It is
appropriate for development and smoke testing, but it is not durable storage;
configure Vercel Postgres before relying on ratings or watchlists in production.
After creating a Vercel Postgres integration, add its connection string to the
Vercel project as `POSTGRES_URL` or `DATABASE_URL`; the backend supports either
name and automatically selects PostgreSQL.

## Production checklist

- Add `TMDB_API_KEY`, `POSTGRES_URL` (or `DATABASE_URL`), and `CORS_ORIGINS` to
  Vercel Project Settings → Environment Variables. Use the Production,
  Preview, and Development scopes intentionally.
- Redeploy after changing Vercel environment variables. Local changes do not
  update Vercel until the connected branch is pushed and a deployment
  completes.
- Use a hosted PostgreSQL database for durable ratings and watchlists. The
  current `Base.metadata.create_all()` setup is suitable for the initial
  schema only; use migrations before making schema changes.
- Replace the placeholder Google authentication endpoint with verified OAuth
  token validation and signed, expiring sessions before enabling real accounts.
- Move user identity from the temporary `user_id=1` defaults to authenticated
  request context.
- Replace third-party streaming embeds with a licensed provider if reliable
  playback controls, ad control, and production rights are required.
- Add rate limiting, structured error logging, health checks, and automated
  tests for authentication, ratings, watchlists, and TMDB failures.
- Rotate any TMDB key that was previously committed to Git history.

For local development, run the API with:

```bash
python3 -m venv backend/venv
backend/venv/bin/pip install -r requirements.txt
npm start
```

`npm start` starts both Angular and the local Python API automatically. The
Python API binds only to `127.0.0.1`; it is not exposed to the network.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
