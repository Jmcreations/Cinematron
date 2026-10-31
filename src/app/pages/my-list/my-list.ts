import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieCardComponent } from '../../components/movie-card/movie-card';
import { MovieService, TMDBMovie } from '../../services/movie';
import { OverlayStateService } from '../../services/overlay-state';
import { IconComponent } from '../../components/icon/icon';
import { WatchHistoryMovie, WatchHistoryService } from '../../services/watch-history';
import { WatchlistService } from '../../services/watchlist';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-list',
  standalone: true,
  imports: [CommonModule, IconComponent, MovieCardComponent],
  templateUrl: './my-list.html'
})
export class MyListComponent implements OnInit {
  movieService = inject(MovieService);
  overlayService = inject(OverlayStateService);
  private changeDetector = inject(ChangeDetectorRef);
  private watchHistory = inject(WatchHistoryService);
  private watchlistService = inject(WatchlistService);
  private router = inject(Router);

  continueWatching: WatchHistoryMovie[] = [];
  watchlist: TMDBMovie[] = [];

  ngOnInit() {
    this.continueWatching = this.watchHistory.getMovies();
    this.watchlist = this.watchlistService.getMovies();
    this.changeDetector.markForCheck();
  }

  openDetails(event: any) {
    const id = typeof event === 'number' ? event : event.id;
    const type = event.type || 'movie';
    this.overlayService.openDetails(id, type);
  }

  resume(movie: any) {
    this.router.navigate(['/watch', movie.media_type || 'movie', movie.id]);
  }
}
