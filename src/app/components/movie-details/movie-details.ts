import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieService } from '../../services/movie';
import { OverlayStateService } from '../../services/overlay-state';
import { IconComponent } from '../icon/icon';
import { StarRatingComponent } from '../star-rating/star-rating';
import { catchError, filter, of, switchMap, timeout } from 'rxjs';

export interface MovieDetails {
  id: number;
  title: string;
  tagline: string;
  poster_path: string;
  release_date: string;
  runtime: number;
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
  
  movie: MovieDetails | null = null;
  cast: any[] = [];
  trailerUrl: SafeResourceUrl | null = null;
  showTrailerModal = false;
  loading = false;
  loadError = false;
  visible = false;
  saved = false;
  userRating = 0;

  ngOnInit() {
    this.overlayService.selectedMovieId$.pipe(
      filter((id): id is number => id !== null),
      switchMap(id => {
        this.visible = true;
        this.movie = null;
        this.cast = [];
        this.trailerUrl = null;
        this.loading = true;
        this.loadError = false;
        this.changeDetector.markForCheck();
        return this.movieService.getMovieDetails(id).pipe(
          timeout(10000),
          catchError(error => {
            console.error('Unable to load movie details', error);
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

  openTrailer() {
    this.showTrailerModal = true;
  }

  closeTrailer() {
    this.showTrailerModal = false;
  }

  watchMovie() {
    if (this.movie) {
      const movieId = this.movie.id;
      this.closeDetails();
      this.router.navigate(['/watch', movieId]);
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
    this.saved = !this.saved;
  }
}