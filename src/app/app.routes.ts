import { Routes } from '@angular/router';
import { DiscoverComponent } from './pages/discover/discover';
import { MyListComponent } from './pages/my-list/my-list';
import { WatchComponent } from './components/watch/watch';

export const routes: Routes = [
  { path: '', component: DiscoverComponent, pathMatch: 'full' }, 
  { path: 'list', component: MyListComponent },
  { path: 'watch/:id', component: WatchComponent },
  { path: '**', redirectTo: '' }
];