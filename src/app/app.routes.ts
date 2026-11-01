import { Routes } from '@angular/router';
import { DiscoverComponent } from './pages/discover/discover';
import { MyListComponent } from './pages/my-list/my-list';
import { WatchComponent } from './components/watch/watch';
import { SearchComponent } from './pages/search/search';
import { ExploreComponent } from './pages/explore/explore';

export const routes: Routes = [
  { path: '', component: DiscoverComponent, pathMatch: 'full' },
  { path: 'explore', component: ExploreComponent },
  { path: 'search', component: SearchComponent },
  { path: 'list', component: MyListComponent },
  { path: 'watch/:type/:tmdb_id', component: WatchComponent },
  { path: 'watch/:id', component: WatchComponent },
  { path: '**', redirectTo: '' }
];
