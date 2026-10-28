import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Client
  },
  {
    path: 'list',
    renderMode: RenderMode.Client
  },
  {
    path: 'watch/:type/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'watch/:id',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
