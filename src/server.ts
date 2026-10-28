import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine({
  trustProxyHeaders: false,
  allowedHosts: ['localhost', '127.0.0.1', 'thecinematron.vercel.app']
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Proxy TMDB requests server-side so the API key remains outside the browser bundle.
 */
app.use('/api/tmdb', async (req, res, next) => {
  const apiKey = process.env['TMDB_API_KEY'];
  if (!apiKey) {
    res.status(500).json({ error: 'TMDB_API_KEY is not configured on the server.' });
    return;
  }

  const tmdbPath = req.url.split('?')[0];
  if (!tmdbPath.startsWith('/3/')) {
    res.status(404).json({ error: 'Unsupported TMDB API path.' });
    return;
  }

  try {
    const requestUrl = new URL(`https://api.themoviedb.org${req.url}`);
    requestUrl.searchParams.set('api_key', apiKey);
    const response = await fetch(requestUrl);
    const body = await response.text();

    res.status(response.status);
    res.type(response.headers.get('content-type') ?? 'application/json');
    res.send(body);
  } catch (error) {
    next(error);
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = Number(process.env['PORT'] || 4000);
  app.listen(port, '127.0.0.1', (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
