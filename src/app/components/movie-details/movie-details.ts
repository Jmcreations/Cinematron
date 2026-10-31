import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieService } from '../../services/movie';
import { OverlayStateService, MediaSelection } from '../../services/overlay-state';
import { WatchlistService } from '../../services/watchlist';
import { IconComponent } from '../icon/icon';
import { StarRatingComponent } from '../star-rating/star-rating';
import { catchError, filter, of, switchMap, timeout } from 'rxjs';

export interface MediaDetails {
  id: number;
  title?: string;
  name?: string;
  tagline: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  overview: string;
  vote_average: number;
  genres: { name: string }[];
}

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, IconComponent, StarRatingComponent],
  templateUrl: './movie-details.html'
})
export class MovieDetailsComponent implements OnInit {
  movieService = inject(MovieService);
  overlayService = inject(OverlayStateService);
  sanitizer = inject(DomSanitizer);
  router = inject(Router);
  private changeDetector = inject(ChangeDetectorRef);
  private watchlistService = inject(WatchlistService);

  movie: MediaDetails | null = null;
  mediaType: 'movie' | 'tv' = 'movie'; // Track if it's a TV show or Movie
  cast: any[] = [];
  trailerUrl: SafeResourceUrl | null = null;

  showTrailerModal = false;
  loading = false;
  loadError = false;
  visible = false;
  saved = false;
  userRating = 0;

  ngOnInit() {
    this.overlayService.selectedMedia$.pipe(
      filter((media): media is MediaSelection => media !== null),
      switchMap(media => {
        this.visible = true;
        this.movie = null;
        this.cast = [];
        this.trailerUrl = null;
        this.loading = true;
        this.loadError = false;
        this.mediaType = media.type; // Save the type for routing
        this.changeDetector.markForCheck();

        // Fetch dynamically based on media type
        const fetchRequest$ = this.mediaType === 'tv'
          ? this.movieService.getTvDetails(media.id)
          : this.movieService.getMovieDetails(media.id);

        return fetchRequest$.pipe(
          timeout(10000),
          catchError(error => {
            console.error('Unable to load media details', error);
            this.loadError = true;
            return of(null);
          })
        );
      })
    ).subscribe({
      next: data => {
        if (!data) {
          this.loading = false;
          this.changeDetector.markForCheck();
          return;
        }

        this.movie = data;
        this.saved = this.watchlistService.hasMovie(data.id);
        this.cast = data.credits?.cast?.slice(0, 4) || [];
        this.loading = false;
        this.changeDetector.markForCheck();

        const trailer = data.videos?.results?.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer');
        if (trailer) {
          this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${trailer.key}?autoplay=1`);
        }
      },
    });
  }

  openTrailer() { this.showTrailerModal = true; }
  closeTrailer() { this.showTrailerModal = false; }

  watchMovie() {
    if (this.movie) {
      const mediaId = this.movie.id;
      this.closeDetails();
      // Pass the dynamic mediaType to the Watch component route
      this.router.navigate(['/watch', this.mediaType, mediaId]);
    }
  }

  closeDetails() {
    this.overlayService.setDetailsOpen(false);
    this.visible = false;
    this.movie = null;
    this.loading = false;
    this.showTrailerModal = false;
  }

  toggleSaved() {
    if (this.movie) {
      this.saved = this.watchlistService.toggleMovie(this.movie as any);
    }
  }
}
