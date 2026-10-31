import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService, TMDBMovie } from '../../services/movie';
import { OverlayStateService } from '../../services/overlay-state';
import { HeroComponent } from '../../components/hero/hero';
import { MovieCardComponent } from '../../components/movie-card/movie-card';
import { IconComponent } from '../../components/icon/icon';
import { catchError, filter, of, Subject, switchMap } from 'rxjs';
import { WatchHistoryService } from '../../services/watch-history';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [CommonModule, HeroComponent, MovieCardComponent, IconComponent],
  templateUrl: './discover.html'
})
export class DiscoverComponent implements OnInit {
  movieService = inject(MovieService);
  overlayService = inject(OverlayStateService);
  router = inject(Router);
  private changeDetector = inject(ChangeDetectorRef);
  private watchHistory = inject(WatchHistoryService);

  top10: TMDBMovie[] = [];
  continueWatching: TMDBMovie[] = [];

  genres: any[] = [];
  selectedGenre = { id: 28, name: 'Action' }; // Default to Action
  genreMovies: TMDBMovie[] = [];
  showGenreDropdown = false;
  private genreSelection = new Subject<{ id: number; name: string }>();

  ngOnInit() {
    this.refreshWatchHistory();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => this.refreshWatchHistory());

    this.movieService.getTrendingMovies().pipe(
      catchError(error => {
        console.error('Unable to load trending movies', error);
        return of([]);
      })
    ).subscribe(movies => {
      this.top10 = movies.slice(0, 10);
      this.changeDetector.markForCheck();
    });

    this.genreSelection.pipe(
      switchMap(({ id, name }) => {
        this.selectedGenre = { id, name };
        return this.movieService.getMoviesByGenre(id).pipe(
          catchError(error => {
            console.error('Unable to load genre movies', error);
            return of([]);
          })
        );
      })
    ).subscribe(movies => {
      this.genreMovies = movies.slice(0, 6);
      this.changeDetector.markForCheck();
    });

    this.movieService.getGenres().pipe(
      catchError(error => {
        console.error('Unable to load genres', error);
        return of([]);
      })
    ).subscribe(genres => {
      this.genres = genres;
      this.changeDetector.markForCheck();
      this.loadGenreMovies(this.selectedGenre.id, this.selectedGenre.name);
    });
  }

  private refreshWatchHistory() {
    this.continueWatching = this.watchHistory.getMovies();
    this.changeDetector.markForCheck();
  }

  loadGenreMovies(id: number, name: string) {
    this.showGenreDropdown = false;
    this.genreSelection.next({ id, name });
  }

  openDetails(event: any) {
    const id = typeof event === 'number' ? event : event.id;
    const type = event.type || 'movie';
    this.overlayService.openDetails(id, type);
  }
}
